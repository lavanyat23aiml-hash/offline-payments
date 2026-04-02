import { useState, useEffect } from 'react';

/**
 * useUser Hook
 * Manages the user's profile, bank details, and security PIN.
 */
export const useUser = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('upi_user_profile');
        return saved ? JSON.parse(saved) : {
            name: 'Lavanya Krishnan',
            upiId: 'lavanya@okaxis',
            bankName: 'State Bank of India',
            accountNo: 'XXXXXX5842',
            pin: '1234',
            qrData: 'upi://pay?pa=lavanya@okaxis&pn=Lavanya%20Krishnan'
        };
    });

    useEffect(() => {
        localStorage.setItem('upi_user_profile', JSON.stringify(user));
    }, [user]);

    const validatePin = (inputPin) => {
        return inputPin === user.pin;
    };

    return { user, setUser, validatePin };
};
