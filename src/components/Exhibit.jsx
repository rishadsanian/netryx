import React, { useState, useEffect } from "react";
import "./Exhibit.css";

function Exhibit({ widget }) {
  const [statusSymbolClass, setStatusSymbolClass] = useState("");

  return (
    <div className="widget" style={{ width: widget.width }}>
      <header>
        <div className={`status-symbol status-symbol-${widget.status}`}></div>
        <h2 className="heading">{widget.heading}</h2>
      </header>
      {widget.data !== null && widget.data !== undefined ? (
        <p className="value">{widget.data}</p>
      ) : (
        <div className="value">Unavailable</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>{widget.data2}</div>
    </div>
  );
}

export default Exhibit;
