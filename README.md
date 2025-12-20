# NETRYX

Netryx is a real-time network monitoring dashboard built with React and Node.js. It provides a simple interface to monitor your public IP addresses (IPv4 and IPv6) and packet latency to a WebSocket server.

## Features

- **Public IP Display**: Fetches and displays your public IPv4 and IPv6 addresses using the ipify API.
- **Real-Time Latency Monitoring**: Measures packet latency by connecting to a local WebSocket server and displays it in a live chart.
- **Responsive Dashboard**: Clean, responsive UI with status indicators for each metric.
- **WebSocket Integration**: Uses WebSocket for real-time data transmission.

## Architecture

- **Frontend**: React application with Chart.js for data visualization.
- **Backend**: Node.js WebSocket server that sends timestamps for latency calculation.
- **APIs**: Integrates with external APIs for IP address retrieval.

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd Netryx
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the WebSocket server:
   ```
   node server.js
   ```
   The server will start on `ws://localhost:55455`.

2. In a new terminal, start the React application:
   ```
   npm start
   ```
   The app will open in your browser at `http://localhost:3000`.

3. The dashboard will display your public IPs and start monitoring latency once the WebSocket connection is established.

## Components

- **Banner**: Displays the application title.
- **Exhibit**: Reusable widget component for displaying metrics with status indicators.
- **LatencyChart**: Chart component using Chart.js to visualize latency data over time.

## API Endpoints

- IPv4: `https://api.ipify.org?format=json`
- IPv6: `https://api64.ipify.org?format=json`
- WebSocket: `ws://localhost:55455`

## Technologies Used

- React
- Node.js
- WebSocket (ws library)
- Chart.js
- Axios
- Socket.io-client (though primarily using w3cwebsocket)

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

## License

This project is private.