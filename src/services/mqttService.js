const mqtt = require('mqtt');

const host = '033dc7c1b38949c19f3a928979427b30.s1.eu.hivemq.cloud';
const port = 8883;

const options = {
    clientId: 'nodejs_server_' + Math.random().toString(16).substr(2, 8),
    protocol: 'mqtts',
    username: 'devarthraj',
    password: '#Debu123',
    rejectUnauthorized: true, // Keep this true for security (Phase 4)
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    // CRITICAL: SNI support is required for HiveMQ Cloud
    servername: host
};

const connectUrl = `mqtts://${host}:${port}`;
console.log(`Attempting to connect to: ${connectUrl}`);

const client = mqtt.connect(connectUrl, options);

client.on('connect', () => {
    console.log('✅ Connected to HiveMQ Cloud MQTTS successfully!');
    client.subscribe('telematics/data', (err) => {
        if (!err) console.log('Subscribed to telematics/data');
    });
});

client.on('error', (err) => {
    // This will print the detailed reason (e.g., 'self signed certificate' or 'Not authorized')
    console.error('❌ [MQTT] Connection error:', err.message);
});

client.on('offline', () => {
    console.log('⚠️ [MQTT] Client went offline');
});

module.exports = client;