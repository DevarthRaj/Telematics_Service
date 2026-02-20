/**
 * Telematics Packet Parser
 * 
 * Parses raw hex/ASCII telematics packets into structured vehicle data.
 * Packet format (typical telematics frame):
 *   [Start Bytes (2)] [Packet Length (2)] [IMEI (15)] [Command (1)]
 *   [Data Payload (variable)] [CRC (2)] [Stop Bytes (2)]
 * 
 * The data payload contains GPS coordinates, speed, ignition status,
 * timestamps, and other vehicle parameters.
 */

const crcValidator = require('./crcValidator');

/**
 * Parse a raw telematics packet string into structured data.
 * @param {string} rawPacket - The raw hex string received from the device.
 * @returns {object|null} Parsed vehicle data or null if invalid.
 */
function parsePacket(rawPacket) {
    try {
        const packet = rawPacket.trim();

        // Minimum viable packet length check (header + minimal payload + CRC + stop)
        if (packet.length < 30) {
            console.warn('[PacketParser] Packet too short:', packet.length, 'chars');
            return null;
        }

        // --- 1. Validate CRC ---
        if (!crcValidator.validate(packet)) {
            console.warn('[PacketParser] CRC validation failed');
            return null;
        }

        // --- 2. Extract Header Fields ---
        let offset = 0;

        const startBytes = packet.substring(offset, offset + 4);
        offset += 4;

        const packetLength = parseInt(packet.substring(offset, offset + 4), 16);
        offset += 4;

        const imei = packet.substring(offset, offset + 30); // 15 bytes = 30 hex chars
        offset += 30;

        const command = packet.substring(offset, offset + 2);
        offset += 2;

        // --- 3. Extract Data Payload ---
        // The remaining bytes minus CRC (4 hex chars) and stop bytes (4 hex chars)
        const payloadEnd = packet.length - 8; // 4 chars CRC + 4 chars stop
        const payload = packet.substring(offset, payloadEnd);

        const vehicleData = parsePayload(payload, imei);
        vehicleData.rawPacket = packet;
        vehicleData.command = command;

        return vehicleData;

    } catch (error) {
        console.error('[PacketParser] Error parsing packet:', error.message);
        return null;
    }
}

/**
 * Parse the data payload section of a telematics packet.
 * @param {string} payload - Hex string of the data payload.
 * @param {string} imei    - Device IMEI (hex string, 30 chars).
 * @returns {object} Parsed vehicle telemetry data.
 */
function parsePayload(payload, imei) {
    // Field positions are illustrative and should be adjusted
    // to match the exact protocol from Table 5.1 in your spec PDF.
    let offset = 0;

    // Timestamp — 4 bytes (8 hex chars), Unix epoch seconds
    const timestampHex = payload.substring(offset, offset + 8);
    const timestamp = parseInt(timestampHex, 16);
    offset += 8;

    // Latitude — 4 bytes (8 hex chars), stored as degrees × 1 000 000
    const latRaw = parseInt(payload.substring(offset, offset + 8), 16);
    const latitude = latRaw / 1000000;
    offset += 8;

    // Longitude — 4 bytes (8 hex chars)
    const lonRaw = parseInt(payload.substring(offset, offset + 8), 16);
    const longitude = lonRaw / 1000000;
    offset += 8;

    // Speed — 2 bytes (4 hex chars), km/h
    const speed = parseInt(payload.substring(offset, offset + 4), 16);
    offset += 4;

    // Heading / course — 2 bytes (4 hex chars), degrees
    const heading = parseInt(payload.substring(offset, offset + 4), 16);
    offset += 4;

    // Ignition status — 1 byte (2 hex chars): 0x01 = ON, 0x00 = OFF
    const ignitionByte = parseInt(payload.substring(offset, offset + 2), 16);
    const ignition = ignitionByte === 1;
    offset += 2;

    return {
        vehicleId: imei,
        latitude,
        longitude,
        speed,
        heading,
        ignition,
        timestamp: new Date(timestamp * 1000).toISOString(),
        status: ignition ? 'Active' : 'Inactive',
        parsedAt: new Date().toISOString()
    };
}

module.exports = { parsePacket, parsePayload };
