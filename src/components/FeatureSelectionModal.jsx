import React from "react";
import { useNavigate } from "react-router-dom";

export default function FeatureSelectionModal({ isOpen, onClose, uploadedFiles }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const features = [
    {
      id: "simplify",
      title: "Simplify Clauses",
      description: "Transform complex legal language into clear, understandable terms",
      icon: "📝",
      route: "/simplify",
      color: "var(--primary)"
    },
    {
      id: "extract",
      title: "Extract Entities",
      description: "Identify and extract key entities like dates, amounts, and parties",
      icon: "🔍",
      route: "/extract-entities",
      color: "var(--success)"
    },
    {
      id: "classify",
      title: "Classify Documents",
      description: "Automatically categorize documents by type and purpose",
      icon: "🏷️",
      route: "/classify",
      color: "var(--warning)"
    },
    {
      id: "qa",
      title: "Q&A Chat",
      description: "Ask questions about your documents and get instant AI answers",
      icon: "💬",
      route: "/qa",
      color: "var(--info)"
    }
  ];

  const handleFeatureClick = (route) => {
    onClose();
    navigate(route);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>What would you like to do with your documents?</h2>
          <button 
            className="modal-close" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="upload-summary">
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📄</div>
            <p style={{ margin: "0 0 1rem 0", color: "var(--text-muted)" }}>
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully!
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              {uploadedFiles.map((file, index) => (
                <span key={index} className="badge badge-secondary">
                  {file.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="feature-selection">
            <p style={{ 
              textAlign: "center", 
              margin: "1.5rem 0", 
              color: "var(--text-muted)",
              fontSize: "0.9rem"
            }}>
              Choose a feature to get started:
            </p>
            
            <div className="feature-grid-modal">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  className="feature-card-modal"
                  onClick={() => handleFeatureClick(feature.route)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFeatureClick(feature.route);
                    }
                  }}
                  style={{ borderLeft: `4px solid ${feature.color}` }}
                >
                  <div className="feature-icon-modal" style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <div className="feature-content">
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>
                      {feature.title}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "0.875rem", 
                      color: "var(--text-muted)",
                      lineHeight: "1.4"
                    }}>
                      {feature.description}
                    </p>
                  </div>
                  <div className="feature-arrow-modal" style={{ color: feature.color }}>
                    →
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn btn-ghost" 
              onClick={handleClose}
            >
              I'll choose later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
