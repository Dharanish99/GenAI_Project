import React from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext.jsx";

export default function FeaturesShowcase() {
  const navigate = useNavigate();
  const { files } = useProject();

  const features = [
    {
      id: "simplify",
      title: "Simplify Clauses",
      description: "Transform complex legal language into clear, understandable terms",
      icon: "📝",
      route: "/simplify"
    },
    {
      id: "extract",
      title: "Extract Entities",
      description: "Identify and extract key entities like dates, amounts, and parties",
      icon: "🔍",
      route: "/extract-entities"
    },
    {
      id: "classify",
      title: "Classify Documents",
      description: "Automatically categorize documents by type and purpose",
      icon: "🏷️",
      route: "/classify"
    },
    {
      id: "qa",
      title: "Q&A Chat",
      description: "Ask questions about your documents and get instant AI answers",
      icon: "💬",
      route: "/qa"
    }
  ];

  const handleFeatureClick = (route) => {
    if (files.length === 0) {
      // If no files uploaded, show a message to upload first
      alert("Please upload documents first to use this feature!");
      return;
    }
    navigate(route);
  };

  return (
    <section className="features-showcase slide-up">
      <div className="section-header">
        <h2>Core Features</h2>
        {files.length === 0 ? (
          <p>Upload legal documents to unlock these powerful AI tools for document analysis</p>
        ) : (
          <p>With your documents uploaded, you can now use these powerful AI tools to analyze and understand your legal documents</p>
        )}
      </div>
      
      <div className="feature-grid">
        {features.map((feature) => (
          <div 
            key={feature.id}
            className={`feature-card stagger-item ${files.length === 0 ? 'disabled' : ''}`}
            onClick={() => handleFeatureClick(feature.route)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFeatureClick(feature.route);
              }
            }}
          >
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <div className="feature-arrow">→</div>
          </div>
        ))}
      </div>
      
      {files.length === 0 && (
        <div className="text-center" style={{ marginTop: "2rem" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            Upload your first document to get started
          </p>
        </div>
      )}
    </section>
  );
}
