/**
 * Vehicle Controller
 * 
 * Handles HTTP requests for vehicle status and immobilizer control.
 */

const geofenceService = require('../services/geofenceService');

// ─── In-memory vehicle store ────────────────────────────────────────
let vehicleStore = {};

// Immobilizer state (persists across requests, sent to device via MQTT)
let immobilizerState = false;

/**
 * Update the vehicle store (called from server.js on MQTT message).
 */
function updateVehicleData(data) {
    if (!data || !data.vehicleId) return;
    vehicleStore[data.vehicleId] = {
        ...data,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Demo data matching the real packet format — shown when no live data exists.
 */
function getDemoVehicle() {
    return {
        vehicleId: 'DEMO-353701080000000',
        isLive: false,
        frameNumber: 1,
        operator: 'Airtel',
        operatorCode: 3,
        signalStrength: 22,
        mcc: 404,
        mnc: 45,
        gpsFix: true,
        latitude: 10.0504,
        longitude: 76.6131,
        nsIndicator: 'N',
        ewIndicator: 'E',
        hdop: 1.2,
        pdop: 2.1,
        speed: 42.5,
        ignition: true,
        immobilizer: immobilizerState,
        voltage: 12.4,
        timestamp: new Date().toISOString(),
        status: 'Active',
        parsedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isDummy: true
    };
}

/**
 * GET /api/status
 */
function getStatus(req, res) {
    const vehicles = Object.values(vehicleStore);

    if (vehicles.length === 0) {
        return res.json({
            message: 'No live data — showing demo vehicle.',
            vehicles: [getDemoVehicle()],
            immobilizerState
        });
    }

    res.json({ vehicles, immobilizerState });
}

/**
 * GET /api/geofence
 */
function getGeofenceStatus(req, res) {
    const vehicles = Object.values(vehicleStore);
    const results = [];

    if (vehicles.length === 0) {
        const demo = getDemoVehicle();
        const check = geofenceService.checkGeofence(demo.latitude, demo.longitude);
        results.push({ vehicleId: demo.vehicleId, ...check });
    } else {
        for (const v of vehicles) {
            const check = geofenceService.checkGeofence(v.latitude, v.longitude);
            results.push({ vehicleId: v.vehicleId, ...check });
        }
    }

    res.json({ geofenceResults: results });
}

/**
 * POST /api/immobilizer
 * Body: { "active": true/false }
 * Toggles the immobilizer state and optionally publishes an MQTT command.
 */
function setImmobilizer(req, res) {
    const { active } = req.body;

    if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'Body must contain { "active": true|false }' });
    }

    immobilizerState = active;

    // If MQTT client is available (injected in server.js), publish the command
    if (setImmobilizer._mqttClient) {
        const topic = 'telematics/command';
        const payload = JSON.stringify({ command: 'immobilizer', active });
        setImmobilizer._mqttClient.publish(topic, payload, (err) => {
            if (err) console.error('[Immobilizer] MQTT publish error:', err.message);
            else console.log(`[Immobilizer] Sent command: active=${active}`);
        });
    }

    console.log(`[Immobilizer] State set to: ${active ? 'ENGAGED (Vehicle OFF)' : 'DISENGAGED (Vehicle ON)'}`);
    res.json({ success: true, immobilizerState: active });
}

module.exports = {
    getStatus,
    getGeofenceStatus,
    setImmobilizer,
    updateVehicleData
};
