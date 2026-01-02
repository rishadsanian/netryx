import React from "react";
import "./NetworkInfo.css";

function NetworkInfo({ networkInfo }) {
  const {
    effectiveTypeLabel,
    downloadSpeed,
    uploadSpeed,
    speedTestStatus,
    speedTestProgress,
    speedTestError,
    speedTestScope,
    runSpeedTest,
    connectionType,
    linkStatus,
    pingLatency,
    speedLatency,
    speedJitter,
  } = networkInfo;

  const isTestRunning = speedTestStatus === "running";
  const showResults = speedTestStatus !== "idle";
  const isWifi =
    typeof connectionType === "string" && /wifi/i.test(connectionType);
  const statusClass =
    linkStatus === "online"
      ? pingLatency && Number.isFinite(pingLatency) && pingLatency > 120
        ? "status-symbol-amber"
        : "status-symbol-green"
      : linkStatus === "offline"
        ? "status-symbol-red"
        : "status-symbol-off";
  const resolvedLinkType = (() => {
    if (typeof connectionType === "string") {
      if (/wifi/i.test(connectionType)) return "Wi‑Fi";
      if (/ethernet/i.test(connectionType)) return "Ethernet";
      if (/cell/i.test(connectionType)) return "Cellular";
    }
    if (
      effectiveTypeLabel &&
      !/(estimate|unknown|unavailable)/i.test(effectiveTypeLabel)
    ) {
      return effectiveTypeLabel;
    }
    return null;
  })();
  const showLinkType = Boolean(resolvedLinkType);

  const getThroughputTone = (mbps) => {
    if (!Number.isFinite(mbps)) return "muted";
    if (mbps >= 100) return "excellent";
    if (mbps >= 40) return "good";
    if (mbps >= 10) return "fair";
    return "poor";
  };

  const getLatencyTone = (ms) => {
    if (!Number.isFinite(ms)) return "muted";
    if (ms <= 30) return "excellent";
    if (ms <= 70) return "good";
    if (ms <= 120) return "fair";
    return "poor";
  };

  const getSpeedEvaluation = () => {
    const downloadMbps = Number.parseFloat(downloadSpeed);
    const uploadMbps = Number.parseFloat(uploadSpeed);
    const hasDownload = Number.isFinite(downloadMbps);
    const hasUpload = Number.isFinite(uploadMbps);
    const bottleneck = Math.min(
      hasDownload ? downloadMbps : Infinity,
      hasUpload ? uploadMbps : Infinity
    );

    if (speedTestStatus === "error") {
      return {
        headline: "Unable to score link",
        detail: "Re-run the test to rate overall speed.",
        tone: "muted",
      };
    }

    if (speedTestStatus === "running") {
      return {
        headline: "Measuring...",
        detail: "Waiting on both download and upload results.",
        tone: "muted",
      };
    }

    if (!hasDownload && !hasUpload) {
      return {
        headline: "No results yet",
        detail: "Run the speed test to see an overall rating.",
        tone: "muted",
      };
    }

    let headline;
    if (bottleneck >= 100) headline = "Excellent";
    else if (bottleneck >= 40) headline = "Fast";
    else if (bottleneck >= 10) headline = "Fair";
    else headline = "Slow";

    let detail = "Balanced for streaming, calls, and uploads.";
    if (headline === "Fast")
      detail =
        "Comfortable for HD streaming, large syncs, and multi-user calls.";
    if (headline === "Fair")
      detail =
        "OK for browsing and single HD streams; larger uploads will drag.";
    if (headline === "Slow")
      detail = "Expect delays on video calls and cloud syncs.";

    if (hasDownload && hasUpload) {
      if (downloadMbps < uploadMbps - 5) {
        detail = `Download is the limiter (${downloadMbps.toFixed(
          1
        )} Mbps). ${detail}`;
      } else if (uploadMbps < downloadMbps - 5) {
        detail = `Upload is the limiter (${uploadMbps.toFixed(
          1
        )} Mbps). ${detail}`;
      } else {
        detail = `Download/Upload are balanced (${downloadSpeed} / ${uploadSpeed} Mbps). ${detail}`;
      }
    } else if (hasDownload && !hasUpload) {
      detail = `Upload still measuring. Download at ${downloadSpeed} Mbps. ${detail}`;
    } else if (!hasDownload && hasUpload) {
      detail = `Download still measuring. Upload at ${uploadSpeed} Mbps. ${detail}`;
    }

    return { headline, detail, tone: headline.toLowerCase() };
  };

  const speedEvaluation = getSpeedEvaluation();
  const statusLabel =
    linkStatus === "online"
      ? `Connected${pingLatency ? ` · ${pingLatency}ms ping` : ""}`
      : linkStatus === "offline"
        ? "Disconnected"
        : "Checking...";

  return (
    <div className="widget network-info">
      <div className="network-info__section">
        <div className="network-info__title-row">
          <div className="network-info__title-left">
            <span className={`status-symbol ${statusClass}`}></span>
            <h3 className="network-info__title">Network</h3>
          </div>
          <div className="network-info__status network-info__status--inline">
            <span className="network-info__value">{statusLabel}</span>
          </div>
        </div>
        {showLinkType && (
          <div className="network-info__type">
            <span className="network-info__label">Link type:</span>
            <span className="network-info__value">{resolvedLinkType}</span>
          </div>
        )}
      </div>

      <div className="network-info__section">
        <h3 className="network-info__title">
          Speed Test{" "}
          <i
            className="fa-solid fa-circle-info speed-test-info"
            title="Throughput uses median of multiple runs (download x3, upload x1) with a quick latency burst for context."
          ></i>
        </h3>
        <p className="hidden network-info__note">{speedTestScope}</p>
        {(speedTestStatus === "idle" || speedTestStatus === "running") && (
          <button
            className={`speed-test-btn ${
              isTestRunning ? "speed-test-btn--running" : ""
            }`}
            onClick={runSpeedTest}
            disabled={isTestRunning}
          >
            {isTestRunning
              ? `Running... ${speedTestProgress}%`
              : "Run Speed Test (median of runs)"}
          </button>
        )}

        {showResults && (
          <div className="speed-test-results">
            <div className="speed-test-result">
              <span className="speed-test-label">Download:</span>
              <span
                className={`speed-test-value metric metric--${getThroughputTone(
                  Number.parseFloat(downloadSpeed)
                )}`}
              >
                {downloadSpeed
                  ? `${downloadSpeed} Mbps`
                  : speedTestStatus === "error"
                  ? "Failed"
                  : "Testing..."}
              </span>
            </div>
            <div className="speed-test-result">
              <span className="speed-test-label">Upload:</span>
              <span
                className={`speed-test-value metric metric--${getThroughputTone(
                  Number.parseFloat(uploadSpeed)
                )}`}
              >
                {uploadSpeed
                  ? `${uploadSpeed} Mbps`
                  : speedTestStatus === "error"
                  ? "Failed"
                  : "Testing..."}
              </span>
            </div>
            <div className="speed-test-result">
              <span className="speed-test-label">Latency (median):</span>
              <span
                className={`speed-test-value metric metric--${getLatencyTone(
                  Number.parseFloat(speedLatency)
                )}`}
              >
                {speedLatency
                  ? `${speedLatency} ms`
                  : speedTestStatus === "error"
                  ? "Failed"
                  : "Testing..."}
              </span>
              <span className="speed-test-subtext">
                {speedJitter !== null && speedJitter !== undefined
                  ? `Jitter: ${speedJitter} ms`
                  : "Measuring jitter..."}
              </span>
            </div>
            <div className="speed-test-result">
              <span className="speed-test-label">Overall:</span>
              <span
                className={`speed-test-value metric metric--${
                  speedEvaluation?.tone || "muted"
                }`}
              >
                {speedEvaluation?.headline
                  ? speedEvaluation.headline
                  : speedTestStatus === "error"
                  ? "Failed"
                  : "Scoring..."}
              </span>
            </div>
          </div>
        )}

        {showResults && (
          <div
            className={`value
          `}
          >
            <div className="speed-test-eval__detail">
              {speedEvaluation.detail}
            </div>
          </div>
        )}

        {speedTestError && (
          <p className="network-info__error">{speedTestError}</p>
        )}

        {(speedTestStatus === "complete" || speedTestStatus === "error") && (
          <button
            className="speed-test-btn speed-test-btn--secondary"
            onClick={runSpeedTest}
          >
            Test Again
          </button>
        )}
      </div>
    </div>
  );
}

export default NetworkInfo;
