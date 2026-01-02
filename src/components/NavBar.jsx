import React from "react";
import "./NavBar.css";

function NavBar({ items, active, onSelect }) {
  return (
    <nav className="navbar">
      <div className="navbar__rail">
        {items.map((item) => (
          <button
            key={item.key}
            className={`navbar__item ${active === item.key ? "is-active" : ""} ${item.status === "soon" ? "is-soon" : ""}`}
            onClick={() => onSelect(item.key)}
            type="button"
          >
            <span className="navbar__label">{item.label}</span>
            {item.status === "soon" && <span className="navbar__tag">Soon</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
