import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapCard.css';

// Custom car marker icon (SVG data URI — no external image needed)
const carIcon = new L.DivIcon({
    className: 'car-marker',
    html: `<div class="car-marker-inner">
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
      <circle cx="12" cy="12" r="11" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#38bdf8"/>
      <circle cx="12" cy="12" r="2" fill="#0a0e1a"/>
    </svg>
  </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Component to re-center the map when position changes
function MapUpdater({ lat, lng }) {
    const map = useMap();
    const prevPos = useRef(null);

    useEffect(() => {
        if (lat != null && lng != null) {
            const newPos = `${lat},${lng}`;
            if (prevPos.current !== newPos) {
                map.flyTo([lat, lng], map.getZoom(), { duration: 1 });
                prevPos.current = newPos;
            }
        }
    }, [lat, lng, map]);

    return null;
}

export default function MapCard({ vehicle }) {
    const lat = vehicle?.latitude ?? 10.0504;
    const lng = vehicle?.longitude ?? 76.6131;

    return (
        <div className="glass-card fade-in map-card">
            <div className="card-header">
                <span className="icon">🗺️</span>
                <h3>Live Location</h3>
                {vehicle && (
                    <span className="map-coords">
                        {lat.toFixed(5)}° {vehicle?.nsIndicator || 'N'}, {lng.toFixed(5)}° {vehicle?.ewIndicator || 'E'}
                    </span>
                )}
            </div>

            <div className="map-wrapper">
                <MapContainer
                    center={[lat, lng]}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="leaflet-map"
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <Marker position={[lat, lng]} icon={carIcon}>
                        <Popup>
                            <div style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
                                <strong>{vehicle?.vehicleId || 'Vehicle'}</strong><br />
                                Speed: {vehicle?.speed ?? 0} km/h<br />
                                {vehicle?.ignition ? '🟢 Ignition ON' : '🔴 Ignition OFF'}
                            </div>
                        </Popup>
                    </Marker>
                    <MapUpdater lat={lat} lng={lng} />
                </MapContainer>
            </div>
        </div>
    );
}
