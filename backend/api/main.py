# backend/api/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import routes
from ..dependencies import db_connector, llm_connector
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)

# Initialize FastAPI app
app = FastAPI(
    title="ClauseWise Backend API",
    description="Backend for a multi-document legal analysis tool.",
    version="0.1.0",
)

# Configure CORS settings for the frontend
origins = [
    "http://localhost:3000",  # Your frontend's development URL
    "http://localhost:5173",  # Vite frontend development URL
    "http://localhost:8000",  # Default FastAPI docs
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to databases on startup and disconnect on shutdown
@app.on_event("startup")
async def startup_event():
    logging.info("Connecting to databases...")
    db_connector.connect_to_neo4j()
    db_connector.connect_to_chroma()
    # Add this line to initialize the LLM and RAG chain
    llm_connector.initialize_llm()

@app.on_event("shutdown")
def shutdown_event():
    logging.info("Disconnecting from databases...")
    db_connector.disconnect_from_neo4j()
    db_connector.disconnect_from_chroma()

# Include API routes from the routes.py file
app.include_router(routes.router)