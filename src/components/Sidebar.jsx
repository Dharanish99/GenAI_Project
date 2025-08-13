import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) => 
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">CW</div>
        <h1>ClauseWise</h1>
      </div>

      <nav className="nav-section">
        <h3>Main</h3>
        <NavLink className={linkClass} to="/">
          <span>🏠</span>
          Home
        </NavLink>
      </nav>

      <nav className="nav-section">
        <h3>Features</h3>
        <NavLink className={linkClass} to="/simplify">
          <span>✨</span>
          Simplify Clauses
        </NavLink>
        <NavLink className={linkClass} to="/extract-entities">
          <span>🔍</span>
          Extract Entities
        </NavLink>
        <NavLink className={linkClass} to="/classify">
          <span>📋</span>
          Classify Document
        </NavLink>
        <NavLink className={linkClass} to="/qa">
          <span>💬</span>
          Q&A Chat
        </NavLink>
      </nav>
    </aside>
  );
}