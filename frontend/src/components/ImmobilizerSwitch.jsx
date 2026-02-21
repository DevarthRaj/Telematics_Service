import { useState } from 'react';
import './ImmobilizerSwitch.css';

export default function ImmobilizerSwitch({ active, onToggle, killed }) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleKill = () => {
        if (loading || killed) return;

        if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 5000);
            return;
        }

        // Confirmed — execute kill
        setLoading(true);
        setConfirming(false);
        onToggle(true).finally(() => setLoading(false));
    };

    const handleReEnable = () => {
        if (loading || killed) return;
        setLoading(true);
        onToggle(false).finally(() => setLoading(false));
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setConfirming(false);
    };

    return (
        <div className={`glass-card fade-in immo-card ${active || killed ? 'engaged' : 'disengaged'}`}>
            <div className="card-header">
                <span className="icon">🛑</span>
                <h3>Vehicle Kill Switch</h3>
            </div>

            <div className="immo-body">
                <div className="immo-status">
                    <div className={`immo-indicator ${active || killed ? 'danger' : 'safe'}`}>
                        <span className="immo-icon">{active || killed ? '🔒' : '🔓'}</span>
                    </div>
                    <div className="immo-text">
                        <span className={`immo-label ${active || killed ? 'danger-text' : 'safe-text'}`}>
                            {killed ? 'KILLED — DATA FROZEN' : active ? 'VEHICLE SHUT DOWN' : 'Vehicle Running'}
                        </span>
                        <span className="immo-desc">
                            {killed
                                ? 'All data feeds stopped. Reload the page to resume.'
                                : active
                                    ? 'Immobilizer engaged — engine disabled remotely.'
                                    : 'Engine is running normally.'}
                        </span>
                    </div>
                </div>

                {/* Show kill or re-enable button based on state */}
                {killed ? (
                    <button className="immo-btn btn-engage" disabled>
                        <span>🚫 KILLED — Reload Page to Resume</span>
                    </button>
                ) : active ? (
                    <button
                        className="immo-btn btn-disengage"
                        onClick={handleReEnable}
                        disabled={loading}
                    >
                        {loading ? <span className="immo-spinner" /> : <span>🔓 Re-enable Engine</span>}
                    </button>
                ) : (
                    <button
                        className={`immo-btn btn-engage ${confirming ? 'confirming' : ''}`}
                        onClick={handleKill}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="immo-spinner" />
                        ) : confirming ? (
                            <span>⚠️ Click Again to CONFIRM KILL</span>
                        ) : (
                            <span>🔒 Shut Down Vehicle</span>
                        )}
                    </button>
                )}

                {confirming && (
                    <button className="immo-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

