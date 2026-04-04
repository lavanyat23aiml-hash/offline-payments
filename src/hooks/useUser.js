import { useState, useEffect } from 'react';

/**
 * useUser Hook
 * Manages user profile, bank details, and PIN authentication.
 */
export const useUser = () => {
    const [user, setUserState] = useState(() => {
        const saved = localStorage.getItem('upi_user_profile');
        if (saved) return JSON.parse(saved);
        
        return {
            name: 'John Doe',
            upiId: 'johndoe@okaxis',
            bankName: 'Axis Bank',
            accountNo: 'XXXX XXXX 8921',
            branch: 'Mumbai Central',
            pin: '1234',
            qrData: 'upi://pay?pa=johndoe@okaxis&pn=John%20Doe&mc=0000&mode=02&purpose=00'
        };
    });

    const setUser = (userData) => {
        setUserState(userData);
        localStorage.setItem('upi_user_profile', JSON.stringify(userData));
    };

    const validatePin = (inputPin) => {
        return inputPin === user.pin;
    };

    return { user, setUser, validatePin };
};
