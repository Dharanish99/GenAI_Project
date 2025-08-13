import React, { useEffect } from "react";
import UploadArea from "../components/UploadArea.jsx";
import FilesPanel from "../components/FilesPanel.jsx";

export default function Home(){
  useEffect(()=>{
    // simple reveal-on-load
    document.querySelectorAll(".reveal").forEach((el,i)=> el.style.animationDelay = `${i*80}ms`);
  },[]);

  return (
    <>
      <section id="home" className="hero card section reveal">
        <h2>ClauseWise – Legal Document Analyzer</h2>
        <p>Upload contracts and policies, then run AI-powered tools (mocked here) to simplify clauses, extract entities, classify, and answer questions.</p>
        <UploadArea />
      </section>

      <section className="reveal" style={{height:14}} />

      <section id="features" className="reveal">
        <FilesPanel />
        <div className="section card feature-card" style={{marginTop:14}}>
          <h3>Features</h3>
          <p style={{margin:0,color:"var(--muted)"}}>
            • Clause Simplification • Entity Extraction • Document Classification • Q&A
          </p>
        </div>
      </section>
    </>
  );
}