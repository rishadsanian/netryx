# NETRYX

Netryx is a real-time network and device operations deck. The landing view shows your public IPs and live packet latency to a local WebSocket server; top-level navigation stubs the roadmap for Devices, Topology, Monitoring, Alerts, Automation, Analytics, and Admin.

## Features (current)
- Client device card: detects device type, OS, browser, make/model, cores, memory, screen, and user agent for the viewing client (best-effort; browser-limited).
- Public IP display (IPv4/IPv6 via ipify) with status chips.
- Real-time latency stream from the local WebSocket server, charted with a smoothed line and capped history window.
- Network status pill with inline ping and link type when exposed by the browser.
- Built-in speed test (download x3, upload x1) with median scoring plus jitter; auto-runs on load and can be rerun manually.
- Environment card: shows timezone, locale/languages, and secure-context status (HTTPS vs not secure).
- Connection resilience: reconnects on socket drops and marks latency stale/red after inactivity.
- Responsive, themed UI with a command-deck banner and section shells for future panels; non-live sections are labeled “Soon” in the nav and shell header.

## Architecture
- Frontend: React + Chart.js (react-chartjs-2) for visualization and device info display.
- Device detection: Browser user agent and client hints (best-effort; some fields may be unavailable depending on browser privacy settings).
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
The app opens at `http://localhost:3000` and begins showing IPs, latency, and client device details once the socket connects.

## Navigation shells (roadmap)
- Overview: Client device, IP, and latency dashboard (live today).
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

## Notes
- Disk capacity is not exposed to browsers; the device card shows browser-visible hardware info only.
- Some device fields (model, memory, cores) can be hidden by privacy settings; they will show "Unavailable" when not provided.
