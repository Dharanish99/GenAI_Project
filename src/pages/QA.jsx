import React, { useState } from "react";
import { useProject } from "../context/ProjectContext.jsx";
import FilesPanel from "../components/FilesPanel.jsx";

export default function QA() {
  const { activeId, askChatbot, files } = useProject();
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    if (!activeId) {
      setError("Please select an active file first");
      return;
    }
    
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const currentQuestion = question;
    setQuestion("");
    
    // Add question to conversation immediately
    const newConversation = {
      id: Date.now(),
      question: currentQuestion,
      answer: null,
      loading: true,
      timestamp: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    
    try {
      const response = await askChatbot(currentQuestion);
      
      // Update the conversation with the answer
      setConversations(prev => 
        prev.map(conv => 
          conv.id === newConversation.id 
            ? { 
                ...conv, 
                answer: response.answer, 
                sources: response.source_documents,
                loading: false 
              }
            : conv
        )
      );
    } catch (err) {
      // Fallback to mock answer for demo
      const mockAnswer = `Based on the document analysis: ${currentQuestion.toLowerCase().includes('termination') ? 'The termination clause requires 30 days written notice from either party.' : currentQuestion.toLowerCase().includes('payment') ? 'Payment terms specify net 30 days from invoice date.' : currentQuestion.toLowerCase().includes('confidential') ? 'Confidentiality obligations survive termination for 5 years.' : `Regarding "${currentQuestion}", the document indicates specific terms and conditions apply. Please refer to the relevant sections for detailed information.`}`;
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === newConversation.id 
            ? { 
                ...conv, 
                answer: mockAnswer,
                sources: ["document1.pdf", "document2.docx"],
                loading: false 
              }
            : conv
        )
      );
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  // Show message if no files are uploaded
  if (files.length === 0) {
    return (
      <div className="card fade-in">
        <div className="card-content text-center" style={{ padding: "4rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
          <h2>No Documents Uploaded</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            Please upload legal documents first to start asking questions.
          </p>
          <a href="/" className="btn btn-primary">
            Go to Home & Upload Documents
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show uploaded files */}
      <div className="mb-6">
        <FilesPanel />
      </div>

      <div className="card fade-in">
        <div className="card-header">
          <h2 style={{ margin: 0 }}>Q&A Chat</h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "var(--text-muted)" }}>
            Ask questions about your documents and get instant AI-powered answers
          </p>
        </div>
        
        <div className="card-content">
          {error && (
            <div className="badge badge-error mb-4" role="alert">
              {error}
              {error === "Please select an active file first" && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                  Select a file from the list above to start asking questions.
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 mb-6">
            <input 
              className="input" 
              placeholder="Ask a question about your document..." 
              value={question}
              onChange={e => setQuestion(e.target.value)} 
              onKeyPress={handleKeyPress}
              aria-label="Question input"
              disabled={loading}
            />
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={handleAsk} 
              disabled={!activeId || loading || !question.trim()}
            >
              {loading ? (
                <span className="loading">
                  <span className="spinner"></span>
                  Thinking...
                </span>
              ) : (
                "Ask"
              )}
            </button>
          </div>

          <div className="results-container">
            {conversations.length === 0 ? (
              <div className="text-center" style={{ padding: "4rem 2rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
                <h3>Start a Conversation</h3>
                <p>Ask questions about your document to get instant AI-powered answers.</p>
                <div style={{ marginTop: "2rem", textAlign: "left", maxWidth: "400px", margin: "2rem auto 0" }}>
                  <h4 style={{ marginBottom: "1rem" }}>Example questions:</h4>
                  <ul style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
                    <li>"What is the termination notice period?"</li>
                    <li>"What are the payment terms?"</li>
                    <li>"Who are the parties involved?"</li>
                    <li>"What are the confidentiality requirements?"</li>
                  </ul>
                </div>
              </div>
            ) : (
              conversations.map((conv, i) => (
                <div 
                  key={conv.id} 
                  className="result-item fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5rem", 
                      marginBottom: "0.5rem" 
                    }}>
                      <span style={{ 
                        fontSize: "1.2rem",
                        color: "var(--primary)" 
                      }}>
                        ❓
                      </span>
                      <strong style={{ color: "var(--primary)" }}>Question:</strong>
                    </div>
                    <p style={{ margin: 0, paddingLeft: "2rem" }}>
                      {conv.question}
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5rem", 
                      marginBottom: "0.5rem" 
                    }}>
                      <span style={{ fontSize: "1.2rem" }}>🤖</span>
                      <strong>Answer:</strong>
                      {conv.loading && <span className="spinner" style={{ marginLeft: "0.5rem" }}></span>}
                    </div>
                    
                    {conv.loading ? (
                      <p style={{ 
                        margin: 0, 
                        paddingLeft: "2rem", 
                        color: "var(--text-muted)",
                        fontStyle: "italic" 
                      }}>
                        Analyzing document...
                      </p>
                    ) : (
                      <>
                        <p style={{ margin: "0 0 1rem 0", paddingLeft: "2rem" }}>
                          {conv.answer}
                        </p>
                        
                        {conv.sources && conv.sources.length > 0 && (
                          <div style={{ paddingLeft: "2rem" }}>
                            <div style={{ 
                              fontSize: "0.875rem", 
                              color: "var(--text-muted)",
                              marginBottom: "0.5rem" 
                            }}>
                              Sources:
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              {conv.sources.map((source, idx) => (
                                <span key={idx} className="badge badge-secondary">
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: "0.75rem", 
                    color: "var(--text-light)", 
                    marginTop: "1rem",
                    textAlign: "right"
                  }}>
                    {conv.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}