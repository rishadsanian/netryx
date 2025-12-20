import React from "react";
import "./SectionShell.css";

function SectionShell({ title, description, items }) {
  return (
    <section className="section-shell">
      <div className="section-shell__header">
        <p className="section-shell__eyebrow">Roadmap shell</p>
        <div>
          <h2>{title}</h2>
          {description && <p className="section-shell__description">{description}</p>}
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
