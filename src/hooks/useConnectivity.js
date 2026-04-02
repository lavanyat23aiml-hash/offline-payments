import { useState, useEffect } from 'react';

/**
 * Connectivity State
 * Manages the simulated online/offline status.
 */

export const useConnectivity = () => {
    const [isOnline, setIsOnline] = useState(() => {
        const saved = localStorage.getItem('demo_connectivity');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleConnectivity = async () => {
        const nextState = !isOnline;
        setIsOnline(nextState);
        localStorage.setItem('demo_connectivity', JSON.stringify(nextState));
        
        console.log(`📡 Toggling Connectivity: ${isOnline ? 'ONLINE' : 'OFFLINE'} -> ${nextState ? 'ONLINE' : 'OFFLINE'}`);

        // Call hardware bridge with explicit error handling
        try {
            const response = await fetch(`http://127.0.0.1:3001/toggle-hotspot?action=${nextState ? 'on' : 'off'}`);
            const data = await response.json();
            console.log('✅ Hardware Bridge Sync:', data);
        } catch (err) {
            console.error('❌ Bridge Sync Failed. Ensure "npm run bridge" is running as Admin.');
        }
    };

    return { isOnline, toggleConnectivity };
};
