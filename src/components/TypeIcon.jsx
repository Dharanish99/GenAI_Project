import React from "react";
export default function TypeIcon({ type, name }) {
  const ext = (name?.split(".").pop() || "").toLowerCase();
  const label = ext.toUpperCase() || "FILE";
  
  const getIcon = () => {
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'txt': return '📃';
      default: return '📄';
    }
  };
  
  return (
    <div className="file-icon" aria-hidden title={`${label} file`}>
      <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
    </div>
  );
}