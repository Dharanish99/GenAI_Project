import React from "react";
import { useFiles } from "../context/FilesContext.jsx";
import { formatSize } from "../utils/format.js";
import UploadArea from "./UploadArea.jsx";
import TypeIcon from "./TypeIcon.jsx";

export default function FilesBar(){
  const { files, activeId, setActive, removeFile, clearAllFiles } = useFiles();
  const active = files.find(f=>f.id===activeId) || null;

  if (!files.length){
    return (
      <div className="card section reveal">
        <h3 style={{marginTop:0}}>Add a document to begin</h3>
        <UploadArea />
      </div>
    );
  }

  return (
    <div className="filesbar card reveal" role="region" aria-label="Active file bar">
      {active ? (
        <>
          <TypeIcon type={active.type} name={active.name} />
          <div>
            <div style={{fontWeight:700}}>{active.name}</div>
            <div className="file-meta">{formatSize(active.size)}</div>
          </div>
        </>
      ) : <div>No active file selected.</div>}

      <div className="right">
        <select className="select" value={activeId || ""} onChange={e=>setActive(e.target.value || null)} aria-label="Switch active file">
          {files.map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        {active && <button className="btn ghost" onClick={()=>removeFile(active.id)} aria-label={`Remove file ${active.name}`}>Remove Active</button>}
        <button className="btn ghost" onClick={async ()=>{
          if (confirm("Remove ALL files?")) await clearAllFiles();
        }} aria-label="Remove all files">Remove All</button>
      </div>
    </div>
  );
}