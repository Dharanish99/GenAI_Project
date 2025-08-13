import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Simplify from "./pages/Simplify.jsx";
import ExtractEntities from "./pages/ExtractEntities.jsx";
import Classify from "./pages/Classify.jsx";
import QA from "./pages/QA.jsx";

export default function App(){
  return (
    <ProjectProvider>
      <div className="mobile-nav">
        <div className="mobile-nav-content">
          <div className="brand" style={{gap:10}}>
            <div className="brand-icon">CW</div>
            <strong>ClauseWise</strong>
          </div>
          <NavLink to="/" className="btn btn-ghost" aria-label="Home">≡</NavLink>
        </div>
      </div>
      <div className="app">
        <Sidebar />
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/simplify" element={<Simplify />} />
              <Route path="/extract-entities" element={<ExtractEntities />} />
              <Route path="/classify" element={<Classify />} />
              <Route path="/qa" element={<QA />} />
            </Routes>
          </div>
        </main>
      </div>
    </ProjectProvider>
  );
}