import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    Search, 
    User, 
    Smartphone, 
    Zap, 
    ShieldCheck, 
    CheckCircle2,
    Star,
    Plus,
    X,
    UserPlus
} from 'lucide-react';

const CONTACTS_KEY = 'upi_app_contacts';

const DEFAULT_CONTACTS = [
    { id: 'c1', name: 'Alok Sharma', phone: '9876543210', upi: 'alok@oksbi', initial: 'A', favorite: true },
    { id: 'c2', name: 'Bhavna Reddy', phone: '8765432109', upi: 'bhavna@okaxis', initial: 'B', favorite: true },
    { id: 'c3', name: 'Chitra Murali', phone: '7654321098', upi: 'chitra@okhdfc', initial: 'C', favorite: false },
    { id: 'c4', name: 'Deepak Rao', phone: '6543210987', upi: 'deepak@okicici', initial: 'D', favorite: false },
    { id: 'c5', name: 'Esha Gupta', phone: '9123456789', upi: 'esha@oksbi', initial: 'E', favorite: true },
];

/**
 * ContactPayScreen
 * Select or add a contact for offline payment simulation.
 * Includes 10-digit number validation.
 */
const ContactPayScreen = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [contacts, setContacts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem(CONTACTS_KEY);
        if (saved) {
            setContacts(JSON.parse(saved));
        } else {
            setContacts(DEFAULT_CONTACTS);
            localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS));
        }
    }, []);

    const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone.includes(search)
    );

    const handleSelect = (contact) => {
        navigate(`/pay/${contact.id}`, { state: { 
            merchantName: contact.name,
            merchantUpi: contact.upi || `${contact.phone}@okupi`,
            merchantBank: 'Contact Account'
        }});
    };

    const handleAddContact = () => {
        setError('');
        // Validate 10 digits
        const phoneDigits = newContact.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (newContact.name.length < 2) {
            setError('Please enter a valid name.');
            return;
        }

        const created = {
            id: `c_${Date.now()}`,
            name: newContact.name,
            phone: phoneDigits,
            upi: `${phoneDigits}@okupi`,
            initial: newContact.name.charAt(0).toUpperCase(),
            favorite: false
        };

        const updated = [created, ...contacts];
        setContacts(updated);
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
        
        setShowAddForm(false);
        setNewContact({ name: '', phone: '' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ paddingBottom: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Transfer to Contact</h2>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>Pay anyone via phone or UPI ID</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Offline Token Banner */}
            <div style={{ 
                background: 'linear-gradient(135deg, #673ab7 0%, #512da8 100%)', 
                padding: '16px 20px', borderRadius: '20px', marginBottom: '24px', 
                display: 'flex', gap: '14px', alignItems: 'center', color: 'white',
                boxShadow: '0 8px 16px rgba(103, 58, 183, 0.2)'
            }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                    <Zap size={18} fill="white" />
                </div>
                <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '2px' }}>Offline Ready</h4>
                    <p style={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: 1.4 }}>
                        Contacts with UPI are eligible for instant offline tokens.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#aaa' }} />
                <input 
                    type="text" 
                    placeholder="Search name or 10-digit mobile..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%', height: '52px', borderRadius: '16px', border: '1.5px solid #eee', padding: '0 20px 0 48px', fontSize: '0.95rem', fontWeight: 600, outline: 'none', background: '#f9f9f9' }}
                />
            </div>

            {/* Favorites Section */}
            {search === '' && (
                <div style={{ marginBottom: '28px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={16} fill="#ffab00" color="#ffab00" /> FAVORITES
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {contacts.filter(c => c.favorite).map(c => (
                            <motion.div key={c.id} whileTap={{ scale: 0.95 }} onClick={() => handleSelect(c)} style={{ textAlign: 'center', minWidth: '70px', cursor: 'pointer' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '22px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, margin: '0 auto 8px', boxShadow: '0 6px 12px rgba(103,58,183,0.15)' }}>
                                    {c.initial}
                                </div>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#555' }}>{c.name.split(' ')[0]}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact List */}
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#444', marginBottom: '16px' }}>ALL CONTACTS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(contact => (
                    <motion.div 
                        key={contact.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(contact)}
                        className="card"
                        style={{ padding: '14px 18px', display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer' }}
                    >
                        <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {contact.initial}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#222' }}>{contact.name}</p>
                            <p style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600 }}>+91 {contact.phone}</p>
                        </div>
                        <Smartphone size={18} color="#ddd" />
                    </motion.div>
                ))}
            </div>

            {/* Add Contact Modal UI (Simulated) */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div 
                            initial={{ y: 50, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            style={{ background: 'white', width: '100%', maxWidth: '350px', borderRadius: '32px', padding: '32px', position: 'relative' }}
                        >
                            <button 
                                onClick={() => setShowAddForm(false)}
                                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#999' }}
                            >
                                <X size={24} />
                            </button>
                            
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ background: '#f5f0ff', padding: '16px', borderRadius: '50%', display: 'inline-flex', marginBottom: '16px', color: 'var(--primary)' }}>
                                    <UserPlus size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Contact</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#aaa', marginLeft: '12px', marginBottom: '4px', display: 'block' }}>FULL NAME</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                                        style={{ width: '100%', height: '52px', border: '1.5px solid #eee', borderRadius: '16px', padding: '0 20px', fontWeight: 600, outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#aaa', marginLeft: '12px', marginBottom: '4px', display: 'block' }}>MOBILE NUMBER (10 DIGITS)</label>
                                    <input 
                                        type="tel" 
                                        placeholder="9876543210" 
                                        maxLength={10}
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({...newContact, phone: e.target.value.replace(/\D/g, '')})}
                                        style={{ width: '100%', height: '52px', border: '1.5px solid #eee', borderRadius: '16px', padding: '0 20px', fontWeight: 600, outline: 'none' }}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>{error}</p>
                            )}

                            <button 
                                className="btn btn-primary" 
                                onClick={handleAddContact}
                                style={{ width: '100%', height: '54px', borderRadius: '18px', fontSize: '1rem', fontWeight: 800 }}
                            >
                                Save Contact
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ContactPayScreen;
