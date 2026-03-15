from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import Config

class VectorStoreManager:
    """Manages the FAISS vector database and embeddings."""
    
    def __init__(self):
        # Initialize the embedding model specifically configured
        self.embeddings = HuggingFaceEmbeddings(
            model_name=Config.EMBEDDING_MODEL
        )
        self.vector_store = None
        
    def create_vector_store(self, documents):
        """
        Creates a FAISS vector store from a list of documents.
        Returns the created vector store.
        """
        if not documents:
            raise ValueError("No documents provided to create vector store.")
            
        self.vector_store = FAISS.from_documents(documents, self.embeddings)
        return self.vector_store
        
    def get_retriever(self, k=4):
        """
        Returns a retriever interface for the underlying vector store.
        """
        if self.vector_store is None:
            raise RuntimeError("Vector store has not been initialized. Please create it first.")
        
        return self.vector_store.as_retriever(search_kwargs={"k": k})
