import React, { useState } from "react";
import FilesPanel from "../components/FilesPanel.jsx";
import { useProject } from "../context/ProjectContext.jsx";

export default function ExtractEntities() {
  const { activeId, runFeature, files } = useProject();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runExtract() {
    if (!activeId) {
      setError("Please select an active file first");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await runFeature("entity_extraction");
      setEntities(response.result.entities || []);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data for demo
      setEntities([
        { entity: "Acme Corporation", type: "ORGANIZATION", confidence: "0.98", location: "Page 1, Line 5" },
        { entity: "$500,000", type: "MONEY", confidence: "0.95", location: "Page 2, Line 12" },
        { entity: "30 days", type: "DURATION", confidence: "0.92", location: "Page 3, Line 8" },
        { entity: "John Smith", type: "PERSON", confidence: "0.89", location: "Page 1, Line 15" },
        { entity: "New York", type: "LOCATION", confidence: "0.94", location: "Page 4, Line 3" },
        { entity: "December 31, 2024", type: "DATE", confidence: "0.97", location: "Page 2, Line 20" },
      ]);
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
            Please upload legal documents first to start extracting entities.
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
              <h2 style={{ margin: 0 }}>Entity Extraction</h2>
              <p style={{ margin: "0.5rem 0 0 0", color: "var(--text-muted)" }}>
                Identify key entities, dates, amounts, and locations in your documents
              </p>
            </div>
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={runExtract} 
              disabled={!activeId || loading}
            >
              {loading ? (
                <span className="loading">
                  <span className="spinner"></span>
                  Extracting...
                </span>
              ) : (
                "Extract Entities"
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
          
          {entities.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table className="table" aria-label="Extracted entities table">
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Type</th>
                    <th>Confidence</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.map((entity, i) => (
                    <tr key={i} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <td style={{ fontWeight: 600 }}>{entity.entity}</td>
                      <td>
                        <span className="badge badge-secondary">
                          {entity.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          color: parseFloat(entity.confidence) > 0.9 ? 'var(--success)' : 
                                parseFloat(entity.confidence) > 0.8 ? 'var(--warning)' : 'var(--error)'
                        }}>
                          {(parseFloat(entity.confidence) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{entity.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center" style={{ padding: "4rem 2rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <h3>Ready to Extract</h3>
              <p>Click the "Extract Entities" button to identify key information in your document.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}