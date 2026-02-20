/**
 * CRC-16/Modbus Validator
 * 
 * Computes and validates CRC-16 (Modbus) checksums for telematics packets.
 * The last 4 hex characters of a packet are the expected CRC.
 * The CRC is computed over all bytes BETWEEN the start bytes and the CRC field.
 */

/**
 * Compute CRC-16/Modbus for a byte array.
 * @param {Buffer} buffer - The bytes to compute the CRC over.
 * @returns {number} The 16-bit CRC value.
 */
function computeCRC16(buffer) {
    let crc = 0xFFFF;

    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let bit = 0; bit < 8; bit++) {
            if (crc & 0x0001) {
                crc = (crc >> 1) ^ 0xA001;
            } else {
                crc = crc >> 1;
            }
        }
    }

    return crc & 0xFFFF;
}

/**
 * Validate the CRC of a raw hex packet string.
 * Assumes:
 *   - First 4 hex chars  = start bytes  (skipped)
 *   - Last 4 hex chars   = stop bytes   (skipped)
 *   - 4 hex chars before stop = CRC field
 *   - CRC is calculated over bytes from after start to before CRC field
 * 
 * @param {string} hexPacket - Full hex string of the packet.
 * @returns {boolean} true if the CRC matches, false otherwise.
 */
function validate(hexPacket) {
    try {
        if (hexPacket.length < 16) {
            return false;
        }

        // Strip start (4 chars) and stop (4 chars)
        const withoutFrame = hexPacket.substring(4, hexPacket.length - 4);

        // Extract the CRC field (last 4 hex chars of the remaining string)
        const expectedCRCHex = withoutFrame.substring(withoutFrame.length - 4);
        const expectedCRC = parseInt(expectedCRCHex, 16);

        // Data over which CRC is computed: everything before the CRC field
        const dataHex = withoutFrame.substring(0, withoutFrame.length - 4);
        const dataBuffer = Buffer.from(dataHex, 'hex');

        const computedCRC = computeCRC16(dataBuffer);

        return computedCRC === expectedCRC;
    } catch (error) {
        console.error('[CRCValidator] Error validating CRC:', error.message);
        return false;
    }
}

module.exports = { computeCRC16, validate };
