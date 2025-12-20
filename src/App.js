import React from "react";
import "./App.css";
import Banner from "./components/Banner";
import Exhibit from "./components/Exhibit";
import LatencyChart from "./components/LatencyChart";

import GetIP from "./api/getIp";
import PacketLatency from "./api/packetLatency";

function App() {
  const { ipv4, ipv4status, ipv6, ipv6status } = GetIP();
  const { latency, latencyStatus, labels, displayLatency } = PacketLatency();

  const widget1 = {
    heading: "Public IPV4 Address ",
    data: ipv4,
    width: "100%",
    status: ipv4status,
  };
  const widget2 = {
    heading: "Public IPV6 Address",
    data: ipv6,
    width: "100%",
    status: ipv6status,
  };
  const widget3 = {
    heading: "Latency (ms)",
    data: latency,
    data2: <LatencyChart labels={labels} displayLatency={displayLatency} />,
    width: "100%",
    status: latencyStatus,
    // labels: labels,
    // displayLatency: displayLatency,
  };
  // const widget4 = { heading: "Latency", data: <LatencyChart /> };


  return (
    <div className="App">
      <Banner />
      <div className="dashboard">
        
        <Exhibit widget={widget1} />
        <Exhibit widget={widget2} />
        <Exhibit widget={widget3} />
      </div>
    </div>
  );
}

export default App;
