import React from "react";
import "./Banner.css";

function Banner() {
  return (
    <div className="banner">
      <div className="banner__title">
        <p className="banner__eyebrow">Network intelligence deck</p>
        <h1>NETRYX</h1>
      </div>
      <div className="banner__meta">
        <span className="pill pill-live">Live</span>
        <span className="pill pill-soft">Monitoring · Devices · Services</span>
      </div>
    </div>
  );
}

export default Banner;
