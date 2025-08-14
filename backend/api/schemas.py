# backend/api/schemas.py

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

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

# --- New Pydantic Schemas for LLM Outputs ---
class SimplifiedClause(BaseModel):
    """Schema for a simplified clause output."""
    original_text: str = Field(..., description="The original complex legal text.")
    simplified_text: str = Field(..., description="The rewritten, simplified text.")
    key_terms: List[str] = Field(..., description="A list of key terms found in the clause.")

class RiskAnalysis(BaseModel):
    """Schema for a risk analysis output."""
    clause_id: str
    risk_level: str = Field(..., description="Risk level (e.g., Low, Medium, High).")
    explanation: str = Field(..., description="Explanation of why the clause is a risk.")
    conflicts_with: List[str] = Field(..., description="List of other documents or clauses it conflicts with.")

class ClassificationOutput(BaseModel):
    """Schema for document classification output."""
    document_type: str = Field(..., description="The classified type of the legal document.")
    confidence_score: float = Field(..., description="A confidence score between 0 and 1.")