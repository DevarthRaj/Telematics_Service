/**
 * Telematics Packet Parser
 * 
 * Parses ASCII CSV packets from the ESP32 telematics controller.
 * 
 * Packet format:
 *   $<dataLength>,<IMEI>,<packetStatus>,<frameNumber>,<operator>,<signalStrength>,
 *   <MCC>,<MNC>,<fixStatus>,<latitude>,<NS>,<longitude>,<EW>,<HDOP>,<PDOP>,
 *   <speed>,<ignition>,<immobilizer>,<voltage>,<dateTime>*<XOR_CRC_HEX>
 * 
 * Example:
 *   $91,887744556677882,1,1,03,28,404,45,1,10060100,0,76626200,0,150,250,0,1,0,120,1708456000*5A
 */

// Operator code → name mapping
const OPERATORS = {
    0: 'Unknown',
    1: 'BSNL',
    2: 'VI',
    3: 'Airtel',
    4: 'JIO'
};

/**
 * Validate XOR CRC.
 * CRC is computed over everything between '$' and '*' (exclusive).
 */
function validateCRC(packet) {
    const starIdx = packet.lastIndexOf('*');
    if (starIdx === -1) return false;

    const dataSection = packet.substring(1, starIdx); // between $ and *
    const crcHex = packet.substring(starIdx + 1).trim();

    let computed = 0;
    for (let i = 0; i < dataSection.length; i++) {
        computed ^= dataSection.charCodeAt(i);
    }

    const expected = parseInt(crcHex, 16);
    return computed === expected;
}

/**
 * Parse a raw ASCII telematics packet into structured data.
 * @param {string} rawPacket - The raw packet string (may contain debug text)
 * @returns {object|null} Parsed vehicle data or null if invalid.
 */
function parsePacket(rawPacket) {
    try {
        const input = rawPacket.toString().trim();

        // Extract the $...*XX pattern from anywhere in the input
        // This handles cases where debug text like "Transmitting: $..." is sent
        const match = input.match(/\$([^$*]+)\*([0-9A-Fa-f]{2})/);
        if (!match) {
            // Silently skip non-packet messages (debug prints, etc.)
            return null;
        }

        const dataSection = match[1]; // everything between $ and *
        const crcHex = match[2];      // the 2-char hex CRC

        // Validate XOR CRC
        let computed = 0;
        for (let i = 0; i < dataSection.length; i++) {
            computed ^= dataSection.charCodeAt(i);
        }
        const expected = parseInt(crcHex, 16);

        if (computed !== expected) {
            console.warn(`[PacketParser] CRC mismatch: computed=0x${computed.toString(16).toUpperCase()}, expected=0x${crcHex.toUpperCase()}`);
            return null;
        }

        // Split CSV fields
        const fields = dataSection.split(',');

        // fields[0] = dataLength, fields[1..19] = payload
        if (fields.length < 20) {
            console.warn('[PacketParser] Not enough fields:', fields.length, 'in:', dataSection.substring(0, 60));
            return null;
        }


        const imei = fields[1];
        const packetStatus = parseInt(fields[2], 10);
        const frameNumber = parseInt(fields[3], 10);
        const operatorCode = parseInt(fields[4], 10);
        const signalStrength = parseInt(fields[5], 10);
        const mcc = parseInt(fields[6], 10);
        const mnc = parseInt(fields[7], 10);
        const fixStatus = parseInt(fields[8], 10);

        let latitude = parseInt(fields[9], 10) / 1000000;
        const nsIndicator = parseInt(fields[10], 10);
        if (nsIndicator === 1) latitude = -latitude;

        let longitude = parseInt(fields[11], 10) / 1000000;
        const ewIndicator = parseInt(fields[12], 10);
        if (ewIndicator === 1) longitude = -longitude;

        const hdop = parseInt(fields[13], 10) / 100;
        const pdop = parseInt(fields[14], 10) / 100;
        const speed = parseInt(fields[15], 10) / 100;
        const ignitionByte = parseInt(fields[16], 10);
        const immobilizerByte = parseInt(fields[17], 10);
        const voltage = parseInt(fields[18], 10) / 10;
        const epochSeconds = parseInt(fields[19], 10);

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
            parsedAt: new Date().toISOString(),
            rawPacket: input
        };

    } catch (error) {
        console.error('[PacketParser] Error parsing packet:', error.message);
        return null;
    }
}

module.exports = { parsePacket };
