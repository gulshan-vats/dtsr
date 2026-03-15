# Research Paper Simplifier

A Streamlit-based web application designed to help users understand complex research papers by simplifying them and answering questions using a Retrieval-Augmented Generation (RAG) approach with Groq API.

## Overview

This project is an AI-powered tool that allows users to upload PDF research papers and ask questions about them. The system extracts text, chunks it, stores it in a FAISS vector database, and uses a Groq-powered LangChain model to provide simple, layman-friendly answers to the user's queries drawing directly from the context of the paper.

## Features

- **PDF Processing**: Upload research papers in PDF format. Text is automatically extracted and chunked.
- **Vector Search**: Utilizes FAISS and HuggingFace embeddings (`all-MiniLM-L6-v2`) for fast and accurate semantic search.
- **Conversational Interface**: A clean Streamlit chat interface matching your queries with document context.
- **Groq LLM**: Powered by `llama-3.1-8b-instant` via the Groq API for rapid, high-quality responses.
- **Grounded Answers**: The RAG pipeline ensures that answers are derived only from the provided research paper, preventing hallucinations.

## Prerequisites

- Python 3.8+
- [Groq API Key](https://console.groq.com/keys)

## Setup and Installation

1. **Clone or Download the Project.**

2. **Install Dependencies:**
   Ensure you have the required packages. Install them using `pip`:
   ```bash
   pip install streamlit langchain langchain-groq langchain-community PyPDF2 faiss-cpu sentence-transformers python-dotenv
   ```
   *(Ensure any other specific dependencies mapped in your environment are satisfied).*

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the Application:**
   Start the Streamlit development server by running:
   ```bash
   python -m streamlit run app.py
   ```
   If `streamlit` is already in your PATH, you can also run:
   ```bash
   streamlit run app.py
   ```

## Architecture

The project consists of several core modules:

- `app.py`: The main entry point. Initializes the Streamlit user interface, manages the session state, and orchestrates the file upload and chat workflows.
- `config.py`: Handles configuration management and loads environment variables, including model preferences and chunk settings.
- `document_processor.py`: Responsible for reading the PDF via `PyPDF2` and splitting the text into smaller chunks using LangChain's `RecursiveCharacterTextSplitter`.
- `vector_store.py`: Manages the FAISS vector database. It takes the text chunks, embeds them using HuggingFace's models, and makes them retrievable.
- `chat_engine.py`: Defines the RAG pipeline. Using `ChatGroq` and standard LangChain prompts, it simplifies user questions against the retrieved context from the vector database.

## Usage

1. Launch the app in your browser (usually at `http://localhost:8503` or similar).
2. Using the left sidebar, upload a PDF research paper.
3. Once processed, type your questions into the chat input bar at the bottom.
4. The system will retrieve relevant excerpts from the document and generate simplified, readable explanations.
