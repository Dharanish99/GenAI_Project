import React from "react";
import { useProject } from "../context/ProjectContext.jsx";
import { formatSize } from "../utils/format.js";
import UploadArea from "./UploadArea.jsx";
import TypeIcon from "./TypeIcon.jsx";

export default function FilesBar() {
  const { files, activeId, setActive, removeFile, clearAllFiles, projectId } = useProject();
  const active = files.find(f => f.id === activeId) || null;

  if (!files.length) {
    return (
      <div className="card fade-in">
        <div className="card-content">
          <h3 style={{ marginTop: 0 }}>Add documents to begin</h3>
          <p style={{ color: "var(--text-muted)" }}>
            Upload legal documents to start using AI-powered analysis features.
          </p>
        <UploadArea />
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in mb-6" role="region" aria-label="Active file bar">
      <div className="card-content">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {active ? (
              <>
                <TypeIcon type={active.type} name={active.name} />
                <div>
                  <div style={{ fontWeight: 600 }}>{active.name}</div>
                  <div className="file-meta">{formatSize(active.size)}</div>
                </div>
                {projectId && (
                  <span className="badge badge-success">Active</span>
                )}
              </>
            ) : (
              <div>
                <h4 style={{ margin: 0 }}>No active file selected</h4>
                <p style={{ margin: 0, color: "var(--text-muted)" }}>
                  Select a file to enable analysis features
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select 
              className="select" 
              value={activeId || ""} 
              onChange={e => setActive(e.target.value || null)} 
              aria-label="Switch active file"
              style={{ minWidth: "200px" }}
            >
              <option value="">Select a file...</option>
              {files.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            
            {active && (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => removeFile(active.id)} 
                aria-label={`Remove file ${active.name}`}
              >
                Remove
              </button>
            )}
            
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={async () => {
                if (confirm("Remove ALL files? This will clear your project.")) {
                  await clearAllFiles();
                }
              }} 
              aria-label="Remove all files"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}