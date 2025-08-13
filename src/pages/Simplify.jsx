import React, { useState } from "react";
import FilesBar from "../components/FilesBar.jsx";
import { useFiles } from "../context/FilesContext.jsx";
import { getFileBlob } from "../utils/db.js";

export default function Simplify(){
  const { activeId } = useFiles();
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState("— Original clauses preview will appear here —");
  const [simple, setSimple] = useState("");

  async function runSimplify(){
    if (!activeId) return;
    setLoading(true);
    const blob = await getFileBlob(activeId); // fetched but unused in mock
    void blob;
    await new Promise(r=>setTimeout(r, 900));
    setOriginal(`1. The Parties agree to maintain confidentiality...\n2. This Agreement shall commence on...`);
    setSimple(`1) Keep shared info private unless allowed.\n2) The agreement starts now and ends when either side quits.`);
    setLoading(false);
  }

  return (
    <>
      <FilesBar />
      <div className="card section reveal">
        <div className="columns">
          <textarea className="input" style={{minHeight:240}} readOnly value={original} aria-label="Original Clauses"/>
          <textarea className="input" style={{minHeight:240}} readOnly value={simple} aria-label="Simplified Clauses"/>
        </div>
        <div style={{marginTop:12}}>
          <button className="btn" onClick={runSimplify} disabled={!activeId || loading}>
            {loading ? "Simplifying…" : "Run Simplification"}
          </button>
        </div>
      </div>
    </>
  );
}