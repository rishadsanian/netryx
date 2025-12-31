import React, { useState } from "react";
import "./App.css";
import Banner from "./components/Banner";
import Exhibit from "./components/Exhibit";
import DeviceInfo from "./components/DeviceInfo";
import LatencyChart from "./components/LatencyChart";
import NavBar from "./components/NavBar";
import SectionShell from "./components/SectionShell";

import GetIP from "./api/getIp";
import PacketLatency from "./api/packetLatency";
import useDeviceInfo from "./api/useDeviceInfo";

function App() {
  const [activeSection, setActiveSection] = useState("Overview");
  const { ipv4, ipv4status, ipv6, ipv6status } = GetIP();
  const { latency, latencyStatus, labels, displayLatency } = PacketLatency();
  const deviceInfo = useDeviceInfo();

  const navItems = [
    "Overview",
    "Devices",
    "Topology",
    "Monitoring",
    "Alerts",
    "Automation",
    "Analytics",
    "Admin",
  ];

  const sectionShells = {
    Devices: {
      description: "Inventory, configs, baselines, and fleet hygiene",
      items: [
        { title: "Inventory & search", body: "Filter by tags, roles, sites, firmware, and reachability." },
        { title: "Config snapshots", body: "Versioned configs with diffs and drift detection." },
        { title: "Compliance guardrails", body: "Profiles for hardening, SNMP, SSH, banners, ACL templates." },
      ],
    },
    Topology: {
      description: "Maps, dependencies, and impact-aware routing",
      items: [
        { title: "Live map", body: "Sites, links, VLAN overlays, and utilization heat." },
        { title: "Dependency view", body: "Service -> device -> link chains for impact analysis." },
        { title: "What-if", body: "Simulate link or node failure to see blast radius." },
      ],
    },
    Monitoring: {
      description: "Real-time metrics, SLOs, and noise-tuned thresholds",
      items: [
        { title: "Metrics streams", body: "Latency, jitter, loss, throughput, CPU/mem, interface errors." },
        { title: "Smart thresholds", body: "Anomaly-aware alerting with dynamic baselines." },
        { title: "SLOs", body: "Golden signals per service with burn-rate views." },
      ],
    },
    Alerts: {
      description: "Triage and routing that stays actionable",
      items: [
        { title: "Active queue", body: "Deduped incidents with status, owners, and timelines." },
        { title: "Routing policies", body: "Escalation paths by severity, service, or team." },
        { title: "Maintenance", body: "Windows and suppressions for planned work." },
      ],
    },
    Automation: {
      description: "Jobs, playbooks, and safe change control",
      items: [
        { title: "Job catalog", body: "Backups, patching, config pushes, and health checks." },
        { title: "Run history", body: "Audit trails with diff previews and outputs." },
        { title: "Change control", body: "Dry-runs, approvals, and blast-radius hints." },
      ],
    },
    Analytics: {
      description: "Capacity, reliability, and trend intelligence",
      items: [
        { title: "Capacity trends", body: "Growth curves for links, devices, and sites." },
        { title: "Reliability", body: "MTTR/MTTD, incident frequency, and noise scoring." },
        { title: "Reports", body: "Exportable summaries for leadership and audits." },
      ],
    },
    Admin: {
      description: "Access, integrations, and workspace controls",
      items: [
        { title: "Users & roles", body: "RBAC, MFA posture, and access reviews." },
        { title: "Integrations", body: "Syslog, SNMP, NetFlow/IPFIX, Webhooks, ticketing." },
        { title: "Workspace", body: "Theme, defaults, API tokens, and org settings." },
      ],
    },
  };

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
  const widget0 = {
    heading: "Client device",
    data: deviceInfo.deviceType
      ? `${deviceInfo.deviceType} · ${deviceInfo.os || "Unknown OS"}`
      : "Detecting client...",
    data2: <DeviceInfo info={deviceInfo} />,
    width: "100%",
    status: deviceInfo.deviceType ? "green" : "off",
  };
  const widget3 = {
    heading: "Latency (ms)",
    data: latency,
    data2: <LatencyChart labels={labels} displayLatency={displayLatency} />,
    width: "100%",
    status: latencyStatus,
  };

  const renderSection = () => {
    if (activeSection === "Overview") {
      return (
        <div className="dashboard dashboard-overview-grid">
          <div className="dashboard-col-left">
            <Exhibit widget={widget0} />
          </div>
          <div className="dashboard-col-right">
            <div className="dashboard-row dashboard-row-split">
              <Exhibit widget={widget1} />
              <Exhibit widget={widget2} />
            </div>
            <div className="dashboard-row dashboard-row-single">
              <Exhibit widget={widget3} />
            </div>
          </div>
        </div>
      );
    }

    const shell = sectionShells[activeSection];
    return (
      <SectionShell
        title={activeSection}
        description={shell?.description}
        items={shell?.items || []}
      />
    );
  };

  return (
    <div className="App">
      <Banner />
      <NavBar
        items={navItems}
        active={activeSection}
        onSelect={setActiveSection}
      />
      <div className="content-area">{renderSection()}</div>
    </div>
  );
}

export default App;
