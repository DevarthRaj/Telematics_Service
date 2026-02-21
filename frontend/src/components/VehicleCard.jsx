import './VehicleCard.css';

export default function VehicleCard({ vehicle }) {
    if (!vehicle) return <Skeleton />;

    const isActive = vehicle.status === 'Active';

    return (
        <div className="glass-card fade-in vehicle-card">
            <div className="card-header">
                <span className="icon">🚗</span>
                <h3>Vehicle Status</h3>
                <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`} style={{ marginLeft: 'auto' }}>
                    <span className={`pulse-dot ${isActive ? 'green' : 'red'}`} />
                    {vehicle.status}
                </span>
            </div>

            <div className="data-row">
                <span className="data-label">Ignition</span>
                <span className="data-value">
                    <span className={`ign ${vehicle.ignition ? 'on' : 'off'}`}>
                        {vehicle.ignition ? '🟢 Engine ON' : '🔴 Engine OFF'}
                    </span>
                </span>
            </div>

            <div className="data-row">
                <span className="data-label">Battery Voltage</span>
                <span className="data-value">{vehicle.voltage?.toFixed(1) ?? '—'} V</span>
            </div>

            <div className="data-row">
                <span className="data-label">GPS Accuracy (HDOP)</span>
                <span className="data-value">{vehicle.hdop?.toFixed(2) ?? '—'}</span>
            </div>

            <div className="data-row">
                <span className="data-label">Frame #</span>
                <span className="data-value">{vehicle.frameNumber ?? '—'}</span>
            </div>

            <div className="data-row">
                <span className="data-label">Last Update</span>
                <span className="data-value">{formatTime(vehicle.timestamp)}</span>
            </div>

            <div className="data-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(66, 133, 244, 0.1)' }}>
                <span className="data-label">Latitude</span>
                <span className="data-value" style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{vehicle.latitude?.toFixed(6) ?? '—'}</span>
            </div>

            <div className="data-row">
                <span className="data-label">Longitude</span>
                <span className="data-value" style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{vehicle.longitude?.toFixed(6) ?? '—'}</span>
            </div>

            <div className="data-row">
                <span className="data-label">Center Offset</span>
                <span className="data-value" style={{ fontWeight: '700' }}>{Math.round(vehicle.geofenceDistance || 0).toLocaleString()} m</span>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="glass-card fade-in vehicle-card">
            <div className="card-header"><span className="icon">🚗</span><h3>Vehicle Status</h3></div>
            <div className="skeleton-line wide" /><div className="skeleton-line" /><div className="skeleton-line" />
        </div>
    );
}

function formatTime(ts) {
    if (!ts) return '—';
    try {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return ts; }
}
