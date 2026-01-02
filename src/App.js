import React, { useState } from "react";
import "./App.css";
import Banner from "./components/Banner";
import Exhibit from "./components/Exhibit";
import DeviceInfo from "./components/DeviceInfo";
import NetworkInfo from "./components/NetworkInfo";
import LatencyChart from "./components/LatencyChart";
import NavBar from "./components/NavBar";
import SectionShell from "./components/SectionShell";

import GetIP from "./api/getIp";
import PacketLatency from "./api/packetLatency";
import useDeviceInfo from "./api/useDeviceInfo";
import useNetworkInfo from "./api/useNetworkInfo";

function App() {
  const navItems = [
    { key: "Overview", label: "Overview", status: "live" },
    { key: "Devices", label: "Devices", status: "soon" },
    { key: "Topology", label: "Topology", status: "soon" },
    { key: "Monitoring", label: "Monitoring", status: "soon" },
    { key: "Alerts", label: "Alerts", status: "soon" },
    { key: "Automation", label: "Automation", status: "soon" },
    { key: "Analytics", label: "Analytics", status: "soon" },
    { key: "Admin", label: "Admin", status: "soon" },
  ];

  const [activeSection, setActiveSection] = useState(navItems[0].key);
  const { ipv4, ipv4status, ipv6, ipv6status } = GetIP();
  const { latency, latencyStatus, labels, displayLatency } = PacketLatency();
  const deviceInfo = useDeviceInfo();
  const networkInfo = useNetworkInfo();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown timezone";
  const locale = navigator.language || "Unknown locale";
  const languages =
    Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages.join(", ")
      : locale;
  const secureContext = typeof window !== "undefined" ? window.isSecureContext : false;
  const protocol =
    typeof window !== "undefined" && window.location?.protocol
      ? window.location.protocol.replace(":", "").toUpperCase()
      : "Unknown";

  const sectionShells = {
    Devices: {
      description: "Inventory, configs, baselines, and fleet hygiene",
      items: [
        {
          title: "Inventory & search",
          body: "Filter by tags, roles, sites, firmware, and reachability.",
        },
        {
          title: "Config snapshots",
          body: "Versioned configs with diffs and drift detection.",
        },
        {
          title: "Compliance guardrails",
          body: "Profiles for hardening, SNMP, SSH, banners, ACL templates.",
        },
      ],
    },
    Topology: {
      description: "Maps, dependencies, and impact-aware routing",
      items: [
        {
          title: "Live map",
          body: "Sites, links, VLAN overlays, and utilization heat.",
        },
        {
          title: "Dependency view",
          body: "Service -> device -> link chains for impact analysis.",
        },
        {
          title: "What-if",
          body: "Simulate link or node failure to see blast radius.",
        },
      ],
    },
    Monitoring: {
      description: "Real-time metrics, SLOs, and noise-tuned thresholds",
      items: [
        {
          title: "Metrics streams",
          body: "Latency, jitter, loss, throughput, CPU/mem, interface errors.",
        },
        {
          title: "Smart thresholds",
          body: "Anomaly-aware alerting with dynamic baselines.",
        },
        {
          title: "SLOs",
          body: "Golden signals per service with burn-rate views.",
        },
      ],
    },
    Alerts: {
      description: "Triage and routing that stays actionable",
      items: [
        {
          title: "Active queue",
          body: "Deduped incidents with status, owners, and timelines.",
        },
        {
          title: "Routing policies",
          body: "Escalation paths by severity, service, or team.",
        },
        {
          title: "Maintenance",
          body: "Windows and suppressions for planned work.",
        },
      ],
    },
    Automation: {
      description: "Jobs, playbooks, and safe change control",
      items: [
        {
          title: "Job catalog",
          body: "Backups, patching, config pushes, and health checks.",
        },
        {
          title: "Run history",
          body: "Audit trails with diff previews and outputs.",
        },
        {
          title: "Change control",
          body: "Dry-runs, approvals, and blast-radius hints.",
        },
      ],
    },
    Analytics: {
      description: "Capacity, reliability, and trend intelligence",
      items: [
        {
          title: "Capacity trends",
          body: "Growth curves for links, devices, and sites.",
        },
        {
          title: "Reliability",
          body: "MTTR/MTTD, incident frequency, and noise scoring.",
        },
        {
          title: "Reports",
          body: "Exportable summaries for leadership and audits.",
        },
      ],
    },
    Admin: {
      description: "Access, integrations, and workspace controls",
      items: [
        {
          title: "Users & roles",
          body: "RBAC, MFA posture, and access reviews.",
        },
        {
          title: "Integrations",
          body: "Syslog, SNMP, NetFlow/IPFIX, Webhooks, ticketing.",
        },
        {
          title: "Workspace",
          body: "Theme, defaults, API tokens, and org settings.",
        },
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
  const widgetEnv = {
    heading: "Environment",
    data: `${timeZone} · ${locale}`,
    data2: (
      <div className="env-notes">
        <p className="env-note">Languages: {languages || "Unknown"}</p>
        <p className="env-note">
          Connection: {protocol} {secureContext ? "(secure)" : "(not secure)"}
        </p>
      </div>
    ),
    width: "100%",
    status: secureContext ? "green" : "red",
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
    heading: "Server Latency (ms)",
    data: latency,
    data2: <LatencyChart labels={labels} displayLatency={displayLatency} />,
    width: "100%",
    status:
      latencyStatus === "green" && latency && Number.isFinite(latency) && latency > 120
        ? "amber"
        : latencyStatus,
  };

  const activeNavItem = navItems.find((item) => item.key === activeSection);

  const renderSection = () => {
    if (activeSection === "Overview") {
      return (
        <div className="dashboard">
          <div className="dashboard-row dashboard-row-balanced">
            <div className="dashboard-col">
              <Exhibit widget={widget0} />
              <div className="dashboard-row dashboard-row-split dashboard-row-tight">
                <Exhibit widget={widget1} />
                <Exhibit widget={widget2} />
              </div>
              <Exhibit widget={widgetEnv} />
            </div>
            <div className="dashboard-col">
              <Exhibit widget={widget3} />
              <NetworkInfo networkInfo={networkInfo} />
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
        comingSoon={activeNavItem?.status === "soon"}
      />
    );
  };

  return (
    <div className="App">
      <div className="frame">
        <Banner />
        <NavBar
          items={navItems}
          active={activeSection}
          onSelect={setActiveSection}
        />
        <div className="content-area">{renderSection()}</div>
      </div>
    </div>
  );
}

export default App;
