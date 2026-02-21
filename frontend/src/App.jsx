import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import SignalCard from './components/SignalCard';
import MapCard from './components/MapCard';
import SpeedCard from './components/SpeedCard';
import VehicleCard from './components/VehicleCard';
import ImmobilizerSwitch from './components/ImmobilizerSwitch';

export default function App() {
    const [vehicle, setVehicle] = useState(null);
    const [isDummy, setIsDummy] = useState(true);
    const [immobilizerState, setImmobilizerState] = useState(false);
    const [connected, setConnected] = useState(false);
    const [geofence, setGeofence] = useState(null);
    const [geofenceBreach, setGeofenceBreach] = useState(false);
    const [lastFetch, setLastFetch] = useState(null);
    const [killed, setKilled] = useState(false);
    const [pollInterval, setPollInterval] = useState(3000);

    const pollRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/status');
            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            const v = data.vehicles?.[0] || null;
            setVehicle(v);
            setIsDummy(!!v?.isDummy);
            setImmobilizerState(data.immobilizerState ?? false);
            setGeofence(data.geofence || null);
            setGeofenceBreach(data.geofenceBreach ?? false);
            setConnected(true);
            setLastFetch(new Date());
        } catch {
            setConnected(false);
        }
    }, []);

    // Re-create interval whenever pollInterval changes
    useEffect(() => {
        if (killed) return;
        fetchData();
        pollRef.current = setInterval(fetchData, pollInterval);
        return () => clearInterval(pollRef.current);
    }, [fetchData, killed, pollInterval]);

    const handleImmobilizerToggle = async (active) => {
        try {
            const res = await fetch('/api/immobilizer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active })
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setImmobilizerState(data.immobilizerState);

            if (active) {
                clearInterval(pollRef.current);
                pollRef.current = null;
                setKilled(true);
                setConnected(false);
                setVehicle(prev => prev ? { ...prev, speed: 0 } : prev);
            }
        } catch (err) {
            console.error('Immobilizer toggle failed:', err);
        }
    };

    return (
        <>
            <Header
                connected={connected}
                lastFetch={lastFetch}
                isLive={!killed && vehicle?.isLive}
                pollInterval={pollInterval}
                onPollChange={setPollInterval}
                geofenceBreach={geofenceBreach}
            />

            <main className="dashboard-grid">
                {killed && (
                    <div className="dummy-banner" style={{ borderColor: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
                        🚨 KILL SWITCH ENGAGED — All data feeds stopped. Reload the page to resume.
                    </div>
                )}

                {!killed && isDummy && (
                    <div className="dummy-banner">
                        ⚠ No live data from device — displaying demo values. Data will update automatically when packets arrive.
                    </div>
                )}

                <div className="full-width">
                    <MapCard vehicle={vehicle} geofence={geofence} geofenceBreach={geofenceBreach} />
                </div>

                <div className="stat-column">
                    <VehicleCard vehicle={vehicle} />
                    <SpeedCard vehicle={vehicle} />
                </div>

                <SignalCard vehicle={vehicle} />

                <ImmobilizerSwitch
                    active={immobilizerState}
                    onToggle={handleImmobilizerToggle}
                    killed={killed}
                />
            </main>
        </>
    );
}

