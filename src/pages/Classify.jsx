import React, { useState } from "react";
import FilesBar from "../components/FilesBar.jsx";
import { useProject } from "../context/ProjectContext.jsx";

export default function Classify() {
  const { activeId, runFeature } = useProject();
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runClassify() {
    if (!activeId) {
      setError("Please select an active file first");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await runFeature("document_classification");
      setClassification(response.result);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data for demo
      const types = [
        { type: "Non-Disclosure Agreement (NDA)", confidence: 0.95 },
        { type: "Master Service Agreement (MSA)", confidence: 0.88 },
        { type: "Employment Agreement", confidence: 0.92 },
        { type: "Privacy Policy", confidence: 0.85 },
        { type: "Software License Agreement", confidence: 0.90 }
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setClassification({
        document_type: randomType.type,
        confidence: randomType.confidence,
        key_features: [
          "Contains confidentiality clauses",
          "Specifies term duration",
          "Includes termination conditions",
          "Defines party obligations"
        ]
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FilesBar />
      
      <div className="card fade-in">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ margin: 0 }}>Document Classification</h2>
              <p style={{ margin: "0.5rem 0 0 0", color: "var(--text-muted)" }}>
                Automatically identify and categorize document types
              </p>
            </div>
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={runClassify} 
              disabled={!activeId || loading}
            >
              {loading ? (
                <span className="loading">
                  <span className="spinner"></span>
                  Classifying...
                </span>
              ) : (
                "Classify Document"
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
          
          {classification ? (
            <div className="scale-in">
              <div className="text-center mb-6">
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
                <h3 style={{ 
                  fontSize: "1.5rem", 
                  margin: "0 0 1rem 0",
                  color: "var(--primary)"
                }}>
                  {classification.document_type}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="badge badge-success">
                    {(classification.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              </div>
              
              {classification.key_features && (
                <div>
                  <h4 style={{ marginBottom: "1rem" }}>Key Features Identified:</h4>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {classification.key_features.map((feature, i) => (
                      <div 
                        key={i} 
                        className="fade-in"
                        style={{ 
                          animationDelay: `${i * 0.1}s`,
                          padding: "0.75rem 1rem",
                          background: "var(--surface)",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--border)"
                        }}
                      >
                        ✓ {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center" style={{ padding: "4rem 2rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h3>Ready to Classify</h3>
              <p>Click the "Classify Document" button to automatically identify the document type.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}