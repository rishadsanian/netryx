import React from "react";
import "./SectionShell.css";

function SectionShell({ title, description, items, comingSoon = false }) {
  return (
    <section className="section-shell">
      <div className="section-shell__header">
        <div className="section-shell__eyebrow-row">
          <p className="section-shell__eyebrow">Roadmap shell</p>
          {comingSoon && <span className="section-shell__pill">Coming soon</span>}
        </div>
        <div>
          <h2>{title}</h2>
          {description && <p className="section-shell__description">{description}</p>}
          {comingSoon && (
            <p className="section-shell__note">
              You are previewing the workspace layout for this area. Live data and controls are on the way.
            </p>
          )}
        </div>
      </div>
      <div className="section-shell__grid">
        {items.map((item) => (
          <div key={item.title} className="section-shell__card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SectionShell;
