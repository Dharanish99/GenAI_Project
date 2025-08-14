# backend/api/routes.py

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List
from . import schemas
from ..core import ingestion, features
from ..dependencies import llm_connector

router = APIRouter()

# Global variable to store project IDs for this session
session_projects = {}

@router.post("/upload/", response_model=schemas.DocumentUploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Uploads 1 to 10 legal documents for a new project.
    """
    if not (1 <= len(files) <= 10):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload between 1 and 10 documents."
        )

    # Ingestion and processing logic (now fully implemented)
    project_id, processed_docs = await ingestion.process_project(files)
    session_projects[project_id] = processed_docs

    return schemas.DocumentUploadResponse(
        project_id=project_id,
        message="Documents uploaded and processed successfully.",
        processed_documents=processed_docs
    )

@router.post("/features/", status_code=status.HTTP_200_OK)
async def run_feature(request: schemas.FeatureRequest):
    """
    Runs a specific feature on an existing project.
    """
    if request.project_id not in session_projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )

    # Dispatch to the correct feature function based on the name
    if request.feature_name == "clause_simplification":
        result = await features.simplify_clauses(request.project_id)
        return {"feature_name": "clause_simplification", "result": result}
    elif request.feature_name == "document_classification":
        result = await features.classify_document(request.project_id)
        return {"feature_name": "document_classification", "result": result}
    elif request.feature_name == "risk_analysis":
        result = await features.analyze_risks(request.project_id)
        return {"feature_name": "risk_analysis", "result": result}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid feature name."
        )

@router.get("/diagram/{project_id}")
async def get_relationship_diagram(project_id: str):
    """
    Gets the relationship diagram data for a project.
    """
    if project_id not in session_projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )
    
    diagram_data = await features.get_relationship_diagram(project_id)
    return diagram_data

@router.post("/chatbot/", response_model=schemas.ChatQueryResponse)
async def ask_chatbot(request: schemas.ChatQueryRequest):
    """
    Answers a user query using the RAG chatbot.
    """
    if request.project_id not in session_projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )

    # Get the RAG chain and run the query
    rag_chain = llm_connector.get_rag_chain()
    if not rag_chain:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG chain not initialized. Please check backend logs."
        )

    # Correct way to invoke the RAG chain
    response = rag_chain.invoke({"query": request.query})
    
    # The response from the RAG chain is a dictionary
    answer = response.get('result', "Could not find an answer.")
    # You would need to parse this for source documents
    
    return schemas.ChatQueryResponse(
        answer=answer,
        source_documents=["document1.pdf", "document2.docx"] # Placeholder for now
    )