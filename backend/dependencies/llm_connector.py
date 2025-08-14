import logging
from typing import Optional
from langchain_community.llms import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline, BitsAndBytesConfig
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import Runnable
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from pydantic_settings import BaseSettings, SettingsConfigDict
from ..core import ingestion
from chromadb.api import ClientAPI
from chromadb.utils.embedding_functions import EmbeddingFunction as ChromaEmbeddingFunctionBase
import torch

# --- Pydantic model for loading LLM API keys from a .env file ---
class LLMSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore'
    )
    VECTOR_DB_PATH: str = "./data/vector_db"
    
llm_settings = LLMSettings()

# --- Global LLM and RAG chain variables ---
local_llm: HuggingFacePipeline = None
rag_chain: Optional[Runnable] = None
vector_store: Optional[Chroma] = None

# Custom class to make LangChain's embedding function compatible with ChromaDB
class ChromaEmbeddingFunction(ChromaEmbeddingFunctionBase):
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2", device: str = 'cuda'):
        self._langchain_embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs={'device': device})
        self.model_name = model_name
        self.device = device

    def __call__(self, texts: list[str]) -> list[list[float]]:
        return self._langchain_embeddings.embed_documents(texts)
    
    def embed_query(self, query: str) -> list[float]:
        return self._langchain_embeddings.embed_query(query)
    
    def name(self):
        return self.model_name

def get_llm_for_entity_extraction() -> Optional[HuggingFacePipeline]:
    """Returns a new LLM instance for entity extraction tasks."""
    if not local_llm:
        initialize_llm() # Ensure LLM is initialized
    return local_llm

def initialize_llm():
    """Initializes the local LLM and the RAG chain."""
    global local_llm, rag_chain, vector_store
    
    try:
        # 1. Initialize the local LLM using Hugging Face
        model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        
        nf4_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.bfloat16
        )

        tokenizer = AutoTokenizer.from_pretrained(model_id)
        model = AutoModelForCausalLM.from_pretrained(
            model_id, 
            device_map="auto",
            torch_dtype=torch.float16,
            quantization_config=nf4_config
        )
        
        pipe = pipeline(
            "text-generation", 
            model=model, 
            tokenizer=tokenizer, 
            max_new_tokens=512, 
            temperature=0.2
        )
        local_llm = HuggingFacePipeline(pipeline=pipe)
        
        logging.info(f"Local LLM '{model_id}' initialized successfully!")

        # 2. Initialize the embedding model and vector store
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2", model_kwargs={'device': 'cuda'})
        vector_store = Chroma(
            persist_directory=llm_settings.VECTOR_DB_PATH,
            embedding_function=embeddings
        )
        
        # 3. Define the RAG prompt template
        rag_prompt = PromptTemplate(
            template=(
                "Context: {context}\n\n"
                "Question: {question}\n\n"
                "Helpful Answer:"
            ),
            input_variables=["context", "question"]
        )
        
        # 4. Create the Retrieval-Augmented Generation (RAG) chain
        rag_chain = RetrievalQA.from_chain_type(
            llm=local_llm,
            chain_type="stuff",
            retriever=vector_store.as_retriever(),
            chain_type_kwargs={"prompt": rag_prompt}
        )
        logging.info("RAG chain initialized.")

    except Exception as e:
        logging.error(f"Failed to initialize LLM or RAG chain: {e}")
        local_llm = None
        rag_chain = None

def get_rag_chain() -> Optional[Runnable]:
    """Returns the initialized RAG chain."""
    if not rag_chain:
        initialize_llm()
    return rag_chain