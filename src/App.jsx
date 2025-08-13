import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { FilesProvider } from "./context/FilesContext.jsx";
import SideNav from "./components/SideNav.jsx";
import Home from "./pages/Home.jsx";
import Simplify from "./pages/Simplify.jsx";
import ExtractEntities from "./pages/ExtractEntities.jsx";
import Classify from "./pages/Classify.jsx";
import QA from "./pages/QA.jsx";

export default function App(){
  return (
    <FilesProvider>
      <div className="mobile-topbar">
        <div className="mobile-row">
          <div className="brand" style={{gap:10}}>
            <div className="brand-logo" aria-hidden />
            <strong>ClauseWise</strong>
          </div>
          <NavLink to="/" className="hamburger" aria-label="Open Home">≡</NavLink>
        </div>
      </div>
      <div className="app">
        <SideNav />
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
    </FilesProvider>
  );
}