# backend/api/schemas.py

from pydantic import BaseModel
from typing import List

class DocumentUploadResponse(BaseModel):
    """
    Schema for the response after documents have been uploaded and processed.
    """
    project_id: str
    message: str
    processed_documents: List[str]

class ChatQueryRequest(BaseModel):
    """
    Schema for a user's chat query.
    """
    project_id: str
    query: str

class ChatQueryResponse(BaseModel):
    """
    Schema for the chatbot's response.
    """
    answer: str
    source_documents: List[str]

class FeatureRequest(BaseModel):
    """
    Schema for a request to run a specific feature (e.g., Simplification, Classification).
    """
    project_id: str
    feature_name: str
    # Add optional parameters for a specific feature, if needed
    # clause_id: Optional[str] = None