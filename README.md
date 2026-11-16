# SkyScope

SkyScope is a real-time aircraft tracking dashboard that visualizes live flight data on an interactive 3D globe. It combines a Node.js/Express backend with a React + Vite frontend and renders aircraft positions using React Three Fiber and Three.js.

The app fetches live aircraft state data from the OpenSky Network API, filters valid locations, and displays them on a rotating Earth model with a detailed aircraft info panel for selected flights.

## Features

- Real-time aircraft data from OpenSky Network
- Interactive 3D globe visualization
- Aircraft markers positioned by latitude and longitude
- Aircraft detail panel with flight metadata
- Track mode to follow a selected aircraft
- Automatic polling and cache refresh for live updates
- Responsive dashboard UI

## Tech Stack

- Frontend: React, Vite, React Three Fiber, Drei, Three.js
- State management: Zustand
- Backend: Node.js, Express
- Data source: OpenSky Network API

## Project Structure

```text
SkyScope/
├── backend/
│   ├── server.js
│   └── services/
│       └── opensky.services.js
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .env
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- OpenSky Network API credentials (client ID and client secret)

## Environment Setup

Create a `.env` file in the project root with the following values:

```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
PORT=5000
AIRCRAFT_REFRESH_INTERVAL=30000
```

> Replace the placeholder values with your actual OpenSky credentials. The backend uses these variables to authenticate and fetch live aircraft state data.

## Installation

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running the App

Start the backend server from the project root:

```bash
npm run dev
```

Start the frontend development server in a separate terminal:

```bash
cd frontend
npm run dev
```

Then open the local Vite URL shown in the terminal (typically `http://localhost:5173`).

## How It Works

- The Express backend polls the OpenSky API on a configured interval.
- Aircraft data is normalized and cached in memory.
- The React frontend requests `/api/aircraft` from the backend.
- Vite proxies `/api` requests to the backend running on port 5000.
- The globe renders each aircraft as a 3D model positioned by its coordinates.
- Selecting an aircraft opens an info card and allows camera tracking.

## Notes

- The backend currently keeps its dataset in memory and is intended for local development and demo use.
- The app depends on OpenSky Network authentication, so valid credentials are required for live flight data.
- The frontend and backend run independently and are connected through Vite proxying.

## License

This project is currently unlicensed unless otherwise specified.
