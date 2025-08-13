import React, { useState } from "react";
import FilesBar from "../components/FilesBar.jsx";
import { useFiles } from "../context/FilesContext.jsx";
import { getFileBlob } from "../utils/db.js";

export default function Classify(){
  const { activeId } = useFiles();
  const [label, setLabel] = useState("—");
  const [loading, setLoading] = useState(false);

  async function runClassify(){
    if (!activeId) return;
    setLoading(true);
    const blob = await getFileBlob(activeId); void blob;
    await new Promise(r=>setTimeout(r, 900));
    const types = ["NDA","MSA","Employment Agreement","Privacy Policy","SaaS Agreement"];
    setLabel(types[Math.floor(Math.random()*types.length)]);
    setLoading(false);
  }

  return (
    <>
      <FilesBar />
      <div className="card section reveal">
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <span className="badge" aria-live="polite" aria-atomic="true" style={{fontWeight:700, fontSize:"1rem"}}>{label}</span>
          <button className="btn" onClick={runClassify} disabled={!activeId || loading}>
            {loading ? "Classifying…" : "Re-run Classification"}
          </button>
        </div>
      </div>
    </>
  );
}