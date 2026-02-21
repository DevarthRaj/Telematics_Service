import './SignalCard.css';

const SIGNAL_MAX = 31;

export default function SignalCard({ vehicle }) {
    if (!vehicle) return <Skeleton />;

    const { signalStrength = 0, operator = 'Unknown', gpsFix } = vehicle;

    // Calculate percentage for circular progress
    const percentage = Math.min((signalStrength / SIGNAL_MAX) * 100, 100);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const signalColor = signalStrength > 20
        ? 'var(--accent-green)'
        : signalStrength > 10
            ? 'var(--accent-amber)'
            : 'var(--accent-red)';

    return (
        <div className="glass-card fade-in signal-card">
            <div className="card-header">
                <span className="icon">📶</span>
                <h3>Connectivity</h3>
            </div>

            <div className="signal-content">
                <div className="signal-visualization">
                    <svg className="progress-ring" width="100" height="100">
                        <circle
                            className="progress-ring-circle-bg"
                            stroke="rgba(66, 133, 244, 0.05)"
                            strokeWidth="8"
                            fill="transparent"
                            r={radius}
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="progress-ring-circle"
                            stroke={signalColor}
                            strokeWidth="8"
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ strokeDashoffset: offset }}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="signal-value-overlay">
                        <span className="value" style={{ color: signalColor }}>{signalStrength}</span>
                        <span className="label">RSSI</span>
                    </div>
                </div>

                <div className="signal-details">
                    <div className="detail-item">
                        <span className="detail-label">Network</span>
                        <span className="detail-value operator-name">{operator}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">GPS Status</span>
                        <span className={`status-badge ${gpsFix ? 'fix' : 'no-fix'}`}>
                            {gpsFix ? 'Valid Fix' : 'Searching...'}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Quality</span>
                        <span className="quality-text" style={{ color: signalColor }}>
                            {signalStrength > 20 ? 'Excellent' : signalStrength > 10 ? 'Good' : 'Poor'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="glass-card fade-in signal-card">
            <div className="card-header"><span className="icon">📶</span><h3>Connectivity</h3></div>
            <div className="skeleton-line wide" /><div className="skeleton-line" />
        </div>
    );
}
