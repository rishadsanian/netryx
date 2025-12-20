import { useState, useEffect, useRef } from "react";
import { w3cwebsocket } from "websocket";

function PacketLatency() {
  const [latency, setLatency] = useState(null);
  const [latencyStatus, setLatencyStatus] = useState("red");
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [labels, setLabels] = useState([]);
  const [displayLatency, setDisplayLatency] = useState([]); // latency data to be displayed on chart

  const latencyRef = useRef(null);

  useEffect(() => {
    const client = new w3cwebsocket("ws://localhost:55455");

    // Handle incoming messages from the server

    // connect to the server
    client.onopen = () => {
      console.log("WebSocket connected");
      setLatencyStatus("green");
    };

    //incoming messages
    client.onmessage = (message) => {
      // console.log("Received message:", message.data);
      const timestamp = parseInt(message.data);
      const currentTime = Date.now();
      setCurrentTimestamp(currentTime);
      const packetLatency = currentTime - timestamp;
      // console.log("Calculated latency:", packetLatency);
      latencyRef.current = packetLatency;
      setLatency(packetLatency);
      setLatencyStatus("green");
      // client.close(); // close connection - to add flicker effect
    };

    //closing messages
    client.onclose = () => {
      setLatencyStatus("off");
    };
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const { currentTimestamp, latency } = PacketLatency();
  //     // Generate mock data for demonstration
  //     // const currentTimestamp = new Date().toLocaleTimeString();
  //     // const latency = Math.floor(Math.random() * 100);

  //     //real data
  //     console.log(currentTimestamp, latency);

  //     // Update state with the mock data
  //     setLabels((labels) => [...labels, currentTimestamp]);
  //     setDisplayLatency((displayLatency) => [...displayLatency, latency]);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    // console.log("Interval useEffect running");
    const interval = setInterval(() => {
      // console.log("Interval tick, latency:", latencyRef.current);
      if (latencyRef.current !== null) {
        const timestamp = Date.now();
        // console.log("Adding chart point:", timestamp, latencyRef.current);
        setLabels((prev) => [...prev, timestamp]);
        setDisplayLatency((prev) => [...prev, latencyRef.current]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { latency, latencyStatus, currentTimestamp, labels, displayLatency };
}

export default PacketLatency;
