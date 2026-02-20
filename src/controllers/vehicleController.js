/**
 * Vehicle Controller
 * 
 * Handles HTTP requests for vehicle status and geofence information.
 * Reads from the shared in-memory vehicle store populated by the MQTT listener.
 */

const geofenceService = require('../services/geofenceService');

// ─── In-memory vehicle store ────────────────────────────────────────
// This object is written to by the MQTT message handler in server.js
// and read by the API endpoints below.
let vehicleStore = {};

/**
 * Update the vehicle store (called from server.js on MQTT message).
 * @param {object} data - Parsed vehicle data.
 */
function updateVehicleData(data) {
    if (!data || !data.vehicleId) return;
    vehicleStore[data.vehicleId] = {
        ...data,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * GET /api/status
 * Returns the latest data for all tracked vehicles.
 */
function getStatus(req, res) {
    const vehicles = Object.values(vehicleStore);

    if (vehicles.length === 0) {
        // Return demo data so the frontend has something to render
        return res.json({
            message: 'No live data yet — showing demo vehicle.',
            vehicles: [
                {
                    vehicleId: 'DEMO-001',
                    latitude: 10.0504,
                    longitude: 76.6131,
                    speed: 42,
                    heading: 180,
                    ignition: true,
                    status: 'Active',
                    timestamp: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                }
            ]
        });
    }

    res.json({ vehicles });
}

/**
 * GET /api/geofence
 * Returns geofence status for every tracked vehicle.
 */
function getGeofenceStatus(req, res) {
    const results = [];

    const vehicles = Object.values(vehicleStore);
    if (vehicles.length === 0) {
        // Demo entry
        const demoCheck = geofenceService.checkGeofence(10.0504, 76.6131);
        results.push({
            vehicleId: 'DEMO-001',
            ...demoCheck
        });
    } else {
        for (const v of vehicles) {
            const check = geofenceService.checkGeofence(v.latitude, v.longitude);
            results.push({
                vehicleId: v.vehicleId,
                ...check
            });
        }
    }

    res.json({ geofenceResults: results });
}

module.exports = { getStatus, getGeofenceStatus, updateVehicleData };
