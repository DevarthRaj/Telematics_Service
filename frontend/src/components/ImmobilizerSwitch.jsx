import { useState } from 'react';
import './ImmobilizerSwitch.css';

export default function ImmobilizerSwitch({ active, onToggle }) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        if (loading) return;

        // If not confirming yet, ask for confirmation
        if (!confirming) {
            setConfirming(true);
            // Auto-cancel after 5 seconds
            setTimeout(() => setConfirming(false), 5000);
            return;
        }

        // Confirmed — toggle
        setLoading(true);
        setConfirming(false);
        onToggle(!active).finally(() => setLoading(false));
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setConfirming(false);
    };

    return (
        <div className={`glass-card fade-in immo-card ${active ? 'engaged' : 'disengaged'}`}>
            <div className="card-header">
                <span className="icon">🛑</span>
                <h3>Vehicle Kill Switch</h3>
            </div>

            <div className="immo-body">
                {/* Status display */}
                <div className="immo-status">
                    <div className={`immo-indicator ${active ? 'danger' : 'safe'}`}>
                        <span className="immo-icon">{active ? '🔒' : '🔓'}</span>
                    </div>
                    <div className="immo-text">
                        <span className={`immo-label ${active ? 'danger-text' : 'safe-text'}`}>
                            {active ? 'VEHICLE SHUT DOWN' : 'Vehicle Running'}
                        </span>
                        <span className="immo-desc">
                            {active
                                ? 'Immobilizer is engaged — engine is disabled remotely.'
                                : 'Engine is allowed to run normally.'}
                        </span>
                    </div>
                </div>

                {/* Toggle button */}
                <button
                    className={`immo-btn ${confirming ? 'confirming' : ''} ${active ? 'btn-disengage' : 'btn-engage'}`}
                    onClick={handleClick}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="immo-spinner" />
                    ) : confirming ? (
                        <span>
                            {active ? '⚡ Confirm: Re-enable Engine?' : '⚠️ Confirm: SHUT DOWN Vehicle?'}
                        </span>
                    ) : (
                        <span>{active ? '🔓 Re-enable Engine' : '🔒 Shut Down Vehicle'}</span>
                    )}
                </button>

                {confirming && (
                    <button className="immo-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
