import { useEffect, useRef, useState } from "react";
import { w3cwebsocket } from "websocket";

const STALE_THRESHOLD_MS = 5000;
const PING_INTERVAL_MS = 1000;
const RECONNECT_DELAY_MS = 2000;
const MAX_POINTS = 120;
const SOCKET_OPEN = 1;
const getSocketUrl = () => {
  if (process.env.REACT_APP_PACKET_LATENCY_WS_URL) {
    return process.env.REACT_APP_PACKET_LATENCY_WS_URL;
  }

  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}`;
  }

  return "ws://localhost:55455";
};

function PacketLatency() {
  const [latency, setLatency] = useState(null);
  const [latencyStatus, setLatencyStatus] = useState("red");
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [labels, setLabels] = useState([]);
  const [displayLatency, setDisplayLatency] = useState([]);

  const latencyRef = useRef(null);
  const lastMessageRef = useRef(null);
  const socketRef = useRef(null);
  const pingTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const stopPinging = () => {
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
    };

    const sendPing = () => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== SOCKET_OPEN) return;

      socket.send(
        JSON.stringify({
          type: "latency-ping",
          sentAt: Date.now(),
        })
      );
    };

    const startPinging = () => {
      stopPinging();
      sendPing();
      pingTimerRef.current = setInterval(sendPing, PING_INTERVAL_MS);
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, RECONNECT_DELAY_MS);
    };

    const handleClose = () => {
      if (!isMounted) return;
      stopPinging();
      latencyRef.current = null;
      setLatency(null);
      setLatencyStatus("red");
      scheduleReconnect();
    };

    const connect = () => {
      const client = new w3cwebsocket(getSocketUrl());
      socketRef.current = client;

      client.onopen = () => {
        if (!isMounted) return;
        setLatencyStatus("green");
        startPinging();
      };

      client.onmessage = (message) => {
        if (!isMounted) return;
        const currentTime = Date.now();
        let payload;

        try {
          payload = JSON.parse(message.data);
        } catch (err) {
          return;
        }

        if (payload?.type !== "latency-ping" || !Number.isFinite(payload.sentAt)) {
          return;
        }

        lastMessageRef.current = currentTime;
        setCurrentTimestamp(currentTime);
        const packetLatency = Math.max(0, currentTime - payload.sentAt);
        latencyRef.current = packetLatency;
        setLatency(packetLatency);
        setLatencyStatus("green");
      };

      client.onerror = () => {
        if (!isMounted) return;
        setLatencyStatus("red");
        if (typeof client.close === "function") {
          client.close();
        }
      };

      client.onclose = handleClose;
    };

    connect();

    return () => {
      isMounted = false;
      stopPinging();
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
        if (pingTimerRef.current) {
          clearInterval(pingTimerRef.current);
          pingTimerRef.current = null;
        }
        latencyRef.current = null;
        setLatency(null);
        setLatencyStatus("red");
        if (socketRef.current && typeof socketRef.current.close === "function") {
          socketRef.current.close();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { latency, latencyStatus, currentTimestamp, labels, displayLatency };
}

export default PacketLatency;
