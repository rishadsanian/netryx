import React from "react";
import "./NavBar.css";

function NavBar({ items, active, onSelect }) {
  return (
    <nav className="navbar">
      <div className="navbar__rail">
        {items.map((item) => (
          <button
            key={item}
            className={`navbar__item ${active === item ? "is-active" : ""}`}
            onClick={() => onSelect(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
