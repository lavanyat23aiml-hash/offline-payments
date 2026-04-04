import { useState, useEffect } from 'react';

/**
 * useConnectivity Hook
 * Bridge between internal state and the hardware bridge server.
 * Automatically stays in sync with browser's online/offline status.
 */
export const useConnectivity = () => {
    const [isOnline, setIsOnline] = useState(() => (
        typeof navigator !== 'undefined' ? navigator.onLine : true
    ));

    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 System Online Event');
            setIsOnline(true);
            syncWithBridge(true);
        };

        const handleOffline = () => {
            console.log('🔌 System Offline Event');
            setIsOnline(false);
            syncWithBridge(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check in case it changed during load
        if (navigator.onLine !== isOnline) setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const syncWithBridge = async (state) => {
        try {
            // bridge.js handles physical Wi-Fi adapter toggle
            const response = await fetch(`http://127.0.0.1:3001/toggle-hotspot?action=${state ? 'on' : 'off'}`);
            const data = await response.json();
            console.log('✅ Hardware Bridge Sync:', data);
        } catch (err) {
            console.warn('⚠️ Hardware Bridge not reachable at 127.0.0.1:3001');
        }
    };

    return { isOnline }; // Removed manual toggleConnectivity as per user request
};
