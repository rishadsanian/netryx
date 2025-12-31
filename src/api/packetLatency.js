import { useEffect, useRef, useState } from "react";
import { w3cwebsocket } from "websocket";

const STALE_THRESHOLD_MS = 5000;
const RECONNECT_DELAY_MS = 2000;
const MAX_POINTS = 120;

function PacketLatency() {
  const [latency, setLatency] = useState(null);
  const [latencyStatus, setLatencyStatus] = useState("red");
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [labels, setLabels] = useState([]);
  const [displayLatency, setDisplayLatency] = useState([]);

  const latencyRef = useRef(null);
  const lastMessageRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, RECONNECT_DELAY_MS);
    };

    const handleClose = () => {
      if (!isMounted) return;
      latencyRef.current = null;
      setLatency(null);
      setLatencyStatus("red");
      scheduleReconnect();
    };

    const connect = () => {
      const client = new w3cwebsocket("ws://localhost:55455");
      socketRef.current = client;

      client.onopen = () => {
        if (!isMounted) return;
        setLatencyStatus("green");
      };

      client.onmessage = (message) => {
        if (!isMounted) return;
        const timestamp = parseInt(message.data, 10);
        const currentTime = Date.now();
        lastMessageRef.current = currentTime;
        setCurrentTimestamp(currentTime);
        const packetLatency = currentTime - timestamp;
        latencyRef.current = packetLatency;
        setLatency(packetLatency);
        setLatencyStatus("green");
      };

      client.onerror = () => {
        if (!isMounted) return;
        setLatencyStatus("red");
        client.close();
      };

      client.onclose = handleClose;
    };

    connect();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.onclose = null;
        if (typeof socketRef.current.close === "function") {
          socketRef.current.close();
        }
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (latencyRef.current !== null) {
        const timestamp = Date.now();
        setLabels((prev) => {
          const next = [...prev, timestamp];
          return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
        });
        setDisplayLatency((prev) => {
          const next = [...prev, latencyRef.current];
          return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastMessageAt = lastMessageRef.current;
      if (!lastMessageAt) return;
      const isStale = Date.now() - lastMessageAt > STALE_THRESHOLD_MS;
      if (isStale) {
        latencyRef.current = null;
        setLatency(null);
        setLatencyStatus("red");
        if (socketRef.current) {
          socketRef.current.close();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { latency, latencyStatus, currentTimestamp, labels, displayLatency };
}

export default PacketLatency;
