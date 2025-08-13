import React, { useState } from "react";
import FilesBar from "../components/FilesBar.jsx";
import { useFiles } from "../context/FilesContext.jsx";
import { getFileBlob } from "../utils/db.js";

export default function ExtractEntities(){
  const { activeId } = useFiles();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function runExtract(){
    if (!activeId) return;
    setLoading(true);
    const blob = await getFileBlob(activeId); void blob;
    await new Promise(r=>setTimeout(r, 900));
    setRows([
      {entity:"Acme Corp", type:"ORG", conf:"0.98", loc:"p.1"},
      {entity:"₹5,00,000", type:"MONEY", conf:"0.92", loc:"p.2"},
      {entity:"30 days", type:"DURATION", conf:"0.88", loc:"p.3"},
    ]);
    setLoading(false);
  }

  return (
    <>
      <FilesBar />
      <div className="card section reveal">
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
          <h3 style={{margin:0}}>Entities</h3>
          <button className="btn" onClick={runExtract} disabled={!activeId || loading}>
            {loading ? "Extracting…" : "Extract Entities"}
          </button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="table" aria-label="Entities table">
            <thead><tr><th>Entity</th><th>Type</th><th>Confidence</th><th>Location</th></tr></thead>
            <tbody>
              {rows.length===0 ? (
                <tr><td colSpan={4} style={{color:"var(--muted)"}}>No results yet.</td></tr>
              ) : rows.map((r,i)=>(
                <tr key={i}><td>{r.entity}</td><td>{r.type}</td><td>{r.conf}</td><td>{r.loc}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}