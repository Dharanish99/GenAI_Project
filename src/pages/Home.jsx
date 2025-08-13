import React from "react";
import UploadArea from "../components/UploadArea.jsx";
import FilesPanel from "../components/FilesPanel.jsx";
import FeaturesShowcase from "../components/FeaturesShowcase.jsx";
import FeatureSelectionModal from "../components/FeatureSelectionModal.jsx";
import { useProject } from "../context/ProjectContext.jsx";

export default function Home() {
  const { files, showFeatureModal, lastUploadedFiles, closeFeatureModal } = useProject();

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

      {/* Only show features after files are uploaded */}
      {files.length > 0 && <FeaturesShowcase />}

      {/* Feature Selection Modal */}
      <FeatureSelectionModal 
        isOpen={showFeatureModal}
        onClose={closeFeatureModal}
        uploadedFiles={lastUploadedFiles}
      />
    </>
  );
}