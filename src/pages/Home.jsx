import React from "react";
import UploadArea from "../components/UploadArea.jsx";
import FilesPanel from "../components/FilesPanel.jsx";

export default function Home() {
  return (
    <>
      <section className="hero fade-in">
        <h1>ClauseWise</h1>
        <p>
          AI-powered legal document analysis. Upload contracts and policies, 
          then use advanced tools to simplify clauses, extract entities, 
          classify documents, and get instant answers.
        </p>
        <UploadArea />
      </section>

      <section className="slide-up">
        <FilesPanel />
      </section>
    </>
  );
}