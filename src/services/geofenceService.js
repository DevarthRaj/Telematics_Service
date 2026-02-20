/**
 * Geofence Service
 * 
 * Determines whether a vehicle's GPS position falls inside a predefined
 * circular geofence.  The geofence center and radius are loaded from
 * environment variables so they can be changed per-deployment.
 */

const geolib = require('geolib');
require('dotenv').config();

// Geofence definition from .env
const GEOFENCE = {
    center: {
        latitude: parseFloat(process.env.GEOFENCE_LAT) || 10.0504,
        longitude: parseFloat(process.env.GEOFENCE_LON) || 76.6131
    },
    radius: parseInt(process.env.GEOFENCE_RADIUS, 10) || 5000   // meters
};

/**
 * Check whether a coordinate is inside the geofence.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {object} { inside: boolean, distance: number (meters), geofence }
 */
function checkGeofence(latitude, longitude) {
    const point = { latitude, longitude };

    const inside = geolib.isPointWithinRadius(
        point,
        GEOFENCE.center,
        GEOFENCE.radius
    );

    const distance = geolib.getDistance(point, GEOFENCE.center);

    return {
        inside,
        distance,           // meters from center
        geofence: {
            center: GEOFENCE.center,
            radius: GEOFENCE.radius
        }
    };
}

/**
 * Return the current geofence configuration.
 */
function getGeofenceConfig() {
    return { ...GEOFENCE };
}

module.exports = { checkGeofence, getGeofenceConfig };
