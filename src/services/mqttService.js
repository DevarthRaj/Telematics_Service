const mqtt = require('mqtt');

// Use the Cluster URL from your HiveMQ dashboard
const host = 'your-cluster-url.s1.eu.hivemq.cloud';
const port = 8883; // Standard port for MQTTS

const options = {
    clientId: 'nodejs_server_' + Math.random().toString(16).substr(2, 8),
    protocol: 'mqtts', // Use mqtts for secure connection
    username: 'your_username', // From Access Management tab
    password: 'your_password',
    rejectUnauthorized: true, // Required for HiveMQ Cloud TLS
    reconnectPeriod: 1000,
};

const connectUrl = `mqtts://${host}:${port}`;
const client = mqtt.connect(connectUrl, options);

client.on('connect', () => {
    console.log('Connected to HiveMQ Cloud MQTTS successfully!');
    client.subscribe('telematics/data');
});

client.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
});