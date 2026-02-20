import './Header.css';

export default function Header({ connected, lastFetch, isLive }) {
    const timeStr = lastFetch
        ? lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '—';

    return (
        <header className="header">
            <div className="header-inner">
                <div className="header-brand">
                    <span className="header-logo">◈</span>
                    <div>
                        <h1 className="header-title">Vehicle Tracker</h1>
                        <p className="header-subtitle">Real-time telematics monitoring</p>
                    </div>
                </div>

                <div className="header-status">
                    {isLive && <span className="badge badge-green"><span className="pulse-dot green" /> LIVE</span>}
                    <div className={`connection-chip ${connected ? 'online' : 'offline'}`}>
                        <span className={`pulse-dot ${connected ? 'green' : 'red'}`} />
                        {connected ? 'Server Connected' : 'Disconnected'}
                    </div>
                    <span className="last-update">{timeStr}</span>
                </div>
            </div>
        </header>
    );
}
