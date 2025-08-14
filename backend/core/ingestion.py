# backend/core/ingestion.py

import uuid
import os
import shutil
import logging
import json
import re # <-- Import the regex library
from typing import List, Tuple, Dict, Any

from fastapi import UploadFile
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader, Docx2txtLoader, TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders.pdf import PyPDFLoader
from langchain_core.documents import Document
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from pydantic import BaseModel, Field

from chromadb.api import ClientAPI
from chromadb.utils.embedding_functions import EmbeddingFunction as ChromaEmbeddingFunctionBase

from ..dependencies import db_connector
from ..dependencies import llm_connector

# --- Configuration and Helpers ---
UPLOAD_DIR = "./data/uploaded_documents"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Custom class to make LangChain's embedding function compatible with ChromaDB
class ChromaEmbeddingFunction(ChromaEmbeddingFunctionBase):
    def __init__(self, model_name: str = "BAAI/bge-large-en-v1.5", device: str = 'cuda'):
        self._langchain_embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs={'device': device})
        self.model_name = model_name
        self.device = device

    def __call__(self, texts: List[str]) -> List[List[float]]:
        return self._langchain_embeddings.embed_documents(texts)
    
    def embed_query(self, query: str) -> List[float]:
        return self._langchain_embeddings.embed_query(query)
    
    def name(self):
        return self.model_name
    
def create_project_id() -> str:
    """Generates a unique project ID using UUID4."""
    return str(uuid.uuid4())

def get_document_loader(file_path: str):
    """Returns the correct LangChain document loader for a file."""
    file_extension = file_path.split('.')[-1].lower()
    if file_extension == 'pdf':
        return PyPDFLoader(file_path)
    elif file_extension == 'docx':
        return Docx2txtLoader(file_path)
    # Add more loaders for other file types here
    elif file_extension in ['txt', 'eml']:
        return TextLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

# --- Pydantic Schema for Knowledge Graph Output ---
class Entity(BaseModel):
    name: str = Field(..., description="The name of the entity.")
    type: str = Field(..., description="The type of the entity (e.g., Person, Organization, Clause).")

class Relationship(BaseModel):
    source: str = Field(..., description="The name of the source entity.")
    target: str = Field(..., description="The name of the target entity.")
    type: str = Field(..., description="The type of the relationship (e.g., AMENDS, REFERENCES, SIGNS).")

class KnowledgeGraph(BaseModel):
    entities: List[Entity] = Field(default_factory=list)
    relationships: List[Relationship] = Field(default_factory=list)

class KnowledgeGraphList(BaseModel):
    graphs: List[KnowledgeGraph] = Field(default_factory=list)

# --- Main Ingestion Pipeline ---
async def process_project(files: List[UploadFile]) -> Tuple[str, List[str]]:
    """
    Ingests and processes multiple documents for a new project.
    """
    project_id = create_project_id()
    project_path = os.path.join(UPLOAD_DIR, project_id)
    os.makedirs(project_path)
    
    saved_paths = []
    try:
        # Save uploaded files to a temporary directory
        for file in files:
            file_path = os.path.join(project_path, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_paths.append(file_path)

        logging.info(f"Saved {len(files)} documents for project {project_id}")

        # Load, split, and embed documents
        all_chunks = []
        for path in saved_paths:
            loader = get_document_loader(path)
            documents = loader.load()
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=2000,
                chunk_overlap=200,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            chunks = text_splitter.split_documents(documents)
            
            for chunk in chunks:
                chunk.metadata['project_id'] = project_id
                chunk.metadata['source_document'] = os.path.basename(path)
            
            all_chunks.extend(chunks)

        # Populate the databases
        await populate_vector_db(project_id, all_chunks)
        await populate_knowledge_graph(project_id, all_chunks)

        return project_id, [os.path.basename(path) for path in saved_paths]

    except Exception as e:
        logging.error(f"Error processing project {project_id}: {e}")
        if os.path.exists(project_path):
            shutil.rmtree(project_path)
        raise e

async def populate_vector_db(project_id: str, chunks: List[Document]) -> None:
    """Populates the ChromaDB vector store with document chunks."""
    try:
        chroma_client: ClientAPI = db_connector.get_chroma_client()
        if not chroma_client:
            raise ConnectionError("ChromaDB client is not connected.")
        
        embeddings = ChromaEmbeddingFunction()
        
        collection_name = f"project_{project_id}"
        collection = chroma_client.get_or_create_collection(name=collection_name, embedding_function=embeddings)
        
        collection.add(
            documents=[chunk.page_content for chunk in chunks],
            metadatas=[chunk.metadata for chunk in chunks],
            ids=[f"{project_id}_{i}" for i in range(len(chunks))]
        )
        
        # Add a verification step here
        count = collection.count()
        logging.info(f"ChromaDB collection '{collection_name}' populated with {count} documents.")
        
    except Exception as e:
        logging.error(f"Failed to populate ChromaDB: {e}")
        raise e

async def populate_knowledge_graph(project_id: str, chunks: List[Document]) -> None:
    """Populates the Neo4j knowledge graph with entities and relationships."""
    try:
        neo4j_driver = db_connector.get_neo4j_driver()
        if not neo4j_driver:
            raise ConnectionError("Neo4j driver is not connected.")

        # --- Rule-Based Extraction ---
        relationship_rules = {
            "amend": "AMENDS",
            "reference": "REFERENCES",
            "supersede": "SUPERSEDES",
            "made to the agreement": "AMENDS",
            "is governed by": "GOVERNED_BY",
            "this agreement and the": "REFERENCES"
        }
        
        document_names = {chunk.metadata['source_document'] for chunk in chunks}

        # First, create a node for the project and each document
        with neo4j_driver.session() as session:
            session.run("MERGE (p:Project {id: $id})", id=project_id)
            for doc_name in document_names:
                session.run(
                    "MERGE (d:Document {name: $name, project_id: $pid})",
                    name=doc_name,
                    pid=project_id
                )
                session.run(
                    """
                    MATCH (p:Project {id: $pid})
                    MATCH (d:Document {name: $dname})
                    MERGE (p)-[:CONTAINS_DOCUMENT]->(d)
                    """,
                    pid=project_id,
                    dname=doc_name
                )
        
        # Then, iterate through chunks to find relationships
        for chunk in chunks:
            chunk_text = chunk.page_content.lower()
            source_doc = chunk.metadata['source_document']
            
            for doc_name in document_names:
                if doc_name != source_doc and doc_name.lower() in chunk_text:
                    for keyword, rel_type in relationship_rules.items():
                        if keyword in chunk_text:
                            with neo4j_driver.session() as session:
                                session.run(
                                    """
                                    MATCH (s:Document {name: $sname, project_id: $pid})
                                    MATCH (t:Document {name: $tname, project_id: $pid})
                                    MERGE (s)-[:REL {type: $rel_type}]->(t)
                                    """,
                                    sname=source_doc,
                                    tname=doc_name,
                                    rel_type=rel_type,
                                    pid=project_id
                                )
        logging.info(f"Successfully populated Neo4j knowledge graph for project {project_id} using rules.")
    
    except Exception as e:
        logging.error(f"Failed to populate Neo4j: {e}")
        raise e