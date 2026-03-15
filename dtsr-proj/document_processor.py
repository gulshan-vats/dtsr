import io
import PyPDF2
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from config import Config

class DocumentProcessor:
    """Handles extracting text from documents and chunking for vector storage."""
    
    @staticmethod
    def process_pdf(file_like):
        """
        Accepts any file-like object (BytesIO or Streamlit UploadedFile),
        extracts text, and returns a list of Langchain Document objects.
        """
        # Ensure we're at the start of the stream
        if hasattr(file_like, "seek"):
            file_like.seek(0)

        pdf_reader = PyPDF2.PdfReader(file_like)
        text = ""
        for page in pdf_reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"

        # Split the text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=Config.CHUNK_SIZE,
            chunk_overlap=Config.CHUNK_OVERLAP,
            length_function=len
        )
        chunks = text_splitter.split_text(text)

        # Get the source name from the .name attribute if available
        source_name = getattr(file_like, "name", "document.pdf")

        # Convert chunks into Langchain Document objects
        documents = [
            Document(page_content=chunk, metadata={"source": source_name})
            for chunk in chunks
        ]
        return documents
