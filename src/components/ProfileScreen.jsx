import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, QrCode, Copy, ShieldCheck, Landmark } from 'lucide-react';
import { useUser } from '../hooks/useUser';

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="profile-screen"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>My Profile</h2>
            </div>

            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(to bottom, #fff, #f8f0ff)' }}>
                <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '20px', borderRadius: '50%', marginBottom: '16px', color: 'white' }}>
                    <User size={48} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '20px' }}>
                    <span>{user.upiId}</span>
                    <Copy size={14} style={{ cursor: 'pointer' }} onClick={() => alert('UPI ID Copied!')} />
                </div>

                <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(103, 58, 183, 0.1)',
                    marginBottom: '20px'
                }}>
                    {/* Simulated QR Code */}
                    <div style={{ width: '180px', height: '180px', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ width: '100%', height: '100%', background: 'url("https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + user.qrData + '") center/cover no-repeat' }} />
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>SCAN TO PAY ME</p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Security</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontWeight: 600 }}>UPI PIN</p>
                        <p className="text-label" style={{ fontSize: '0.8rem' }}>Default: 1234</p>
                    </div>
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        onClick={() => {
                            const newPin = prompt('Enter new 4-digit PIN:');
                            if (newPin && newPin.length === 4 && !isNaN(newPin)) {
                                setUser({ ...user, pin: newPin });
                                alert('PIN Updated Successfully!');
                            } else if (newPin) {
                                alert('Invalid PIN. Must be 4 digits.');
                            }
                        }}
                    >
                        Change PIN
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Linked Bank Account</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#f5f5f7', padding: '10px', borderRadius: '12px' }}>
                        <Landmark size={24} color="var(--secondary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600 }}>{user.bankName}</p>
                        <p className="text-label" style={{ fontSize: '0.8rem' }}>{user.accountNo}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <ShieldCheck size={16} />
                        Primary
                    </div>
                </div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '24px', opacity: 0.7 }} onClick={() => {
                localStorage.removeItem('upi_auth');
                localStorage.removeItem('upi_user_profile');
                window.location.reload();
            }}>
                Reset App (Sign Out)
            </button>
        </motion.div>
    );
};

export default ProfileScreen;
