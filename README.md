# Telematics Server

A Node.js + Express server that receives telematics data over MQTT, parses the packets, validates CRC integrity, performs geofencing checks, and exposes a REST API for a frontend dashboard.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (edit .env as needed)
cp .env.example .env   # or just edit the existing .env

# 3. Start the server
node src/server.js
```

The server will start on **http://localhost:3000** (or the port in `.env`).

## Project Structure

```
Telematics_Service/
├── src/
│   ├── controllers/
│   │   └── vehicleController.js   # API request handlers
│   ├── services/
│   │   ├── packetParser.js        # Hex packet → structured data
│   │   ├── crcValidator.js        # CRC-16/Modbus validation
│   │   └── geofenceService.js     # Circular geofence check (geolib)
│   ├── routes/
│   │   └── vehicleRoutes.js       # Express router (/api/*)
│   ├── public/
│   │   └── index.html             # Frontend (replace with your own)
│   └── server.js                  # Entry point
├── .env                           # Environment variables
├── package.json
└── README.md
```

## API Endpoints

| Method | Path            | Description                                 |
|--------|-----------------|---------------------------------------------|
| GET    | `/api/status`   | Latest telemetry for all tracked vehicles   |
| GET    | `/api/geofence` | Geofence status for each tracked vehicle    |

## Environment Variables

| Variable          | Default                  | Description                       |
|-------------------|--------------------------|-----------------------------------|
| `PORT`            | `3000`                   | HTTP server port                  |
| `MQTT_BROKER_URL` | `mqtt://localhost:1883`  | MQTT broker connection string     |
| `MQTT_TOPIC`      | `telematic/data`         | MQTT topic to subscribe to        |
| `GEOFENCE_LAT`    | `10.0504`                | Geofence center latitude          |
| `GEOFENCE_LON`    | `76.6131`                | Geofence center longitude         |
| `GEOFENCE_RADIUS` | `5000`                   | Geofence radius in meters         |

## Deploying to AWS EC2

1. Launch an EC2 instance (Amazon Linux 2 or Ubuntu).
2. Install Node.js 18+ (`nvm install 18`).
3. Clone this repo and run `npm install`.
4. Configure `.env` with your MQTT broker URL and geofence coordinates.
5. Start with `node src/server.js` (or use **pm2** for production: `pm2 start src/server.js`).
6. Open port **3000** (or your chosen port) in the EC2 Security Group.

## Frontend Integration

Drop your friend's frontend files (`index.html`, CSS, JS, assets) into `src/public/`. The Express server serves everything in that folder as static files at the root URL.

## Dependencies

- **express** — HTTP server & static file serving
- **mqtt** — MQTT client for receiving telematics data
- **geolib** — Geospatial distance & point-in-radius checks
- **dotenv** — Loads `.env` into `process.env`
- **cors** — Cross-origin resource sharing middleware
