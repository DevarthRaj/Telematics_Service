import './SignalCard.css';

const SIGNAL_MAX = 31;
const TOTAL_BARS = 5;

export default function SignalCard({ vehicle }) {
    if (!vehicle) return <Skeleton />;

    const { signalStrength = 0, operator = 'Unknown', gpsFix } = vehicle;

    // Map 0–31 signal to 0–5 bars
    const filledBars = Math.round((signalStrength / SIGNAL_MAX) * TOTAL_BARS);

    return (
        <div className="glass-card fade-in signal-card">
            <div className="card-header">
                <span className="icon">📶</span>
                <h3>Network & GPS</h3>
            </div>

            <div className="signal-body">
                {/* Signal bars visual */}
                <div className="signal-bars-section">
                    <div className="signal-bars" title={`Signal: ${signalStrength}/${SIGNAL_MAX}`}>
                        {Array.from({ length: TOTAL_BARS }).map((_, i) => (
                            <div
                                key={i}
                                className={`bar ${i < filledBars ? 'filled' : ''}`}
                                style={{ height: `${((i + 1) / TOTAL_BARS) * 100}%` }}
                            />
                        ))}
                    </div>
                    <span className="signal-number">{signalStrength}<span className="signal-max">/{SIGNAL_MAX}</span></span>
                </div>

                {/* Info */}
                <div className="signal-info">
                    <div className="data-row">
                        <span className="data-label">Network</span>
                        <span className="data-value operator-name">{operator}</span>
                    </div>
                    <div className="data-row">
                        <span className="data-label">GPS Fix</span>
                        <span className="data-value">
                            <span className={`badge ${gpsFix ? 'badge-green' : 'badge-red'}`}>
                                {gpsFix ? '● Valid Fix' : '○ No Fix'}
                            </span>
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="data-label">Signal Quality</span>
                        <span className="data-value">
                            <span className={`badge ${signalStrength > 20 ? 'badge-green' : signalStrength > 10 ? 'badge-amber' : 'badge-red'}`}>
                                {signalStrength > 20 ? 'Strong' : signalStrength > 10 ? 'Moderate' : 'Weak'}
                            </span>
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
            <div className="card-header"><span className="icon">📶</span><h3>Network & GPS</h3></div>
            <div className="skeleton-line wide" /><div className="skeleton-line" />
        </div>
    );
}
