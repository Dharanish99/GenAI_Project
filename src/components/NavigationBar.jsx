import React from "react";
import { NavLink } from "react-router-dom";

export default function NavigationBar() {
  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-icon">CW</div>
          <strong>ClauseWise</strong>
        </div>
        
        <div className="nav-links">
          <NavLink to="/" className="nav-link" end>
            Home
          </NavLink>
          <NavLink to="/simplify" className="nav-link">
            Simplify Clauses
          </NavLink>
          <NavLink to="/extract-entities" className="nav-link">
            Extract Entities
          </NavLink>
          <NavLink to="/classify" className="nav-link">
            Classify Documents
          </NavLink>
          <NavLink to="/qa" className="nav-link">
            Q&A Chat
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
