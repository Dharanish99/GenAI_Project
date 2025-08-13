import React from "react";
import { NavLink } from "react-router-dom";

export default function SideNav(){
  const link = ({isActive})=> "nav-link" + (isActive ? " active" : "");
  return (
    <aside className="sidenav">
      <div className="brand">
        <div className="brand-logo" aria-hidden />
        <h1>ClauseWise</h1>
      </div>

      <nav className="nav-section" aria-label="Primary">
        <NavLink className={link} to="/">Home</NavLink>
      </nav>

      <nav className="nav-section" aria-label="Features">
        <NavLink className={link} to="/simplify">Simplify Clauses</NavLink>
        <NavLink className={link} to="/extract-entities">Extract Entities</NavLink>
        <NavLink className={link} to="/classify">Document Classification</NavLink>
        <NavLink className={link} to="/qa">Q&A</NavLink>
      </nav>
    </aside>
  );
}