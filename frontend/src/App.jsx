import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SignalCard from './components/SignalCard';
import MapCard from './components/MapCard';
import SpeedCard from './components/SpeedCard';
import VehicleCard from './components/VehicleCard';
import ImmobilizerSwitch from './components/ImmobilizerSwitch';

const POLL_INTERVAL = 3000;

export default function App() {
    const [vehicle, setVehicle] = useState(null);
    const [isDummy, setIsDummy] = useState(true);
    const [immobilizerState, setImmobilizerState] = useState(false);
    const [connected, setConnected] = useState(false);
    const [lastFetch, setLastFetch] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/status');
            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            const v = data.vehicles?.[0] || null;
            setVehicle(v);
            setIsDummy(!!v?.isDummy);
            setImmobilizerState(data.immobilizerState ?? false);
            setConnected(true);
            setLastFetch(new Date());
        } catch {
            setConnected(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchData]);

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
        } catch (err) {
            console.error('Immobilizer toggle failed:', err);
        }
    };

    return (
        <>
            <Header connected={connected} lastFetch={lastFetch} isLive={vehicle?.isLive} />

            <main className="dashboard-grid">
                {isDummy && (
                    <div className="dummy-banner">
                        ⚠ No live data from device — displaying demo values. Data will update automatically when packets arrive.
                    </div>
                )}

                <MapCard vehicle={vehicle} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <SignalCard vehicle={vehicle} />
                    <SpeedCard vehicle={vehicle} />
                </div>

                <VehicleCard vehicle={vehicle} />
                <ImmobilizerSwitch
                    active={immobilizerState}
                    onToggle={handleImmobilizerToggle}
                />
            </main>
        </>
    );
}
