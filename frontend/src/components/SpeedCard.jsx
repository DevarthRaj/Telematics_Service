import './SpeedCard.css';

export default function SpeedCard({ vehicle }) {
    if (!vehicle) return <Skeleton />;

    const speed = vehicle.speed ?? 0;
    const maxSpeed = 200;
    const pct = Math.min(speed / maxSpeed, 1);

    const radius = 70;
    const stroke = 10;
    const circumference = Math.PI * radius;
    const dashOffset = circumference * (1 - pct);

    const arcColor = speed < 60
        ? 'var(--accent-green)'
        : speed < 120
            ? 'var(--accent-amber)'
            : 'var(--accent-red)';

    return (
        <div className="glass-card fade-in speed-card">
            <div className="card-header">
                <span className="icon">⚡</span>
                <h3>Speed</h3>
            </div>

            <div className="speed-body">
                <div className="gauge-wrapper">
                    <svg viewBox="0 0 160 95" className="gauge-svg">
                        <path
                            d="M 10 85 A 70 70 0 0 1 150 85"
                            fill="none"
                            stroke="rgba(148,163,184,0.1)"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                        />
                        <path
                            d="M 10 85 A 70 70 0 0 1 150 85"
                            fill="none"
                            stroke={arcColor}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className="gauge-arc"
                            style={{ filter: `drop-shadow(0 0 6px ${arcColor})` }}
                        />
                    </svg>
                    <div className="gauge-reading">
                        <span className="gauge-number" style={{ color: arcColor }}>
                            {speed.toFixed(1)}
                        </span>
                        <span className="gauge-unit">km/h</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="glass-card fade-in speed-card">
            <div className="card-header"><span className="icon">⚡</span><h3>Speed</h3></div>
            <div className="skeleton-line wide" />
        </div>
    );
}
