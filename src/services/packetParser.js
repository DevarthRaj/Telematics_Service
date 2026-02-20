/**
 * Telematics Packet Parser
 * 
 * Parses raw hex telematics packets into structured vehicle data.
 * Packet frame:
 *   [Start Bytes] [Packet Length] [IMEI (15)] [Command]
 *   [Data Payload] [CRC] [Stop Bytes]
 * 
 * Data payload fields (in order):
 *   Packet Status, Frame Number, Operator, Signal Strength,
 *   MCC, MNC, Fix Status, Latitude, NS, Longitude, EW,
 *   HDOP, PDOP, Speed, Ignition, Immobilizer,
 *   Analog Voltage, Date Time
 */

const crcValidator = require('./crcValidator');

// Operator code → name mapping
const OPERATORS = {
    0: 'Unknown',
    1: 'BSNL',
    2: 'VI',
    3: 'Airtel',
    4: 'JIO'
};

/**
 * Read `count` hex characters from `hex` at `offset`, parse as integer.
 * Returns [value, newOffset].
 */
function readHexInt(hex, offset, charCount) {
    const val = parseInt(hex.substring(offset, offset + charCount), 16);
    return [val, offset + charCount];
}

/**
 * Parse a raw telematics packet string into structured data.
 * @param {string} rawPacket - The raw hex string received from the device.
 * @returns {object|null} Parsed vehicle data or null if invalid.
 */
function parsePacket(rawPacket) {
    try {
        const packet = rawPacket.trim();

        if (packet.length < 30) {
            console.warn('[PacketParser] Packet too short:', packet.length, 'chars');
            return null;
        }

        // --- 1. Validate CRC ---
        if (!crcValidator.validate(packet)) {
            console.warn('[PacketParser] CRC validation failed');
            return null;
        }

        // --- 2. Extract Header ---
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
        const payloadEnd = packet.length - 8; // minus CRC (4) + stop (4)
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
 * Parse the data payload according to the spec table.
 * Each field is read sequentially as 2-byte (4 hex char) values
 * unless stated otherwise.
 */
function parsePayload(payload, imei) {
    let offset = 0;

    // Packet Status — 1 byte (2 hex): 0=History, 1=Live
    let packetStatus;
    [packetStatus, offset] = readHexInt(payload, offset, 2);

    // Frame Number — 2 bytes (4 hex)
    let frameNumber;
    [frameNumber, offset] = readHexInt(payload, offset, 4);

    // Operator — 1 byte (2 hex): 00=Unknown, 01=BSNL, 02=VI, 03=Airtel, 04=JIO
    let operatorCode;
    [operatorCode, offset] = readHexInt(payload, offset, 2);

    // Signal Strength — 1 byte (2 hex): 0–31
    let signalStrength;
    [signalStrength, offset] = readHexInt(payload, offset, 2);

    // MCC — 2 bytes (4 hex)
    let mcc;
    [mcc, offset] = readHexInt(payload, offset, 4);

    // MNC — 2 bytes (4 hex)
    let mnc;
    [mnc, offset] = readHexInt(payload, offset, 4);

    // Fix Status — 1 byte (2 hex): 0=No Fix, 1=Valid Fix
    let fixStatus;
    [fixStatus, offset] = readHexInt(payload, offset, 2);

    // Latitude — 4 bytes (8 hex): divide by 1,000,000
    let latRaw;
    [latRaw, offset] = readHexInt(payload, offset, 8);
    let latitude = latRaw / 1000000;

    // NS Indication — 1 byte (2 hex): 0=N, 1=S
    let nsIndicator;
    [nsIndicator, offset] = readHexInt(payload, offset, 2);
    if (nsIndicator === 1) latitude = -latitude;

    // Longitude — 4 bytes (8 hex): divide by 1,000,000
    let lonRaw;
    [lonRaw, offset] = readHexInt(payload, offset, 8);
    let longitude = lonRaw / 1000000;

    // EW Indication — 1 byte (2 hex): 0=E, 1=W
    let ewIndicator;
    [ewIndicator, offset] = readHexInt(payload, offset, 2);
    if (ewIndicator === 1) longitude = -longitude;

    // HDOP — 2 bytes (4 hex): divide by 100
    let hdopRaw;
    [hdopRaw, offset] = readHexInt(payload, offset, 4);
    const hdop = hdopRaw / 100;

    // PDOP — 2 bytes (4 hex): divide by 100
    let pdopRaw;
    [pdopRaw, offset] = readHexInt(payload, offset, 4);
    const pdop = pdopRaw / 100;

    // Speed — 2 bytes (4 hex): divide by 100 (km/h)
    let speedRaw;
    [speedRaw, offset] = readHexInt(payload, offset, 4);
    const speed = speedRaw / 100;

    // Ignition Status — 1 byte (2 hex): 0=OFF, 1=ON
    let ignitionByte;
    [ignitionByte, offset] = readHexInt(payload, offset, 2);

    // Immobilizer Status — 1 byte (2 hex): 0=OFF, 1=ON
    let immobilizerByte;
    [immobilizerByte, offset] = readHexInt(payload, offset, 2);

    // Analog Voltage — 2 bytes (4 hex): divide by 10 (V)
    let voltageRaw;
    [voltageRaw, offset] = readHexInt(payload, offset, 4);
    const voltage = voltageRaw / 10;

    // Date Time — 4 bytes (8 hex): UTC epoch seconds
    let epochSeconds;
    [epochSeconds, offset] = readHexInt(payload, offset, 8);

    return {
        vehicleId: imei,
        isLive: packetStatus === 1,
        frameNumber,
        operator: OPERATORS[operatorCode] || 'Unknown',
        operatorCode,
        signalStrength,
        mcc,
        mnc,
        gpsFix: fixStatus === 1,
        latitude,
        longitude,
        nsIndicator: nsIndicator === 0 ? 'N' : 'S',
        ewIndicator: ewIndicator === 0 ? 'E' : 'W',
        hdop,
        pdop,
        speed,
        ignition: ignitionByte === 1,
        immobilizer: immobilizerByte === 1,
        voltage,
        timestamp: new Date(epochSeconds * 1000).toISOString(),
        status: ignitionByte === 1 ? 'Active' : 'Inactive',
        parsedAt: new Date().toISOString()
    };
}

module.exports = { parsePacket, parsePayload };
