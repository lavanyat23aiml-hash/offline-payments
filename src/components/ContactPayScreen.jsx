import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, User, Phone, AtSign, ChevronRight } from 'lucide-react';

const MOCK_CONTACTS = [
    { id: 'c1', name: 'Alok Sharma', upi: 'alok@okicici', phone: '+91 98765 43210', initial: 'A', color: '#673ab7' },
    { id: 'c2', name: 'Sneha Gupta', upi: 'sneha@oksbi', phone: '+91 87654 32109', initial: 'S', color: '#1a73e8' },
    { id: 'c3', name: 'Rohan Verma', upi: 'rohan@okhdfc', phone: '+91 76543 21098', initial: 'R', color: '#00c853' },
    { id: 'c4', name: 'Priya Das', upi: 'priya@okaxis', phone: '+91 65432 10987', initial: 'P', color: '#ff5252' },
];

const ContactPayScreen = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filtered = MOCK_CONTACTS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.upi.includes(search)
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="contact-pay-screen"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Transfer Money</h2>
            </div>

            <div className="card" style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Search size={20} color="var(--text-dim)" />
                <input
                    type="text"
                    placeholder="Enter name, number or UPI ID"
                    style={{ width: '100%', border: 'none', padding: '12px 0', fontSize: '1rem', outline: 'none' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}>
                    <Phone size={16} />
                    Number
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}>
                    <AtSign size={16} />
                    UPI ID
                </button>
            </div>

            <h3 style={{ fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '16px' }}>Recent Contacts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(c => (
                    <div
                        key={c.id}
                        className="contact-item"
                        style={{
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            transition: 'background 0.2s'
                        }}
                        onClick={() => navigate(`/pay/${c.id}?name=${c.name}&upi=${c.upi}`)}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: c.color,
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 700,
                            fontSize: '1.2rem'
                        }}>
                            {c.initial}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600 }}>{c.name}</p>
                            <p className="text-label" style={{ fontSize: '0.8rem' }}>{c.phone}</p>
                        </div>
                        <ChevronRight size={20} color="#ddd" />
                    </div>
                ))}
            </div>

            <style>{`
        .contact-item:active { background: #f5f5f7; }
      `}</style>
        </motion.div>
    );
};

export default ContactPayScreen;
