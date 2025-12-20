# NETRYX

Netryx is a real-time network and device operations deck. The landing view shows your public IPs and live packet latency to a local WebSocket server; top-level navigation stubs the roadmap for Devices, Topology, Monitoring, Alerts, Automation, Analytics, and Admin.

## Features (current)
- Public IP display (IPv4/IPv6 via ipify) with status chips.
- Real-time latency stream from the local WebSocket server, charted with a smoothed line and capped history window.
- Connection resilience: reconnects on socket drops and marks latency stale/red after inactivity.
- Responsive, themed UI with a command-deck banner and section shells for future panels.

## Architecture
- Frontend: React + Chart.js (react-chartjs-2) for visualization.
- Backend: Node.js WebSocket server (`server.js`) sending timestamps each second.
- APIs: ipify (IPv4/IPv6) for public address lookup.

## Install
```
git clone <repository-url>
cd Netryx
npm install
```

## Run
1) Start the WebSocket server (default `ws://localhost:55455`):
```
node server.js
```
2) In another terminal start the React app:
```
npm start
```
The app opens at `http://localhost:3000` and begins showing IPs and latency once the socket connects.

## Navigation shells (roadmap)
- Overview: IP + latency dashboard (live today).
- Devices: inventory, configs, compliance baselines.
- Topology: maps, dependencies, what-if impact.
- Monitoring: streams, thresholds, SLOs.
- Alerts: incident queue, routing, maintenance.
- Automation: jobs, playbooks, change control.
- Analytics: capacity, reliability, reporting.
- Admin: RBAC, integrations, workspace settings.

## Endpoints
- IPv4: `https://api.ipify.org?format=json`
- IPv6: `https://api64.ipify.org?format=json`
- WebSocket: `ws://localhost:55455`

## Tech
React, Node.js, ws, Chart.js, Axios, react-chartjs-2, websocket.
