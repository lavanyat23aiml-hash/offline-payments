import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Landmark, CheckCircle2 } from 'lucide-react';

const OnboardingScreen = () => {
    const navigate = useNavigate();

    const handleSelectBank = (bank) => {
        localStorage.setItem('upi_auth', 'true');
        localStorage.setItem('upi_selected_bank', bank);
        navigate('/');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="onboarding-screen"
            style={{ textAlign: 'center', padding: '40px 24px' }}
        >
            <div style={{ marginBottom: '60px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--primary)',
                    borderRadius: '24px',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '24px',
                    color: 'white',
                    boxShadow: '0 12px 24px rgba(103, 58, 183, 0.3)'
                }}>
                    <ShieldCheck size={48} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>UPI Offline</h1>
                <p style={{ color: 'var(--text-dim)' }}>Digital Payments without Internet</p>
            </div>

            <div className="card" style={{ textAlign: 'left', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Securely login with your bank</h3>

                <div
                    onClick={() => handleSelectBank('State Bank of India')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        border: '1px solid #eee',
                        borderRadius: '16px',
                        marginBottom: '12px',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '12px' }}>
                        <Landmark size={24} color="#1565c0" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600 }}>State Bank of India</p>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Login via Secure OTP</p>
                    </div>
                </div>

                <div
                    onClick={() => handleSelectBank('HDFC Bank')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        border: '1px solid #eee',
                        borderRadius: '16px',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ background: '#f5f5f7', padding: '10px', borderRadius: '12px' }}>
                        <Landmark size={24} color="#333" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600 }}>HDFC Bank</p>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Login via NetBanking</p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                NPCI Certified & Secure
            </div>
        </motion.div>
    );
};

export default OnboardingScreen;
