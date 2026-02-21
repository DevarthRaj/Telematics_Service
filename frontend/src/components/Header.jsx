import './Header.css';

const RATE_OPTIONS = [
    { value: 1000, label: '1s' },
    { value: 3000, label: '3s' },
    { value: 5000, label: '5s' },
    { value: 10000, label: '10s' },
];

export default function Header({ connected, lastFetch, isLive, pollInterval, onPollChange, geofenceBreach }) {
    const timeStr = lastFetch
        ? lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '—';

    return (
        <header className="header">
            <div className="header-inner">
                <div className="header-brand">
                    <div className="header-logo-container">
                        <svg className="transight-logo" viewBox="0 0 100 100" width="40" height="40">
                            {/* Transight Logo Recreation: Dynamic geometric shape with circular nodes */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                            <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                            <circle cx="50" cy="15" r="8" fill="currentColor" />
                            <circle cx="85" cy="50" r="8" fill="currentColor" />
                            <circle cx="50" cy="85" r="8" fill="currentColor" />
                            <circle cx="15" cy="50" r="8" fill="currentColor" />
                            <circle cx="50" cy="50" r="12" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="header-title">Transight</h1>
                        <p className="header-subtitle">Redefining IoT Dimensions</p>
                    </div>
                </div>

                <div className="header-status">
                    {isLive && (
                        <span className="badge badge-green">
                            <span className="pulse-dot green" /> LIVE
                        </span>
                    )}

                    {/* Geofence status chip */}
                    <span className={`geofence-chip ${geofenceBreach ? 'breach' : 'safe'}`}>
                        <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,2" />
                            <circle cx="8" cy="8" r="2.5" />
                        </svg>
                        {geofenceBreach ? 'Geofence Breach' : 'Inside Geofence'}
                    </span>

                    <div className="poll-rate-selector">
                        <label className="poll-label">Refresh</label>
                        <select
                            className="poll-select"
                            value={pollInterval}
                            onChange={(e) => onPollChange(Number(e.target.value))}
                        >
                            {RATE_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={`connection-chip ${connected ? 'online' : 'offline'}`}>
                        <span className={`pulse-dot ${connected ? 'green' : 'red'}`} />
                        {connected ? 'Connected' : 'Offline'}
                    </div>

                    <span className="last-update">{timeStr}</span>
                    <div className="profile-icon" title="Profile">U</div>
                </div>
            </div>
        </header>
    );
}
