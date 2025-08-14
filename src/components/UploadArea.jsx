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
      className={`upload-area-simple ${drag ? 'dragover' : ''}`}
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
      
      <div className="upload-icon-simple">
        📄
      </div>
      
      <div className="upload-content">
        <h3 className="upload-title">
          {loading ? "Uploading..." : "Drag & drop files here"}
        </h3>
        <p className="upload-subtitle">
          or click to browse
        </p>
        <button 
          className={`upload-button ${loading ? 'loading' : ''}`}
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
        <div className="upload-info">
          .pdf .doc .docx .txt — No size limit
        </div>
      </div>
      
      {success && (
        <div className="upload-success">
          <div className="success-message">
            {success} - Choose a feature to get started!
          </div>
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="upload-errors">
          <div className="errors-header">
            <span>Upload issues:</span>
            <button 
              className="clear-button" 
              onClick={clearErrors}
            >
              Clear
            </button>
          </div>
          {errors.map((e, i) => (
            <div key={i} className="error-message">
              {e}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .upload-area-simple {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          background: #ffffff;
          transition: all 0.2s ease;
          cursor: pointer;
          max-width: 500px;
          margin: 0 auto;
        }

        .upload-area-simple:hover {
          border-color: #9ca3af;
          background: #f9fafb;
        }

        .upload-area-simple.dragover {
          border-color: #6b7280;
          background: #f3f4f6;
          transform: scale(1.02);
        }

        .upload-icon-simple {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.7;
        }

        .upload-content {
          margin-bottom: 1rem;
        }

        .upload-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #374151;
        }

        .upload-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 1rem 0;
        }

        .upload-button {
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-button:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
        }

        .upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-info {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .upload-success {
          margin-top: 1rem;
        }

        .success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .upload-errors {
          margin-top: 1rem;
        }

        .errors-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .clear-button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .clear-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          margin: 0.25rem 0;
        }

        .loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}