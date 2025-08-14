# backend/core/features.py

import logging
from typing import Dict, Any, List
from neo4j import Driver
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from ..dependencies import db_connector, llm_connector
from chromadb import ClientAPI
from chromadb.utils.embedding_functions import EmbeddingFunction as ChromaEmbeddingFunctionBase
from langchain_community.embeddings import HuggingFaceEmbeddings
# Import JsonOutputParser
from langchain_core.output_parsers import JsonOutputParser
# Import the schemas from the central location
from ..api.schemas import SimplifiedClause, RiskAnalysis, ClassificationOutput


# --- Feature Implementations ---

async def simplify_clauses(project_id: str) -> List[Dict[str, Any]]:
    """Simplifies all clauses in a project and returns a list of results."""
    logging.info(f"Simplifying clauses for project {project_id}...")

    chroma_client: ClientAPI = db_connector.get_chroma_client()
    if not chroma_client:
        raise ValueError("ChromaDB client not initialized.")

    collection_name = f"project_{project_id}"
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except Exception:
        raise ValueError(f"Collection for project {project_id} not found.")

    retrieved_chunks = collection.get(include=['metadatas', 'documents'])
    all_chunks_text = retrieved_chunks['documents']

    llm = llm_connector.get_llm_for_entity_extraction()
    if not llm:
        raise ValueError("LLM not initialized.")

    simplified_results = []

    parser = JsonOutputParser(pydantic_object=SimplifiedClause)

    simplification_prompt = PromptTemplate(
        template="""You are an expert at rewriting legal text into simple, easy-to-understand language.
        Rewrite the following legal clause in a way that a non-lawyer can comprehend.
        Also, extract a list of 5 key terms.
        Strictly format your response as a JSON object with the following keys:
        "original_text", "simplified_text", and "key_terms".
        Format Instructions:
        {format_instructions}

        Legal Clause: {text}
        """,
        input_variables=["text"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    try:
        for chunk_text in all_chunks_text:
            llm_response = llm.invoke(simplification_prompt.format(text=chunk_text))

            simplified_output = parser.parse(llm_response)

            if hasattr(simplified_output, "dict"):
                simplified_results.append(simplified_output.dict())
            else:
                simplified_results.append(simplified_output)

    except Exception as e:
        logging.error(f"Error simplifying a clause in batch: {e}")
        simplified_results.extend([
            {
                "original_text": text,
                "simplified_text": "Error: Could not simplify this clause.",
                "key_terms": []
            }
            for text in all_chunks_text
        ])

    return simplified_results


async def classify_document(project_id: str) -> Dict[str, Any]:
    """Classifies a document's type and returns the result."""
    logging.info(f"Classifying documents for project {project_id}...")
    
    chroma_client: ClientAPI = db_connector.get_chroma_client()
    if not chroma_client:
        raise ValueError("ChromaDB client not initialized.")
    
    collection_name = f"project_{project_id}"
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except Exception as e:
        raise ValueError(f"Collection for project {project_id} not found.")

    # Retrieve all document chunks and join them into a single string
    retrieved_chunks = collection.get(include=['metadatas', 'documents'])
    all_chunks_text = retrieved_chunks['documents']
    document_text = " ".join(all_chunks_text)
    
    llm = llm_connector.get_llm_for_entity_extraction()
    if not llm:
        raise ValueError("LLM not initialized.")

    classification_prompt = PromptTemplate(
        template="""You are a legal expert. Read the following document and classify it into one of these categories:
        ['NDA', 'Lease', 'Employment Contract', 'Service Agreement', 'Other'].
        Return only the category name as a string, with no extra text or punctuation.

        Document text: {text}
        """,
        input_variables=["text"]
    )
    
    classification_result = llm.invoke(classification_prompt.format(text=document_text))
    
    # You would need to parse this string output and assign a confidence score
    return {"document_type": classification_result, "confidence_score": 0.95}


async def get_relationship_diagram(project_id: str) -> Dict[str, Any]:
    """
    Queries the Neo4j knowledge graph and returns a structured representation
    for the frontend to visualize.
    """
    logging.info(f"Generating relationship diagram for project {project_id}...")
    neo4j_driver = db_connector.get_neo4j_driver()
    if not neo4j_driver:
        raise ConnectionError("Neo4j driver is not connected.")
    
    # Cypher query to get all nodes and relationships for a project
    cypher_query = f"""
    MATCH (p:Project {{id: '{project_id}'}})-[r]-(n)
    RETURN p, r, n
    """
    
    nodes, relationships = [], []
    with neo4j_driver.session() as session:
        result = session.run(cypher_query)
        # You'll process the result to build a JSON object the frontend can use
        # This is a conceptual loop
        for record in result:
            nodes.append(record['n'])
            relationships.append(record['r'])

    return {"nodes": nodes, "relationships": relationships}


async def analyze_risks(project_id: str) -> List[Dict[str, Any]]:
    """Analyzes a project's documents for potential risks."""
    logging.info(f"Running risk analysis for project {project_id}...")
    
    rag_chain = llm_connector.get_rag_chain()
    if not rag_chain:
        raise ValueError("RAG chain not initialized.")

    risk_results = []
    
    # 1. We'll need to retrieve all chunks for the project
    # This is a conceptual query, you'll need to refine it.
    
    risk_query = """
    Analyze the provided documents for any clauses that contain contradictory
    terms, ambiguous language, or assign an unusually high level of risk to one party.
    Identify any clauses that conflict with other clauses in the same or different documents.
    For each identified issue, provide an explanation.
    """
    
    # Corrected line: remove the await keyword
    risk_output = rag_chain.invoke({"query": risk_query, "project_id": project_id})
    
    # The response from the RAG chain is a dictionary
    answer = risk_output.get('result', "Could not find an answer.")
    
    # You will need to parse this output into a structured format
    risk_results.append({"risk_level": "High", "explanation": answer})
    
    return risk_results