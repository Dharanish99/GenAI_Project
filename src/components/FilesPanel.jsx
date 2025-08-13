import React from "react";
import { useNavigate } from "react-router-dom";
import { useFiles } from "../context/FilesContext.jsx";
import { formatSize } from "../utils/format.js";
import TypeIcon from "./TypeIcon.jsx";

export default function FilesPanel(){
  const { files, activeId, setActive, removeFile, clearAllFiles } = useFiles();
  const nav = useNavigate();
  const hasActive = !!activeId && files.some(f=>f.id===activeId);

  const goto = (path)=> nav(path);

  if (!files.length) return (
    <div className="card section reveal" role="region" aria-label="Empty files panel">
      <p style={{margin:0,color:"var(--muted)"}}>No files uploaded yet. Add some to enable features.</p>
    </div>
  );

  return (
    <>
      <div className="card section reveal">
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:8}}>
          <h3 style={{margin:0}}>Your Files</h3>
          <span className="badge">{files.length}</span>
          <div style={{marginLeft:"auto"}}>
            <button className="btn ghost" onClick={async ()=>{
              if (confirm("Remove all uploaded files? This clears local storage.")) await clearAllFiles();
            }} aria-label="Remove all files">Remove All</button>
          </div>
        </div>

        <div className="files-grid">
          {files.map(f=>(
            <article key={f.id} className="file-card card reveal" aria-label={`File ${f.name}`}>
              <TypeIcon type={f.type} name={f.name}/>
              <div className="file-body">
                <h4 className="file-name">{f.name}</h4>
                <div className="file-meta">{formatSize(f.size)}</div>
                <div className="file-actions">
                  <label className="btn muted" aria-label={`Set active file ${f.name}`}>
                    <input type="radio" name="activeFile" checked={f.id===activeId} onChange={()=>setActive(f.id)} style={{marginRight:8}}/>
                    Set Active
                  </label>
                  <button className="btn ghost" onClick={()=>removeFile(f.id)} aria-label={`Remove file ${f.name}`}>✕</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="features-cta">
          <button className="btn" disabled={!hasActive} onClick={()=>goto("/simplify")} aria-disabled={!hasActive}>Simplify Clauses</button>
          <button className="btn" disabled={!hasActive} onClick={()=>goto("/extract-entities")}>Extract Entities</button>
          <button className="btn" disabled={!hasActive} onClick={()=>goto("/classify")}>Classify Document</button>
          <button className="btn" disabled={!hasActive} onClick={()=>goto("/qa")}>Question & Answer</button>
        </div>
      </div>
    </>
  );
}