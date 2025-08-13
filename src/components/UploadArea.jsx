import React, { useRef, useState } from "react";
import { isAllowedType } from "../utils/format.js";
import { useProject } from "../context/ProjectContext.jsx";

const MAX_MB = 25;

export default function UploadArea({ compact = false }) {
  const { uploadFiles, loading } = useProject();
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");

  const onFiles = async (list) => {
    const rejected = [];
    const accepted = [];
    
    for (const f of list) {
      if (!isAllowedType(f.type, f.name)) {
        rejected.push(`${f.name}: unsupported type`);
      } else if (f.size > MAX_MB * 1024 * 1024) {
        rejected.push(`${f.name}: exceeds ${MAX_MB} MB`);
      } else {
        accepted.push(f);
      }
    }
    
    setErrors(rejected);
    setSuccess("");
    
    if (accepted.length) {
      const result = await uploadFiles(accepted);
      if (result.success) {
        setSuccess(`Successfully uploaded ${accepted.length} file(s)`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setErrors(prev => [...prev, `Upload failed: ${result.error}`]);
      }
      else accepted.push(f);
    }
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div 
      className={`upload-area card ${drag ? 'dragover' : ''} fade-in`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files?.length) {
          onFiles(e.dataTransfer.files);
        }
      }}
      role="region" 
      aria-label="Upload documents area" 
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
    >
      <input 
        ref={inputRef} 
        type="file" 
        multiple 
        accept=".pdf,.doc,.docx,.txt"
        onChange={e => {
          if (e.target.files?.length) {
            onFiles(e.target.files);
          }
          e.target.value = null;
        }} 
      />
      
      <div className="upload-icon">
        📄
      </div>
      
      <div>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>
          {loading ? "Uploading..." : "Drag & drop files here"}
        </h3>
        <p style={{ margin: "0 0 1rem 0", color: "var(--text-muted)" }}>
          or click to browse
        </p>
        <button 
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          onClick={openPicker} 
          disabled={loading}
          aria-label="Choose files to upload"
        >
          {loading ? (
            <span className="loading">
              <span className="spinner"></span>
              Uploading...
            </span>
          ) : (
            "Choose Files"
          )}
        </button>
        <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--text-light)" }}>
          .pdf .doc .docx .txt — up to 25 MB each
        </div>
      </div>
      
      {success && (
        <div style={{ marginTop: "1rem" }}>
          <div className="badge badge-success" role="alert">
            {success}
          </div>
        </div>
      )}
      
      {errors.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          {errors.map((e, i) => (
            <div key={i} className="badge badge-error" role="alert" style={{ margin: "0.25rem" }}>
              {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}