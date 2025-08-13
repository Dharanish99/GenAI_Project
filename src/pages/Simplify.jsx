import React, { useState } from "react";
import FilesPanel from "../components/FilesPanel.jsx";
import { useProject } from "../context/ProjectContext.jsx";

export default function Simplify() {
  const { activeId, runFeature, files } = useProject();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function runSimplify() {
    if (!activeId) {
      setError("Please select an active file first");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await runFeature("clause_simplification");
      setResult(response.result);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data for demo
      setResult({
        original: "1. The Parties agree to maintain confidentiality of all proprietary information disclosed during the term of this Agreement.\n2. This Agreement shall commence on the Effective Date and shall continue until terminated by either party with thirty (30) days written notice.",
        simplified: "1. Both parties must keep shared private information secret during this agreement.\n2. This agreement starts now and ends when either party gives 30 days written notice to quit."
      });
    } finally {
      setLoading(false);
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
            Please upload legal documents first to start simplifying clauses.
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
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ margin: 0 }}>Clause Simplification</h2>
              <p style={{ margin: "0.5rem 0 0 0", color: "var(--text-muted)" }}>
                Convert complex legal language into plain English
              </p>
            </div>
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={runSimplify} 
              disabled={!activeId || loading}
            >
              {loading ? (
                <span className="loading">
                  <span className="spinner"></span>
                  Simplifying...
                </span>
              ) : (
                "Simplify Clauses"
              )}
            </button>
          </div>
        </div>
        
        <div className="card-content">
          {error && (
            <div className="badge badge-error mb-4" role="alert">
              {error}
            </div>
          )}
          
          {result ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <h3 style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>Original</h3>
                <textarea 
                  className="textarea" 
                  style={{ minHeight: "300px" }} 
                  readOnly 
                  value={result.original || "No original text available"} 
                  aria-label="Original Clauses"
                />
              </div>
              <div>
                <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Simplified</h3>
                <textarea 
                  className="textarea" 
                  style={{ minHeight: "300px", borderColor: "var(--primary)" }} 
                  readOnly 
                  value={result.simplified || "No simplified text available"} 
                  aria-label="Simplified Clauses"
                />
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ padding: "4rem 2rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
              <h3>Ready to Simplify</h3>
              <p>Click the "Simplify Clauses" button to convert complex legal language into plain English.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}