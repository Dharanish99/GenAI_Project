import React, { useRef, useState } from "react";
import { isAllowedType } from "../utils/format.js";
import { useFiles } from "../context/FilesContext.jsx";

const MAX_MB = 25;

export default function UploadArea({compact=false}){
  const { saveFiles } = useFiles();
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState([]);

  const onFiles = async (list)=>{
    const rejected = [];
    const accepted = [];
    for (const f of list){
      if (!isAllowedType(f.type, f.name)) rejected.push(`${f.name}: unsupported type`);
      else if (f.size > MAX_MB*1024*1024) rejected.push(`${f.name}: exceeds ${MAX_MB} MB`);
      else accepted.push(f);
    }
    if (rejected.length) setErrors(rejected);
    if (accepted.length) await saveFiles(accepted);
  };

  const openPicker = ()=> inputRef.current?.click();

  return (
    <div className={`upload card reveal ${drag?'dragover':''}`}
      onDragOver={e=>{e.preventDefault(); setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{
        e.preventDefault(); setDrag(false);
        if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
      }}
      role="region" aria-label="Upload documents area" tabIndex={0}
      onKeyDown={e=>{ if (e.key === "Enter" || e.key === " ") openPicker(); }}
    >
      <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt"
        onChange={e=>{ if (e.target.files?.length) onFiles(e.target.files); e.target.value=null; }} />
      <div>
        <h3 style={{margin:"0 0 8px"}}>Drag & drop files here</h3>
        <p style={{margin:0,opacity:.9}}>…or</p>
        <button className="btn" style={{marginTop:10}} onClick={openPicker} aria-label="Choose files to upload">Click to upload</button>
        <div style={{marginTop:8, color:"var(--muted)"}}>.pdf .doc .docx .txt — up to 25 MB each</div>
      </div>
      {errors.length>0 &&
        <div style={{marginTop:12}}>
          {errors.map((e,i)=><div key={i} className="badge" role="alert">{e}</div>)}
        </div>}
    </div>
  );
}