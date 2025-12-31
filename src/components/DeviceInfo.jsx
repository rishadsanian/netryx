import React from "react";
import "./DeviceInfo.css";

function DeviceInfo({ info }) {
  const ready = Boolean(info?.deviceType);

  return (
    <div className="device-info">
      <div className="device-info__grid">
        <div className="device-info__card">
          <p className="device-info__label">Type</p>
          <p className="device-info__value">{ready ? info.deviceType : "Detecting..."}</p>
        </div>
        <div className="device-info__card">
          <p className="device-info__label">Make / Model</p>
          <p className="device-info__value">
            {ready ? `${info.make} · ${info.model}` : "Detecting..."}
          </p>
        </div>
        <div className="device-info__card">
          <p className="device-info__label">OS / Browser</p>
          <p className="device-info__value">
            {ready ? `${info.os} · ${info.browser}` : "Detecting..."}
          </p>
        </div>
        <div className="device-info__card">
          <p className="device-info__label">Screen</p>
          <p className="device-info__value">{ready ? info.resolution : "Detecting..."}</p>
        </div>
        <div className="device-info__card">
          <p className="device-info__label">Cores (browser-reported)</p>
          <p className="device-info__value">
            {ready ? info.cores || "Unavailable" : "Detecting..."}
          </p>
        </div>
        <div className="device-info__card">
          <p className="device-info__label">Memory (browser hint, may be capped)</p>
          <p className="device-info__value">
            {ready ? (info.memory ? `${info.memory} GB (approx)` : "Unavailable") : "Detecting..."}
          </p>
        </div>
      </div>
      <div className="device-info__ua">
        <p className="device-info__label">User agent</p>
        <p className="device-info__ua-value">{ready ? info.userAgent : "Detecting..."}</p>
      </div>
    </div>
  );
}

export default DeviceInfo;
