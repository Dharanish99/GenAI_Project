# backend/dependencies/db_connector.py

from neo4j import GraphDatabase, Driver
from chromadb import Client, Settings
from chromadb.utils.embedding_functions import EmbeddingFunction, SentenceTransformerEmbeddingFunction
from chromadb.api import ClientAPI
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging
import os
import chromadb
from chromadb.api import ClientAPI
from chromadb import HttpClient

# Pydantic model for loading database credentials from a .env file
class DBSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore'
    )

    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000
    
# Initialize global connection variables
neo4j_driver: Driver = None
chroma_client: ClientAPI = None
db_settings = DBSettings()

# ... (rest of the Neo4j functions are unchanged) ...
def connect_to_neo4j():
    """Connects to the Neo4j database."""
    global neo4j_driver
    try:
        neo4j_driver = GraphDatabase.driver(
            db_settings.NEO4J_URI,
            auth=(db_settings.NEO4J_USER, db_settings.NEO4J_PASSWORD)
        )
        neo4j_driver.verify_connectivity()
        logging.info("Connected to Neo4j successfully!")
    except Exception as e:
        logging.error(f"Failed to connect to Neo4j: {e}")
        neo4j_driver = None

def get_neo4j_driver():
    """Returns the Neo4j driver instance."""
    return neo4j_driver

def disconnect_from_neo4j():
    """Disconnects from the Neo4j database."""
    global neo4j_driver
    if neo4j_driver:
        neo4j_driver.close()
        logging.info("Disconnected from Neo4j.")


def connect_to_chroma():
    """Connects to the ChromaDB database."""
    global chroma_client
    try:
        # Use HttpClient to connect to the external server
        chroma_client = HttpClient(
            host=db_settings.CHROMA_HOST,
            port=db_settings.CHROMA_PORT,
        )
        # Ping the server to verify the connection
        chroma_client.heartbeat()
        logging.info("Connected to ChromaDB successfully!")
    except Exception as e:
        logging.error(f"Failed to connect to ChromaDB: {e}")
        chroma_client = None

def get_chroma_client():
    """Returns the ChromaDB client instance."""
    return chroma_client

def disconnect_from_chroma():
    """Disconnects from the ChromaDB database."""
    global chroma_client
    chroma_client = None
    logging.info("Disconnected from ChromaDB.")