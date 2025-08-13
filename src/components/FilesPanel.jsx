import React from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext.jsx";
import { formatSize } from "../utils/format.js";
import TypeIcon from "./TypeIcon.jsx";

export default function FilesPanel() {
  const { files, activeId, setActive, removeFile, clearAllFiles, projectId } = useProject();
  const nav = useNavigate();
  const hasActive = !!activeId && files.some(f => f.id === activeId);

  const goto = (path) => nav(path);

  if (!files.length) {
    return (
      <div className="card fade-in" role="region" aria-label="Empty files panel">
        <div className="card-content text-center">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
          <h3>No files uploaded yet</h3>
          <p style={{ color: "var(--text-muted)" }}>
            Upload legal documents to start analyzing them with AI-powered tools.
          </p>
        </div>
      </div>
    );
  }
    </div>
  );

  return (
    <>
      <div className="card fade-in">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 style={{ margin: 0 }}>Your Documents</h3>
              <span className="badge badge-primary">{files.length}</span>
              {projectId && (
                <span className="badge badge-success">Project Active</span>
              )}
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={async () => {
                if (confirm("Remove all uploaded files? This will clear your project.")) {
                  await clearAllFiles();
                }
              }} 
              aria-label="Remove all files"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="card-content">
          <div className="file-grid">
            {files.map((f, index) => (
              <article 
                key={f.id} 
                className={`file-card card stagger-item`}
                style={{ animationDelay: `${index * 0.1}s` }}
                aria-label={`File ${f.name}`}
              >
                <TypeIcon type={f.type} name={f.name} />
                <div className="file-info">
                  <h4 className="file-name">{f.name}</h4>
                  <div className="file-meta">{formatSize(f.size)}</div>
                  <div className="file-actions">
                    <label className="btn btn-secondary btn-sm">
                      <input 
                        type="radio" 
                        name="activeFile" 
                        checked={f.id === activeId} 
                        onChange={() => setActive(f.id)} 
                        style={{ marginRight: "0.5rem" }}
                      />
                    Set Active
                  </label>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => removeFile(f.id)} 
                    aria-label={`Remove file ${f.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

        <div className="card-footer">
          <div className="feature-grid">
            <div 
              className={`feature-card ${!hasActive ? 'disabled' : ''}`}
              onClick={() => hasActive && goto("/simplify")}
            >
              <div className="feature-icon">✨</div>
              <h4>Simplify Clauses</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Convert complex legal language into plain English
              </p>
            </div>
            
            <div 
              className={`feature-card ${!hasActive ? 'disabled' : ''}`}
              onClick={() => hasActive && goto("/extract-entities")}
            >
              <div className="feature-icon">🔍</div>
              <h4>Extract Entities</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Identify key entities, dates, and amounts
              </p>
            </div>
            
            <div 
              className={`feature-card ${!hasActive ? 'disabled' : ''}`}
              onClick={() => hasActive && goto("/classify")}
            >
              <div className="feature-icon">📋</div>
              <h4>Classify Document</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Automatically categorize document types
              </p>
            </div>
            
            <div 
              className={`feature-card ${!hasActive ? 'disabled' : ''}`}
              onClick={() => hasActive && goto("/qa")}
            >
              <div className="feature-icon">💬</div>
              <h4>Q&A Chat</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Ask questions about your documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}