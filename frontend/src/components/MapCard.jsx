import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapCard.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Car Marker Icon (Industrial Scooter/Vehicle style)
const carIcon = new L.DivIcon({
    className: 'car-marker',
    html: `
        <div class="car-marker-inner" style="
            width: 40px; 
            height: 40px; 
            background: white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);
            border: 2px solid var(--accent-blue);
        ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Component to handle map auto-centering
function MapRecenter({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function MapCard({ vehicle, geofence, geofenceBreach }) {
    const position = [vehicle?.latitude || 10.0504, vehicle?.longitude || 76.6131];
    const geofenceCenter = geofence?.center ? [geofence.center.latitude, geofence.center.longitude] : [10.0504, 76.6131];
    const geofenceRadius = geofence?.radius || 5000;

    if (!vehicle) return <Skeleton />;

    return (
        <div className="glass-card fade-in map-card">
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="icon">🗺️</span>
                    <h3>Live Perspective</h3>
                </div>
                <div className="map-coords">
                    {vehicle.latitude?.toFixed(5)}, {vehicle.longitude?.toFixed(5)}
                </div>
            </div>

            <div className="map-wrapper" style={{ position: 'relative' }}>
                <MapContainer
                    center={position}
                    zoom={15}
                    className="leaflet-map"
                    scrollWheelZoom={false}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Geofence Boundary */}
                    <Circle
                        center={geofenceCenter}
                        radius={geofenceRadius}
                        pathOptions={{
                            color: geofenceBreach ? 'var(--accent-red)' : 'var(--accent-blue)',
                            fillColor: geofenceBreach ? 'var(--accent-red)' : 'var(--accent-blue)',
                            fillOpacity: 0.03,
                            dashArray: '8, 12',
                            weight: 2
                        }}
                    />

                    {/* Vehicle Marker */}
                    <Marker position={position} icon={carIcon} />

                    <MapRecenter center={position} />
                </MapContainer>

                {/* HUD Speed Badge Overlay */}
                <div className="map-speed-badge" style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid var(--border-card)'
                }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-blue)', lineHeight: 1 }}>
                        {Math.round(vehicle.speed || 0)}
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                        KM/H
                    </span>
                </div>

                {/* HUD Geofence Details Overlay */}
                <div className="map-geofence-hud" style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.8rem 1.25rem',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-lg)',
                    border: `1px solid ${geofenceBreach ? 'rgba(234, 67, 53, 0.2)' : 'rgba(66, 133, 244, 0.15)'}`,
                    width: '220px',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: geofenceBreach ? 'var(--accent-red)' : 'var(--accent-green)',
                            boxShadow: `0 0 10px ${geofenceBreach ? 'var(--accent-red)' : 'var(--accent-green)'}`
                        }}></div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: geofenceBreach ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                            {geofenceBreach ? 'Territory Breach' : 'Secure Perimeter'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Center</span>
                            <span style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>{geofenceCenter[0].toFixed(4)}, {geofenceCenter[1].toFixed(4)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Radius</span>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{geofenceRadius} m</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Distance</span>
                            <span style={{ fontWeight: '800', color: geofenceBreach ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                                {Math.round(vehicle.geofenceDistance || 0).toLocaleString()} m
                            </span>
                        </div>
                        <div style={{
                            marginTop: '0.4rem',
                            paddingTop: '0.6rem',
                            borderTop: '1px solid rgba(0,0,0,0.05)',
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic'
                        }}>
                            Safety Protocol: {geofenceBreach ? 'Active Mitigation' : 'Nominal Monitoring'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="glass-card fade-in map-card">
            <div className="card-header"><span className="icon">🗺️</span><h3>Live Perspective</h3></div>
            <div className="map-wrapper skeleton" style={{ background: '#f8f9fc', height: '280px', borderRadius: '14px' }}></div>
        </div>
    );
}
