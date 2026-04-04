import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    User, 
    QrCode, 
    Copy, 
    ShieldCheck, 
    Landmark, 
    Zap, 
    TrendingUp,
    ShieldAlert,
    Info,
    Smartphone,
    CreditCard,
    CheckCircle,
    Building2,
    Globe
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { TokenManager } from '../logic/tokenManager';
import { FraudDetector } from '../logic/fraudDetector';
import { useLanguage } from '../hooks/useLanguage';

/**
 * ProfileScreen
 * Displays user identity, bank details, and personal UPI QR.
 * Limits removed as per User Request.
 */
const ProfileScreen = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const { t, language, setLanguage } = useLanguage();
    const [copied, setCopied] = useState(false);

    const balance = TokenManager.getAvailableBalance();
    const activeTokens = TokenManager.getActiveTokens();

    const handleCopy = () => {
        if (user?.upiId) {
            navigator.clipboard.writeText(user.upiId).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleChangePin = () => {
        const newPin = prompt('Enter new 4-digit PIN:');
        if (newPin && /^\d{4}$/.test(newPin)) {
            setUser({ ...user, pin: newPin });
            alert('✅ PIN Updated successfully');
        } else if (newPin) {
            alert('Invalid PIN. Must be 4 digits.');
        }
    };

    if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ paddingBottom: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('profile_security')}</h2>
            </div>

            {/* Identity & QR Card */}
            <div className="card" style={{ 
                textAlign: 'center', 
                background: 'white', 
                marginBottom: '24px',
                border: '1px solid #eee',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
                <div style={{ 
                    display: 'inline-flex', 
                    background: 'var(--primary)', 
                    padding: '20px', 
                    borderRadius: '50%', 
                    marginBottom: '16px', 
                    color: 'white',
                    boxShadow: '0 8px 16px rgba(103,58,183,0.2)'
                }}>
                    <User size={40} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{user.name || 'User'}</h2>
                <p style={{ color: '#888', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px' }}>
                    Linked Mob: +91 {user.phone || '9XXXX XXXXX'}
                </p>
                
                {/* QR Code Section */}
                <div style={{ 
                    background: '#f8f9fa', 
                    padding: '24px', 
                    borderRadius: '24px', 
                    display: 'inline-block',
                    marginBottom: '20px',
                    border: '1px dashed #ddd'
                }}>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: '180px', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${user.upiId || 'test@upi'}&pn=${user.name || 'User'}`} 
                                alt="My UPI QR"
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                        onClick={handleCopy}
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: '#f3f0ff', 
                            padding: '8px 18px', 
                            borderRadius: '20px', 
                            border: 'none', 
                            color: 'var(--primary)', 
                            fontWeight: 800, 
                            fontSize: '0.85rem'
                        }}
                    >
                        {user.upiId}
                        {copied ? <CheckCircle size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            {/* Bank Details Section */}
            <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Landmark size={18} color="var(--primary)" /> {t('primary_bank')}
                </h3>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1.5px solid #eee' }}>
                    <div style={{ background: '#f5f5f7', padding: '14px', borderRadius: '16px' }}>
                        <Building2 size={24} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 800, fontSize: '1rem', color: '#222' }}>{user.bankName || 'HDFC Bank'}</p>
                        <p style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>{user.accountNo || 'XXXX XXXX 1234'} • Savings</p>
                    </div>
                    <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 800 }}>
                        ACTIVE
                    </div>
                </div>
            </div>

            {/* Offline Info Section */}
            <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#444', marginBottom: '16px' }}>{t('offline_protocol')}</h3>
                
                <div className="card" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={16} color="#ffab00" fill="#ffab00" />
                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{t('active_offline_tokens')}</span>
                        </div>
                        <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }}>₹{balance}</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '8px', fontWeight: 700 }}>
                        {activeTokens.length} INDIVIDUAL TOKENS LOADED
                    </p>
                </div>
            </div>

            {/* Security Config */}
            <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#444', marginBottom: '16px' }}>{t('security_settings')}</h3>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ background: '#f5f5f7', padding: '12px', borderRadius: '12px' }}>
                            <Smartphone size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{t('secure_upi_pin')}</p>
                            <p style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600 }}>{t('auth_required')}</p>
                        </div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.75rem', fontWeight: 800 }} onClick={handleChangePin}>
                        {t('change_btn')}
                    </button>
                </div>
            </div>

            {/* Language Selector */}
            <div style={{ marginTop: '28px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#444', marginBottom: '16px' }}>{t('app_language')}</h3>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ background: '#f5f5f7', padding: '12px', borderRadius: '12px' }}>
                            <Globe size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{
                                    border: 'none', background: 'transparent', 
                                    fontWeight: 800, fontSize: '0.95rem',
                                    outline: 'none', color: '#222', cursor: 'pointer',
                                    padding: 0, margin: 0, marginBottom: '2px'
                                }}
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी (Hindi)</option>
                                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                                <option value="te">తెలుగు (Telugu)</option>
                            </select>
                            <p style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600 }}>Translates all standard layouts instantly</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Notice */}
            <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.5 }}>
                <ShieldCheck size={20} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                    POWERED BY NPIL SECURE OFFLINE PROTOCOL V2.1
                </p>
                <p style={{ fontSize: '0.6rem', marginTop: '4px' }}>
                    All payments are cryptographically signed.
                </p>
            </div>
        </motion.div>
    );
};

export default ProfileScreen;
