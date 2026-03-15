"""
FastAPI server that wraps the RAG pipeline.
Exposes:
  POST /upload   – Process a PDF and build the vector store
  POST /chat     – Query the RAG chain (or general chat if no PDF uploaded)
  GET  /search   – Search for research papers via Semantic Scholar
  GET  /health   – Health check
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import io
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from config import Config

from vector_store import VectorStoreManager
from chat_engine import ChatEngine
from document_processor import DocumentProcessor
from supabase_client import supabase

app = FastAPI(title="Revio RAG API")

# Allow requests from the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory session — holds the active ChatEngine
_state: dict = {"chat_engine": None, "doc_name": None}

# Primary LLM for chat (Groq)
_llm = ChatGroq(
    model=Config.LLM_MODEL,
    groq_api_key=Config.GROQ_API_KEY,
    temperature=0.7,
)

# Groq LLM for task-specific work (like naming chats)
_groq_llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=Config.GROQ_API_KEY,
    temperature=0.3,
)


class NameChatRequest(BaseModel):
    first_message: str


class QueryRequest(BaseModel):
    query: str
    session_id: str
    user_id: str
    history: list[dict] = []
    system_prompt_suffix: Optional[str] = None  # Optional extra instructions (e.g. visualization rules)


@app.post("/name-chat")
def name_chat(req: dict):
    """
    Explicitly names a chat and saves it to the sessions table.
    """
    first_message = req.get("first_message")
    session_id = req.get("session_id")
    user_id = req.get("user_id")
    
    # Validate UUID
    import uuid
    try:
        uuid.UUID(str(user_id))
    except ValueError:
        print(f"DEBUG: Skipping naming storage for non-UUID user: {user_id}")
        return {"title": "New Research Chat"}
    
    try:
        prompt = f"Generate a concise, catchy title (max 4 words) for a research chat that starts with: '{first_message}'. Respond ONLY with the title."
        res = _groq_llm.invoke([HumanMessage(content=prompt)])
        title = res.content.strip().replace('"', '')
        
        # Upsert into sessions
        supabase.table("sessions").upsert({
            "id": session_id,
            "user_id": user_id,
            "title": title
        }).execute()
        
        return {"title": title}
    except Exception as e:
        print(f"DEBUG: Error naming chat: {e}")
        return {"title": "New Research Chat"}
@app.get("/health")
def health():
    return {"status": "ok", "document": _state.get("doc_name")}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accepts a PDF file, extracts text, creates a FAISS vector store,
    and initialises the ChatEngine.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    pdf_io = io.BytesIO(contents)
    pdf_io.name = file.filename  # type: ignore[attr-defined]

    try:
        documents = DocumentProcessor.process_pdf(pdf_io)
        vs = VectorStoreManager()
        vs.create_vector_store(documents)
        retriever = vs.get_retriever()
        _state["chat_engine"] = ChatEngine(retriever)
        _state["doc_name"] = file.filename
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": f"Processed {len(documents)} chunks from '{file.filename}'",
        "chunks": len(documents),
        "document": file.filename,
    }


@app.post("/chat")
def chat(req: QueryRequest):
    """
    If a document has been uploaded, runs the query through the RAG chain.
    Otherwise falls back to a general Groq chat response.
    """
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        is_web_mode = query.startswith("[WEB_MODE_ONLY]")
        if is_web_mode:
            query = query.replace("[WEB_MODE_ONLY]", "").strip()

        # 1. Fetch persistent history (Memory)
        db_history = []
        try:
            res = supabase.table("chat_messages")\
                .select("role, content")\
                .eq("session_id", req.session_id)\
                .order("created_at", desc=True)\
                .limit(10)\
                .execute()
            # Reverse to get chronological order
            db_history = res.data[::-1]
        except Exception as e:
            print(f"Error fetching history: {e}")

        # 1.5. Validate UUID for persistent storage
        import uuid
        is_authenticated = False
        try:
            uuid.UUID(str(req.user_id))
            is_authenticated = True
        except ValueError:
            print(f"DEBUG: Skipping storage for unauthenticated user: {req.user_id}")

        # 2. Save User Message
        if is_authenticated:
            try:
                print(f"DEBUG: Saving user message for session {req.session_id}")
                supabase.table("chat_messages").insert({
                    "user_id": req.user_id,
                    "session_id": req.session_id,
                    "role": "user",
                    "content": query
                }).execute()
            except Exception as e:
                print(f"DEBUG: Error saving user message: {e}")

        # 3. Combine provided history with DB history for context
        # We prioritize DB history if available
        context_history = db_history if db_history else req.history
        
        # Convert history dicts to LangChain messages
        history_msgs = []
        for msg in context_history:
            if msg["role"] == "user":
                history_msgs.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                history_msgs.append(AIMessage(content=msg["content"]))

        if _state["chat_engine"] and not is_web_mode:
            # RAG path
            response = _state["chat_engine"].query(
                query,
                chat_history=history_msgs,
                system_prompt_suffix=req.system_prompt_suffix,
            )
        else:
            # General chat or Web Mode
            system_rules = (
                "You are Revio, a precise and confident AI research assistant. Before responding, classify the user's message into one of three types:\n\n"
                "**TYPE A — CASUAL / GENERAL CHAT**\n"
                "Triggers: greetings, thanks, opinions, non-research questions. -> Respond naturally in plain text. NO selectors. NO search triggers.\n\n"
                "**TYPE B — CLEAR RESEARCH REQUEST**\n"
                "Triggers: specific paper title, author, DOI, or well-defined topic. -> Skip selector. Retrieve immediately with [SEARCH: query] and use 50/50 layout.\n\n"
                "**TYPE C — BROAD / AMBIGUOUS REQUEST**\n"
                "Triggers: vague topic where domain or intent is genuinely unclear. -> Emit ONLY the [OPTIONS: {...}] block. NO text before or after. The question goes in the 'title' field of the step. Never prefix options with numbers.\n"
                "CRITICAL: You may ONLY use TYPE C once at the very start of the session. NEVER ask follow-up questions. If the user has already answered a selector, ALWAYS proceed to search (TYPE B) or chat (TYPE A).\n\n"
                "Example CORRECT TYPE C response:\n"
                "[OPTIONS: {\"steps\": [{\"title\": \"Which field should I focus on?\", \"options\": [\"Astronomy\", \"Physics\"]}] }]\n\n"
                "Rules:\n"
                "- 50/50 LAYOUT: 3-5 sentence conversational summary in-chat + [SEARCH: query] for document panel.\n"
                "- PROACTIVE: If context is 80% clear, retrieve and proceed.\n"
                "- NO FOLLOW-UP QUESTIONS: Ask the question ONLY ONCE when the session starts. Never use follow-up questions again.\n"
                "- SELECTOR SUBMISSION: When you receive a message starting with \"User selections:\", convert the selected answers into a SIMPLE, comma-separated search query (3-5 keywords ONLY, NO parentheses, NO boolean operators like AND/OR). Trigger [SEARCH: keywords] immediately. ALWAYS ensure the closing bracket `]` is present. DO NOT ASK ANY MORE QUESTIONS.\n"
                "- WEB MODE: If [WEB_MODE_ONLY] is present, ignore document context.\n"
                "- PULL TO CHAT (WEB PAPER MODE): If context contains 'PAPER CONTEXT:', cite sections directly and follow the 🎯 Problem, 🔬 Method, 📊 Findings, ⚠️ Limitations, 💡 Impact format for summaries. Never trigger [SEARCH] while a paper is loaded.\n"
                "CRITICAL: Never list papers in chat text. Use [SEARCH]."
            )
            
            # Append any caller-supplied suffix (e.g. inline visualization rules from the frontend)
            if req.system_prompt_suffix:
                system_rules = system_rules + "\n\n" + req.system_prompt_suffix

            # Combine rules + history + latest query
            messages = [SystemMessage(content=system_rules)] + history_msgs + [HumanMessage(content=query)]
            
            result = _llm.invoke(messages)
            response = result.content

        # 4. Ensure session exists (Silent fallback)
        if is_authenticated:
            try:
                print(f"DEBUG: Checking/Ensuring session {req.session_id} exists")
                session_check = supabase.table("sessions").select("id").eq("id", req.session_id).execute()
                if not session_check.data:
                    print(f"DEBUG: Creating session record for {req.session_id}")
                    # Create session record with default title
                    supabase.table("sessions").insert({
                        "id": req.session_id,
                        "user_id": req.user_id,
                        "title": "New Research Chat"
                    }).execute()
            except Exception as e:
                print(f"DEBUG: Error ensuring session exists: {e}")

        # 5. Save Assistant Response
        if is_authenticated:
            try:
                supabase.table("chat_messages").insert({
                    "user_id": req.user_id,
                    "session_id": req.session_id,
                    "role": "assistant",
                    "content": response
                }).execute()
            except Exception as e:
                print(f"DEBUG: Error saving assistant response: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"response": response, "mode": "web" if is_web_mode else ("rag" if _state["chat_engine"] else "general")}


@app.get("/search")
async def search_papers(q: str, limit: int = 5):
    """
    Search for academic papers via OpenAlex and Core API.
    Returns title, year, citations, abstract and external URL.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    # We will primarily try OpenAlex, and use Core API as a fallback or supplement
    openalex_url = "https://api.openalex.org/works"
    # User's provided OpenAlex API Key/Email: VuqEIDxnN4aHfGISL9p7p3 (This looks like a Politécnico or specific institutional key/email, usually OpenAlex just takes a polite mailto in the user-agent or a key if premium. Let's pass it as a parameter if it's an API key)
    # Actually, OpenAlex premium configures via `api_key` param. Core API uses `api_key` or `Authorization: Bearer`.
    
    # Format the query for OpenAlex (default search searches across title, abstract, full text)
    openalex_params = {
        "search": q,
        "per-page": min(limit, 10),
        "mailto": "VuqEIDxnN4aHfGISL9p7p3@example.com", # If it's a polite pool ID
        "api_key": "VuqEIDxnN4aHfGISL9p7p3" # Injecting as key just in case it's a premium token
    }

    core_api_key = "nkhQqvmjTZg0AKCVRdGSDOucreXEpy8b"
    core_url = "https://api.core.ac.uk/v3/search/works"
    
    papers = []
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # Try OpenAlex First
            res = await client.get(openalex_url, params=openalex_params)
            res.raise_for_status()
            data = res.json()
            
            for p in data.get("results", []):
                # Extract Authors
                authors = []
                for authorship in p.get("authorships", [])[:3]:
                    author_name = authorship.get("author", {}).get("display_name")
                    if author_name:
                        authors.append(author_name)
                
                # Extract Abstract (OpenAlex returns abstract_inverted_index)
                abstract = ""
                inverted_index = p.get("abstract_inverted_index")
                if inverted_index:
                    # Reconstruct abstract from inverted index
                    words = []
                    max_idx = max([max(positions) for positions in inverted_index.values()] + [-1])
                    if max_idx >= 0:
                        words = [""] * (max_idx + 1)
                        for word, positions in inverted_index.items():
                            for pos in positions:
                                words[pos] = word
                        abstract = " ".join(words).strip()
                
                papers.append({
                    "id": p.get("id", "").split("/")[-1],
                    "title": p.get("display_name") or p.get("title", "Untitled"),
                    "year": p.get("publication_year"),
                    "citations": p.get("cited_by_count", 0),
                    "abstract": abstract[:500] + "..." if len(abstract) > 500 else abstract,
                    "authors": authors,
                    "url": p.get("doi") or p.get("id", ""),
                })
                
        except Exception as e:
            print(f"OpenAlex Error: {e}, falling back to Core API...")
            # Fallback to Core API
            core_headers = {"Authorization": f"Bearer {core_api_key}"}
            core_params = {
                "q": q,
                "limit": min(limit, 10)
            }
            try:
                core_res = await client.get(core_url, headers=core_headers, params=core_params)
                core_res.raise_for_status()
                core_data = core_res.json()
                
                for p in core_data.get("results", []):
                    authors = [a.get("name") for a in p.get("authors", []) if a.get("name")][:3]
                    papers.append({
                        "id": p.get("id", ""),
                        "title": p.get("title", "Untitled"),
                        "year": p.get("yearPublished") or p.get("publishedDate", "")[:4],
                        "citations": p.get("citationCount", 0),
                        "abstract": (p.get("abstract") or "")[:500],
                        "authors": authors,
                        "url": p.get("downloadUrl") or p.get("sourceFulltextUrls", [""])[0],
                    })
            except Exception as core_e:
                raise HTTPException(status_code=502, detail=f"Search APIs failed. Core Error: {str(core_e)}")

    # Deduplicate and limit
    unique_papers = []
    seen_titles = set()
    for p in papers:
        title_lower = str(p.get("title", "")).lower().strip()
        if title_lower not in seen_titles and title_lower != "untitled":
            seen_titles.add(title_lower)
            unique_papers.append(p)
            
    return {"query": q, "results": unique_papers[:limit]}


class FeedbackRequest(BaseModel):
    query: str
    response: str
    rating: str  # 'like' or 'dislike'


@app.post("/feedback")
def feedback(req: FeedbackRequest):
    """
    Persists user feedback for AI responses.
    """
    import json
    from datetime import datetime
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "query": req.query,
        "response": req.response,
        "rating": req.rating
    }
    
    with open("feedback.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")
        
    return {"status": "recorded"}
