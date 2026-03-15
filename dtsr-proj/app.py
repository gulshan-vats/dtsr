import streamlit as st
from document_processor import DocumentProcessor
from vector_store import VectorStoreManager
from chat_engine import ChatEngine

# Configure the Streamlit page
st.set_page_config(
    page_title="Research Paper Simplifier",
    page_icon="📖",
    layout="wide"
)

# Initialize Session State
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "chat_engine" not in st.session_state:
    st.session_state.chat_engine = None
if "current_file" not in st.session_state:
    st.session_state.current_file = None

st.title("📖 Research Paper Simplifier")
st.markdown("Upload a PDF research paper and ask questions to understand its core concepts in simple terms.")

# --- Sidebar: File Upload and Processing ---
with st.sidebar:
    st.header("Document Upload")
    uploaded_file = st.file_uploader("Upload a PDF document", type=["pdf"])
    
    if uploaded_file is not None:
        # Check if this is a new file
        if st.session_state.current_file != uploaded_file.name:
            with st.spinner("Processing document... this might take a moment."):
                try:
                    # 1. Process PDF into chunks
                    documents = DocumentProcessor.process_pdf(uploaded_file)
                    st.success(f"Extracted {len(documents)} text chunks.")
                    
                    # 2. Add to Vector Store
                    vs_manager = VectorStoreManager()
                    vs_manager.create_vector_store(documents)
                    retriever = vs_manager.get_retriever()
                    
                    # 3. Initialize Chat Engine
                    st.session_state.chat_engine = ChatEngine(retriever)
                    
                    # Reset chat state for new file
                    st.session_state.current_file = uploaded_file.name
                    st.session_state.chat_history = []
                    st.success("Document analyzed and ready for questions!")
                except Exception as e:
                    st.error(f"An error occurred: {e}")
            
# --- Main Area: Chat Interface ---
if st.session_state.chat_engine is None:
    st.info("Please upload a research paper from the sidebar to begin.")
else:
    # Display chat history
    for message in st.session_state.chat_history:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Handle user input
    if prompt := st.chat_input("Ask a question about the paper..."):
        # Add user message to state and display
        st.session_state.chat_history.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # Generate response using ChatEngine
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                try:
                    response_text = st.session_state.chat_engine.query(prompt)
                    st.markdown(response_text)
                    st.session_state.chat_history.append({"role": "assistant", "content": response_text})
                except Exception as e:
                    st.error(f"Error querying Groq: {e}")
