/**
 * Telematics Server — Entry Point
 *
 * 1. Serves the frontend (static files from src/public/)
 * 2. Connects to an MQTT broker to receive telematics packets
 * 3. Parses packets → validates CRC → runs geofence checks → stores in memory
 * 4. Exposes REST API at /api/*
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const mqttClient = require('./services/mqttService');
const packetParser = require('./services/packetParser');
const geofenceService = require('./services/geofenceService');
const vehicleController = require('./controllers/vehicleController');
const vehicleRoutes = require('./routes/vehicleRoutes');

// ─── Express Setup ──────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

// Mount API routes
app.use('/api', vehicleRoutes);

// Fallback: serve index.html for any non-API route (SPA support)
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── MQTT Message Handler ───────────────────────────────────────────
// Inject MQTT client into controller so immobilizer can publish commands
vehicleController.setImmobilizer._mqttClient = mqttClient;
mqttClient.on('message', (topic, message) => {
    const rawPacket = message.toString();
    console.log(`[MQTT] Received packet on ${topic} (${rawPacket.length} chars)`);

    // 1. Parse the ASCII CSV telematics packet
    const parsed = packetParser.parsePacket(rawPacket);
    if (!parsed) {
        console.warn('[MQTT] Packet could not be parsed — skipping');
        return;
    }

    // 2. Geofence check
    const geoResult = geofenceService.checkGeofence(parsed.latitude, parsed.longitude);
    parsed.geofence = geoResult;

    console.log(`[MQTT] Vehicle ${parsed.vehicleId} — lat: ${parsed.latitude}, lon: ${parsed.longitude}, speed: ${parsed.speed} km/h`);

    // 3. Store the data so the API can serve it
    vehicleController.updateVehicleData(parsed);
});


// ─── Start HTTP Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log(`  Telematics Server running on port ${PORT}`);
    console.log(`  Frontend : http://localhost:${PORT}`);
    console.log(`  API      : http://localhost:${PORT}/api/status`);
    console.log(`  Geofence : http://localhost:${PORT}/api/geofence`);
    console.log('═══════════════════════════════════════════');
});
