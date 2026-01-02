import { useState, useEffect, useRef } from "react";

// Defaults target an external endpoint for a real internet-path test.
// Override with REACT_APP_SPEEDTEST_DOWNLOAD_URL / REACT_APP_SPEEDTEST_UPLOAD_URL if you prefer another host.
const DEFAULT_DOWNLOAD_URL =
  "https://speed.cloudflare.com/__down?bytes=5000000"; // 5MB
const DEFAULT_UPLOAD_URL = "https://speed.cloudflare.com/__up";

function useNetworkInfo() {
  const [connectionType, setConnectionType] = useState(null);
  const [effectiveType, setEffectiveType] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [speedLatency, setSpeedLatency] = useState(null);
  const [speedJitter, setSpeedJitter] = useState(null);
  const [speedTestStatus, setSpeedTestStatus] = useState("idle"); // idle, running, complete
  const [speedTestProgress, setSpeedTestProgress] = useState(0);
  const [speedTestError, setSpeedTestError] = useState(null);
  const [linkStatus, setLinkStatus] = useState("checking"); // checking, online, offline
  const [pingLatency, setPingLatency] = useState(null);
  const autoRunRef = useRef(false);
  const downloadEndpoint =
    process.env.REACT_APP_SPEEDTEST_DOWNLOAD_URL || DEFAULT_DOWNLOAD_URL;
  const uploadEndpoint =
    process.env.REACT_APP_SPEEDTEST_UPLOAD_URL || DEFAULT_UPLOAD_URL;
  const isExternal =
    (typeof downloadEndpoint === "string" &&
      /^https?:\/\//i.test(downloadEndpoint)) ||
    (typeof uploadEndpoint === "string" &&
      /^https?:\/\//i.test(uploadEndpoint));
  const speedTestScope = isExternal
    ? "Internet throughput (external endpoint)"
    : "Local throughput (same origin)";

  // Get network information from the Network Information API
  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      setConnectionType(connection.type);
      setEffectiveType(connection.effectiveType);

      const handleChange = () => {
        setConnectionType(connection.type);
        setEffectiveType(connection.effectiveType);
      };

      connection.addEventListener("change", handleChange);
      return () => connection.removeEventListener("change", handleChange);
    }
  }, []);

  // Lightweight connectivity check (same-origin ping)
  useEffect(() => {
    let cancelled = false;
    const PING_TIMEOUT_MS = 5000;

    const ping = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
      const start = performance.now();
      try {
        const res = await fetch("/", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        if (cancelled) return;
        if (!res.ok) throw new Error(`Ping failed with status ${res.status}`);
        const end = performance.now();
        setLinkStatus("online");
        setPingLatency(Math.max(0, Math.round(end - start)));
      } catch (err) {
        if (cancelled) return;
        setLinkStatus("offline");
        setPingLatency(null);
      } finally {
        clearTimeout(timeout);
      }
    };

    ping();
    const interval = setInterval(ping, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const median = (values) => {
    if (!values || !values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const measureLatencyBurst = async (attempts = 5) => {
    const samples = [];
    for (let i = 0; i < attempts; i++) {
      const start = performance.now();
      try {
        await fetch("/", { method: "HEAD", cache: "no-store" });
        samples.push(performance.now() - start);
      } catch (err) {
        // swallow individual failures; rely on any successful samples
      }
    }

    if (!samples.length) return { latency: null, jitter: null };
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    return {
      latency: Math.round(median(samples)),
      jitter: Math.round(Math.max(0, max - min)),
    };
  };

  // Speed test function
  const runSpeedTest = async () => {
    setSpeedTestStatus("running");
    setSpeedTestProgress(0);
    setSpeedTestError(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setSpeedLatency(null);
    setSpeedJitter(null);

    try {
      const totalSteps = 5; // 1 latency burst + 3 downloads + 1 upload (will add progress inside uploads)
      let completedSteps = 0;

      // Quick latency/jitter burst (small HEAD requests) for context
      const { latency, jitter } = await measureLatencyBurst();
      setSpeedLatency(latency);
      setSpeedJitter(jitter);
      completedSteps += 1;
      setSpeedTestProgress(Math.round((completedSteps / totalSteps) * 100));

      const DOWNLOAD_SAMPLES = 3;
      const DOWNLOAD_BYTES = 15000000; // 15 MB to reduce slow-start bias
      const downloadSamples = [];

      for (let i = 0; i < DOWNLOAD_SAMPLES; i++) {
        const downloadStart = performance.now();
        const response = await fetch(
          `${downloadEndpoint}?bytes=${DOWNLOAD_BYTES}&cache=${Math.random()}`,
          {
            cache: "no-store",
          }
        );
        const blob = await response.blob();
        const downloadEnd = performance.now();
        const downloadTime = (downloadEnd - downloadStart) / 1000;
        const downloadMbps = (blob.size * 8) / (downloadTime * 1000000);
        downloadSamples.push(Math.max(0.1, downloadMbps));
        completedSteps += 1;
        setSpeedTestProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      const medianDownload = median(downloadSamples);
      setDownloadSpeed(medianDownload ? medianDownload.toFixed(2) : null);

      // Upload speed test; response may 404 but timing is still measured
      const uploadStart = performance.now();
      const testData = new Blob([new Array(500000).join("a")]); // ~0.5MB to reduce server load
      const formData = new FormData();
      formData.append("file", testData);

      try {
        await fetch(uploadEndpoint, {
          method: "POST",
          body: formData,
          cache: "no-store",
        });
      } catch (postErr) {
        console.warn("Upload test POST failed, using estimate", postErr);
        const estimatedUpload = medianDownload ? medianDownload * 0.3 : null; // typical ratio
        if (estimatedUpload)
          setUploadSpeed(Math.max(0.1, estimatedUpload).toFixed(2));
        setSpeedTestStatus("complete");
        setSpeedTestProgress(100);
        return;
      }

      const uploadEnd = performance.now();
      const uploadTime = (uploadEnd - uploadStart) / 1000;
      const uploadMbps = (testData.size * 8) / (uploadTime * 1000000);
      setUploadSpeed(Math.max(0.1, uploadMbps).toFixed(2));

      completedSteps = totalSteps;
      setSpeedTestProgress(100);
      setSpeedTestStatus("complete");
    } catch (error) {
      console.error("Speed test failed:", error);
      setSpeedTestError(
        `Speed test blocked or failed. Ensure ${downloadEndpoint} is reachable and POSTs to ${uploadEndpoint} are allowed.`
      );
      setSpeedTestStatus("error");
      setSpeedTestProgress(0);
      setDownloadSpeed(null);
      setUploadSpeed(null);
    }
  };

  // Auto-run a speed test once on mount to populate the widget without a click.
  useEffect(() => {
    if (autoRunRef.current) return;
    autoRunRef.current = true;
    runSpeedTest();
  }, [runSpeedTest]);

  const getEffectiveTypeLabel = () => {
    // Prefer the physical link type when the browser exposes it.
    if (typeof connectionType === "string") {
      if (/wifi/i.test(connectionType)) return "Wi‑Fi";
      if (/ethernet/i.test(connectionType)) return "Ethernet";
      if (/cell/i.test(connectionType)) return "Cellular";
      return connectionType;
    }

    // If the browser hides the link type but exposes a speed class (4G/3G/etc.), avoid showing the raw class.
    if (effectiveType) {
      if (effectiveType === "4g" || effectiveType === "3g")
        return "Cellular (browser estimate)";
      if (effectiveType === "2g" || effectiveType === "slow-2g")
        return "Very slow link (browser estimate)";
    }

    if (connectionType !== null && connectionType !== undefined) {
      return "Unknown (browser-limited)";
    }

    return "Unavailable (not exposed by browser)";
  };

  return {
    connectionType,
    effectiveType,
    effectiveTypeLabel: getEffectiveTypeLabel(),
    downloadSpeed,
    uploadSpeed,
    speedLatency,
    speedJitter,
    speedTestStatus,
    speedTestProgress,
    speedTestError,
    speedTestScope,
    linkStatus,
    pingLatency,
    runSpeedTest,
  };
}

export default useNetworkInfo;
