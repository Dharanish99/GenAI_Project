# backend/dependencies/llm_connector.py

import os
import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

logger = logging.getLogger(__name__)

class LLMConnector:
    def __init__(self):
        self.llm: Optional[ChatOpenAI] = None
        self.rag_chain = None
        
    def initialize_llm(self):
        """Initialize the LLM connection"""
        try:
            # Get OpenAI API key from environment variables
            api_key = os.getenv("OPENAI_API_KEY")
            
            if not api_key:
                logger.warning("OPENAI_API_KEY not found. Using mock LLM for development.")
                self.llm = None
                return
            
            # Initialize OpenAI chat model
            self.llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.1,
                api_key=api_key
            )
            
            logger.info("Successfully initialized OpenAI LLM")
            
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
            self.llm = None
    
    def get_rag_chain(self):
        """Get or create RAG chain"""
        if not self.llm:
            logger.warning("LLM not initialized. Returning mock RAG chain.")
            return self._create_mock_rag_chain()
        
        if not self.rag_chain:
            self.rag_chain = self._create_rag_chain()
        
        return self.rag_chain
    
    def _create_rag_chain(self):
        """Create a RAG chain for document Q&A"""
        template = """You are a helpful legal document analysis assistant. 
        Answer the following question based on the provided context.
        
        Context: {context}
        Question: {question}
        
        Answer:"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = (
            {"context": RunnablePassthrough(), "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def _create_mock_rag_chain(self):
        """Create a mock RAG chain for development"""
        def mock_rag(question):
            return f"This is a mock response to: {question}. Please set up your OpenAI API key for real responses."
        
        return mock_rag
    
    async def run_query_with_rag(self, rag_chain, query: str, context: str = ""):
        """Run a query using the RAG chain"""
        try:
            if not context:
                context = "No specific context provided. Using general legal knowledge."
            
            if hasattr(rag_chain, 'invoke'):
                # Real RAG chain
                result = await rag_chain.ainvoke({"context": context, "question": query})
            else:
                # Mock RAG chain
                result = rag_chain(query)
            
            return result
            
        except Exception as e:
            logger.error(f"Error running RAG query: {e}")
            return f"Sorry, I encountered an error: {str(e)}"

# Create a global instance
llm_connector = LLMConnector()
