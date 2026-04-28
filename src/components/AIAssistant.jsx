import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Mic, Send, AlertTriangle, CheckCircle, ShieldCheck, FileText, Search } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useConnectivity } from '../hooks/useConnectivity';
import { NLPEngine } from '../logic/nlpEngine';
import { SyncManager } from '../logic/syncManager';

const BotTranslations = {
    en: {
        greet: "Hi! I'm your Secure AI Assistant. What would you like to do today?",
        listening: "Listening...",
        did_not_understand: "I didn't quite catch that. Try saying 'Pay 100 to Ramesh' or 'Show my history'.",
        confirm_payment: "Please confirm your payment details before proceeding:",
        alert_duplicate: "⚠️ Unusual Activity: A similar payment was made very recently. Please double-check.",
        alert_high_value: "⚠️ High Value Alert: This transaction exceeds normal offline amounts.",
        payment_aborted: "Payment cancelled. No money was sent.",
        redirecting: "Redirecting to secure payment window...",
        today_spent: "You have spent ₹{amount} today.",
        month_spent: "You have spent ₹{amount} in the last 30 days.",
        no_history: "I couldn't find any recent transactions.",
        help_guide: "I can help you securely authorize tokens, make offline transfers, or analyze your spending. I cannot access your PIN. Try requesting a payment or asking for 'Today's expenses'."
    },
    hi: {
        greet: "नमस्ते! मैं आपका सुरक्षित AI सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
        listening: "सुन रहे हैं...",
        did_not_understand: "मैं समझ नहीं पाया। जैसे: 'रमेश को 100 रुपये दें' या 'मेरा इतिहास दिखाएं' कहने का प्रयास करें।",
        confirm_payment: "कृपया आगे बढ़ने से पहले अपने भुगतान विवरण की पुष्टि करें:",
        alert_duplicate: "⚠️ असामान्य गतिविधि: हाल ही में ऐसा ही भुगतान किया गया था। कृपया दोबारा जांचें।",
        alert_high_value: "⚠️ हाई वैल्यू अलर्ट: यह राशि सामान्य ऑफलाइन सीमा से अधिक है।",
        payment_aborted: "भुगतान रद्द कर दिया गया।",
        redirecting: "सुरक्षित भुगतान विंडो पर रीडायरेक्ट कर रहे हैं...",
        today_spent: "आज आपने ₹{amount} खर्च किए हैं।",
        month_spent: "पिछले 30 दिनों में आपने ₹{amount} खर्च किए हैं।",
        no_history: "मुझे कोई हालिया लेन-देन नहीं मिला।",
        help_guide: "मैं आपके खर्चों का विश्लेषण करने में मदद कर सकता हूँ। मैं आपका PIN एक्सेस नहीं कर सकता।"
    },
    kn: {
        greet: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸುರಕ್ಷಿತ AI ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
        listening: "ಆಲಿಸುತ್ತಿದೆ...",
        did_not_understand: "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು 'ರಮೇಶ್ ಗೆ 100 ರೂ ಕೊಡು' ಅಥವಾ 'ನನ್ನ ಇತಿಹಾಸ ತೋರಿಸು' ಎಂದು ಪ್ರಯತ್ನಿಸಿ.",
        confirm_payment: "ಮುಂದುವರಿಯುವ ಮುನ್ನ ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾವತಿ ವಿವರಗಳನ್ನು ಖಚಿತಪಡಿಸಿ:",
        alert_duplicate: "⚠️ ಅಸಾಮಾನ್ಯ ಚಟುವಟಿಕೆ: ಇತ್ತೀಚೆಗೆ ಇದೇ ರೀತಿಯ ಪಾವತಿ ಮಾಡಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
        alert_high_value: "⚠️ ಹೆಚ್ಚಿನ ಮೌಲ್ಯದ ಎಚ್ಚರಿಕೆ: ಈ ವಹಿವಾಟು ಸಾಮಾನ್ಯ ಆಫ್‌ಲೈನ್ ಮಿತಿ ಮೀರುತ್ತದೆ.",
        payment_aborted: "ಪಾವತಿ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
        redirecting: "ಸುರಕ್ಷಿತ ಪಾವತಿ ವಿಂಡೋಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...",
        today_spent: "ಇಂದು ನೀವು ₹{amount} ಖರ್ಚು ಮಾಡಿದ್ದೀರಿ.",
        month_spent: "ಕಳೆದ 30 ದಿನಗಳಲ್ಲಿ ನೀವು ₹{amount} ಖರ್ಚು ಮಾಡಿದ್ದೀರಿ.",
        no_history: "ಯಾವುದೇ ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        help_guide: "ನಿಮ್ಮ ಖರ್ಚುಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಾನು ನಿಮ್ಮ PIN ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ."
    },
    te: {
        greet: "నమస్కారం! నేను మీ సురక్షిత AI సహాయకుడిని. నేను మీకు ఎలా సహాయపడగలను?",
        listening: "వినబడుతోంది...",
        did_not_understand: "నాకు అర్థం కాలేదు. దయచేసి 'రమేష్ కు 100 పంపండి' లేదా 'నా చరిత్రను చూపించు' అని ప్రయత్నించండి.",
        confirm_payment: "కొనసాగించడానికి ముందు దయచేసి మీ చెల్లింపు వివరాలను నిర్ధారించండి:",
        alert_duplicate: "⚠️ అసాధారణ కార్యాచరణ: ఇటీవల ఇదే చెల్లింపు జరిగింది. దయచేసి మళ్లీ తనిఖీ చేయండి.",
        alert_high_value: "⚠️ అధిక విలువ హెచ్చరిక: ఈ లావాదేవీ సాధారణ ఆఫ్‌లైన్ పరిమితిని మించిపోయింది.",
        payment_aborted: "చెల్లింపు రద్దు చేయబడింది.",
        redirecting: "సురక్షిత చెల్లింపు విండోకు మళ్లించబడుతోంది...",
        today_spent: "ఈ రోజు మీరు ₹{amount} ఖర్చు చేశారు.",
        month_spent: "గత 30 రోజుల్లో మీరు ₹{amount} ఖర్చు చేశారు.",
        no_history: "ఇటీవల లావాదేవీలు ఏవీ కనుగొనబడలేదు.",
        help_guide: "చెల్లింపులు చేయడానికి లేదా మీ ఖర్చులను విశ్లేషించడానికి నేను సహాయపడగలను. నాకు మీ PIN యాక్సెస్ లేదు."
    }
};

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { isOnline } = useConnectivity();

    const [formState, setFormState] = useState(null); // 'mobile_pay', 'upi_pay', null

    const botT = (key, params = {}) => {
        let text = BotTranslations[language]?.[key] || BotTranslations['en'][key] || key;
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });
        return text;
    };

    // Initialize greeting on open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { id: 1, sender: 'bot', text: botT('greet') },
                { id: 2, sender: 'bot', type: 'quick_actions', text: '' }
            ]);
        }
    }, [isOpen, language]);

    // Auto scroll bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (textOverride) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        // Mask input for display
        const safeText = NLPEngine.maskPII(text);
        const newMsgs = [...messages, { id: Date.now(), sender: 'user', text: safeText }];
        setMessages(newMsgs);
        setInput('');

        // Process Intent
        processIntent(text, newMsgs);
    };

    const processIntent = (rawText, msgs) => {
        const response = NLPEngine.processText(rawText);
        
        let botMsg = { id: Date.now() + 1, sender: 'bot', type: 'text', text: '' };

        switch (response.intent) {
            case 'payment':
                const riskFlags = NLPEngine.analyzeRisk(response.amount, response.target);
                botMsg.type = 'payment_card';
                botMsg.payload = { amount: response.amount, merchantName: response.target, merchantUpi: response.targetUpi, flags: riskFlags };
                botMsg.text = botT('confirm_payment');
                break;
            case 'analytics_today':
                const today = new Date().toDateString();
                const todayRes = SyncManager.getAllTransactions().filter(tx => new Date(tx.timestamp).toDateString() === today);
                const todaySpent = todayRes.reduce((acc, tx) => acc + (tx.amount || 0), 0);
                botMsg.text = botT('today_spent', { amount: todaySpent });
                break;
            case 'analytics_month':
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const monthRes = SyncManager.getAllTransactions().filter(tx => tx.timestamp > thirtyDaysAgo);
                const monthSpent = monthRes.reduce((acc, tx) => acc + (tx.amount || 0), 0);
                botMsg.text = botT('month_spent', { amount: monthSpent });
                break;
            case 'history':
                const hist = SyncManager.getAllTransactions().slice(0, 3);
                if (hist.length === 0) {
                    botMsg.text = botT('no_history');
                } else {
                    botMsg.type = 'history_card';
                    botMsg.payload = hist;
                    botMsg.text = "Here are your recent transactions:";
                }
                break;
            case 'help':
                botMsg.text = botT('help_guide');
                break;
            default:
                // Check if user is answering a form implicitly
                if (formState === 'mobile_pay' || formState === 'upi_pay') {
                    // Force the rawText into the payment intent via NLPEngine
                    const amounts = rawText.match(/\b\d+\b/g);
                    if (amounts && rawText.length > 5) {
                         const amount = parseInt(amounts[0]);
                         const target = rawText.replace(amount.toString(), '').trim();
                         const safeTarget = NLPEngine.maskPII(target);
                         botMsg.type = 'payment_card';
                         botMsg.payload = { amount, merchantName: 'User Input', merchantUpi: safeTarget, flags: NLPEngine.analyzeRisk(amount, safeTarget) };
                         botMsg.text = botT('confirm_payment');
                         setFormState(null);
                         setTimeout(() => setMessages(prev => [...prev, botMsg]), 600);
                         return;
                    }
                }
                botMsg.text = botT('did_not_understand');
        }

        setTimeout(() => setMessages(prev => [...prev, botMsg]), 600);
    };

    const handleQuickAction = (action) => {
        const fakeMsgId = Date.now();
        if (action === 'mobile') {
            setMessages(prev => [...prev, { id: fakeMsgId, sender: 'user', text: 'Pay to Mobile Number' }]);
            setFormState('mobile_pay');
            setTimeout(() => {
                setMessages(prev => [...prev, { id: fakeMsgId+1, sender: 'bot', type: 'data_form', payload: 'mobile', text: 'Please enter the receiver\'s Mobile Number and Amount (e.g. 9876543210 500):' }]);
            }, 600);
        } else if (action === 'upi') {
            setMessages(prev => [...prev, { id: fakeMsgId, sender: 'user', text: 'Pay to UPI/Scanner' }]);
            setFormState('upi_pay');
            setTimeout(() => {
                setMessages(prev => [...prev, { id: fakeMsgId+1, sender: 'bot', type: 'data_form', payload: 'upi', text: 'Please enter the Merchant UPI ID and Amount (e.g. shop@okaxis 250):' }]);
            }, 600);
        } else if (action === 'insights') {
            setMessages(prev => [...prev, { id: fakeMsgId, sender: 'user', text: 'Show transaction details & insights' }]);
            processIntent('history');
        }
    };

    // Card Actions
    const executeCardAction = (payload, actionType) => {
        if (actionType === 'confirm') {
            setIsOpen(false);
            // Strict bridge to native UI element. User must manually proceed.
            // Passes online connectivity flag so PinScreen correctly routes to Wallet.
            navigate('/pin', {
                state: {
                    amount: payload.amount,
                    merchantId: 'm_ai_request',
                    merchantName: payload.merchantName,
                    merchantBank: 'AI Extracted',
                    merchantUpi: payload.merchantUpi,
                    type: isOnline ? 'online' : 'offline'
                }
            });
        } else {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: botT('payment_aborted') }]);
            setFormState(null);
        }
    };

    // Voice recognition (Web Speech API)
    const toggleVoice = () => {
        if (!isOnline) {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Voice recognition requires an active internet connection to process speech natively. Please type your command instead.' }]);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        // Dynamically assign lang based on hook
        const langMap = { 'en': 'en-IN', 'hi': 'hi-IN', 'kn': 'kn-IN', 'te': 'te-IN' };
        recognition.lang = langMap[language] || 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSend(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        
        recognition.start();
    };

    return (
        <>
            {/* Overlay Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed', bottom: '90px', right: '20px', width: '340px', height: '500px',
                            background: 'white', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                            display: 'flex', flexDirection: 'column', zIndex: 9999, border: '1px solid #efefef', overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={20} color="#00d2ff" />
                                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Secure AI Assistant</span>
                            </div>
                            <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', opacity: 0.8 }} />
                        </div>

                        {/* Chat Body */}
                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.65rem', background: '#eee', padding: '4px 10px', borderRadius: '12px', color: '#888', fontWeight: 700 }}>
                                    Chat Context Secured
                                </span>
                            </div>
                            
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                    {msg.text && (
                                        <div style={{ 
                                            maxWidth: '85%', padding: '12px 16px', borderRadius: '18px', fontSize: '0.85rem', lineHeight: 1.4,
                                            background: msg.sender === 'user' ? '#1A1A2E' : 'white',
                                            color: msg.sender === 'user' ? 'white' : '#333',
                                            border: msg.sender === 'bot' ? '1px solid #eee' : 'none',
                                            boxShadow: msg.sender === 'bot' ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
                                            borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                                            borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px'
                                        }}>
                                            {msg.text}
                                        </div>
                                    )}
                                    
                                    {/* Quick Actions Card */}
                                    {msg.type === 'quick_actions' && (
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            <button onClick={() => handleQuickAction('mobile')} className="btn" style={{ background: 'white', color: '#333', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #ddd', textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                                                <div style={{ background: '#e3f2fd', padding: '6px', borderRadius: '8px' }}><MessageSquare size={16} color="#1565c0" /></div>
                                                Send Payment to Mobile No.
                                            </button>
                                            <button onClick={() => handleQuickAction('upi')} className="btn" style={{ background: 'white', color: '#333', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #ddd', textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                                                <div style={{ background: '#f3e5f5', padding: '6px', borderRadius: '8px' }}><ShieldCheck size={16} color="#7b1fa2" /></div>
                                                Pay to UPI ID / Scanner
                                            </button>
                                            <button onClick={() => handleQuickAction('insights')} className="btn" style={{ background: 'white', color: '#333', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #ddd', textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                                                <div style={{ background: '#e8f5e9', padding: '6px', borderRadius: '8px' }}><FileText size={16} color="#2e7d32" /></div>
                                                View Transaction History
                                            </button>
                                        </div>
                                    )}

                                    {/* Input Form Card */}
                                    {msg.type === 'data_form' && (
                                        <div style={{ width: '100%', background: 'white', border: '1px solid #ddd', borderRadius: '16px', padding: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>
                                                {msg.payload === 'mobile' ? 'Enter Phone & Amount' : 'Enter UPI & Amount'}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input id={`input_${msg.id}`} type="text" placeholder={msg.payload === 'mobile' ? "e.g. 9876543210 500" : "e.g. shop@okaxis 200"} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', fontSize: '0.8rem' }} />
                                                <button onClick={() => {
                                                    const val = document.getElementById(`input_${msg.id}`).value;
                                                    handleSend(val);
                                                }} className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: '8px' }}><Send size={14} /></button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Rich Interactive Cards */}
                                    {msg.type === 'payment_card' && (
                                        <div style={{ width: '100%', background: 'white', border: '1px solid #e1d5ff', borderRadius: '16px', padding: '16px', marginTop: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <FileText size={18} color="var(--primary)" />
                                                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Payment Confirmation</h4>
                                            </div>
                                            
                                            {msg.payload.flags.includes('duplicate_risk') && (
                                                <div style={{ background: '#fff3e0', color: '#e65100', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '12px', display: 'flex', gap: '6px' }}>
                                                    <AlertTriangle size={14} /> {botT('alert_duplicate')}
                                                </div>
                                            )}
                                            
                                            {msg.payload.flags.includes('high_value') && (
                                                <div style={{ background: '#ffebee', color: '#c62828', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '12px', display: 'flex', gap: '6px' }}>
                                                    <AlertTriangle size={14} /> {botT('alert_high_value')}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#888' }}>Pay To:</span>
                                                <span style={{ fontWeight: 800 }}>{msg.payload.merchantName}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#888' }}>Account:</span>
                                                <span style={{ fontWeight: 600, color: '#555' }}>{msg.payload.merchantUpi}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#888' }}>Amount:</span>
                                                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{msg.payload.amount}</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => executeCardAction(msg.payload, 'cancel')} className="btn" style={{ flex: 1, padding: '8px', background: '#ffebee', color: '#c62828', fontSize: '0.75rem', fontWeight: 800, borderRadius: '10px' }}>Cancel</button>
                                                <button onClick={() => executeCardAction(msg.payload, 'confirm')} className="btn" style={{ flex: 1, padding: '8px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 800, borderRadius: '10px' }}>Confirm</button>
                                            </div>
                                        </div>
                                    )}

                                    {msg.type === 'history_card' && (
                                        <div style={{ width: '100%', background: 'white', border: '1px solid #eee', borderRadius: '16px', padding: '12px', marginTop: '8px' }}>
                                            {msg.payload.map((tx, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx !== msg.payload.length-1 ? '1px solid #f0f0f0' : 'none' }}>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>{tx.merchantName}</p>
                                                        <p style={{ margin: 0, fontSize: '0.65rem', color: '#999' }}>{new Date(tx.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>₹{tx.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '12px', borderTop: '1px solid #eee', background: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={toggleVoice} className="btn" style={{ background: isListening ? '#ffebee' : '#f5f5f7', color: isListening ? '#c62828' : '#666', padding: '12px', borderRadius: '50%', boxShadow: isListening ? '0 0 0 4px #ffcdd2' : 'none' }}>
                                <Mic size={20} />
                            </button>
                            <input 
                                type="text" 
                                value={input} 
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder={isListening ? botT('listening') : "Type a command..."}
                                disabled={isListening}
                                style={{ flex: 1, border: 'none', background: '#f5f5f7', padding: '14px 16px', borderRadius: '24px', fontSize: '0.85rem', outline: 'none', fontWeight: 600 }}
                            />
                            <button onClick={() => handleSend()} className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '50%' }}>
                                <Send size={18} style={{ transform: 'translateX(1px)' }} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed', bottom: '24px', right: '24px', width: '60px', height: '60px',
                        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', color: '#00d2ff',
                        borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(26,26,46,0.3)', border: 'none', cursor: 'pointer', zIndex: 9999
                    }}
                >
                    <MessageSquare size={26} fill="currentColor" />
                    {/* Ripple Effect */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #00d2ff', animation: 'pulse 2s infinite' }} />
                </motion.button>
            )}
        </>
    );
};

export default AIAssistant;
