import React, { useRef, useState } from "react";
import { isAllowedType } from "../utils/format.js";
import { useProject } from "../context/ProjectContext.jsx";

export default function UploadArea({ compact = false }) {
  const { uploadFiles, loading } = useProject();
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");

  const onFiles = async (list) => {
    try {
      if (!list || list.length === 0) {
        setErrors(['No files selected']);
        return;
      }

      const rejected = [];
      const accepted = [];
      
      for (const f of list) {
        try {
          if (!f || !f.name || !f.type) {
            rejected.push('Invalid file object');
            continue;
          }
          
          if (!isAllowedType(f.type, f.name)) {
            rejected.push(`${f.name}: unsupported file type`);
          } else {
            accepted.push(f);
          }
        } catch (fileError) {
          console.error('Error processing file:', f, fileError);
          rejected.push(`${f.name || 'Unknown file'}: processing error`);
        }
      }
      
      setErrors(rejected);
      setSuccess("");
      
      if (accepted.length) {
        try {
          const result = await uploadFiles(accepted);
          if (result.success) {
            setSuccess(`Successfully uploaded ${accepted.length} file(s)`);
            setTimeout(() => setSuccess(""), 5000);
          } else {
            setErrors(prev => [...prev, `Upload failed: ${result.error}`]);
          }
        } catch (error) {
          console.error('Upload error:', error);
          setErrors(prev => [...prev, `Upload failed: ${error.message || 'Unknown error'}`]);
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      setErrors(['An unexpected error occurred while processing files']);
    }
  };

  const openPicker = () => {
    try {
      if (inputRef.current) {
        inputRef.current.click();
      }
    } catch (error) {
      console.error('Error opening file picker:', error);
      setErrors(['Failed to open file picker']);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const handleFileInputChange = (e) => {
    try {
      if (e.target.files?.length) {
        onFiles(e.target.files);
      }
      // Reset the input value to allow selecting the same file again
      e.target.value = null;
    } catch (error) {
      console.error('File input change error:', error);
      setErrors(['Error reading selected files']);
    }
  };

  const handleDrop = (e) => {
    try {
      e.preventDefault();
      setDrag(false);
      if (e.dataTransfer.files?.length) {
        onFiles(e.dataTransfer.files);
      }
    } catch (error) {
      console.error('Drop error:', error);
      setErrors(['Error processing dropped files']);
    }
  };

  const handleDragOver = (e) => {
    try {
      e.preventDefault();
      setDrag(true);
    } catch (error) {
      console.error('Drag over error:', error);
    }
  };

  const handleDragLeave = () => {
    try {
      setDrag(false);
    } catch (error) {
      console.error('Drag leave error:', error);
    }
  };

  const handleKeyDown = (e) => {
    try {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    } catch (error) {
      console.error('Key down error:', error);
    }
  };

  return (
    <div 
      className={`upload-area card ${drag ? 'dragover' : ''} fade-in`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region" 
      aria-label="Upload documents area" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <input 
        ref={inputRef} 
        type="file" 
        multiple 
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
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
          .pdf .doc .docx .txt — No size limit
        </div>
      </div>
      
      {success && (
        <div style={{ marginTop: "1rem" }}>
          <div className="badge badge-success" role="alert">
            {success} - Choose a feature to get started!
          </div>
        </div>
      )}
      
      {errors.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Upload issues:</span>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={clearErrors}
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
            >
              Clear
            </button>
          </div>
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