import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import NavigationBar from "./components/NavigationBar.jsx";
import Home from "./pages/Home.jsx";
import Simplify from "./pages/Simplify.jsx";
import ExtractEntities from "./pages/ExtractEntities.jsx";
import Classify from "./pages/Classify.jsx";
import QA from "./pages/QA.jsx";

export default function App(){
  return (
    <ProjectProvider>
      <div className="app">
        <NavigationBar />
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