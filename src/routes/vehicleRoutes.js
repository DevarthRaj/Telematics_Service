/**
 * Vehicle API Routes
 */

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// GET /api/status — latest vehicle telemetry
router.get('/status', vehicleController.getStatus);

// GET /api/geofence — geofence check for all vehicles
router.get('/geofence', vehicleController.getGeofenceStatus);

module.exports = router;
