import React, { useState } from "react";
import FilesBar from "../components/FilesBar.jsx";
import { useFiles } from "../context/FilesContext.jsx";
import { getFileBlob } from "../utils/db.js";

export default function QA(){
  const { activeId } = useFiles();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function ask(){
    if (!activeId || !q.trim()) return;
    setLoading(true);
    const blob = await getFileBlob(activeId); void blob;
    await new Promise(r=>setTimeout(r, 900));
    const answer = `Mock answer for: "${q}". For example, notice period is 30 days and termination is mutual.`;
    setItems(prev=>[{q, a:answer, t:Date.now()}, ...prev]);
    setQ(""); setLoading(false);
  }

  return (
    <>
      <FilesBar />
      <div className="card section reveal">
        <div style={{display:"flex", gap:8}}>
          <input className="input" placeholder="Ask a question about the active document…" value={q}
                 onChange={e=>setQ(e.target.value)} aria-label="Question input"/>
          <button className="btn" onClick={ask} disabled={!activeId || loading || !q.trim()}>
            {loading ? "Thinking…" : "Ask"}
          </button>
        </div>

        <div style={{marginTop:16, display:"grid", gap:10}}>
          {items.length===0 ? (
            <div style={{color:"var(--muted)"}}>No questions yet.</div>
          ) : items.map((it,i)=>(
            <div key={i} className="card section reveal">
              <div style={{opacity:.9, marginBottom:6}}><strong>Q:</strong> {it.q}</div>
              <div><strong>A:</strong> {it.a}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}