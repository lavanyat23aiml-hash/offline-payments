import { SyncManager } from './syncManager';

const DICT = {
    payment: ['pay', 'send', 'transfer', 'ಕೊಡು', 'ಕಳುಹಿಸು', 'भेजें', 'देना', 'కట్టండి', 'పంపండి', 'చెల్లించు', 'ಪಾವತಿಸು', 'भुगतान', 'given'],
    help: ['how', 'guide', 'help', 'ಹೇಗೆ', 'ಸಹಾಯ', 'कैसे', 'मदद', 'ఎలా', 'సహాయం'],
    today: ['today', 'spent', 'expenditure', 'ಇಂದು', 'ಇವತ್ತು', 'आज', 'నేడు', 'ఈ రోజు'],
    month: ['month', 'monthly', 'ತಿಂಗಳು', 'महीना', 'నెల'],
    history: ['history', 'recent', 'last', 'show', 'ತೋರಿಸು', 'ಇತಿಹಾಸ', 'इतिहास', 'दिखाओ', 'చరిత్ర', 'చూపించు']
};

export const NLPEngine = {
    /**
     * Masks sensitive PII (UPI IDs, Card numbers)
     */
    maskPII(text) {
        if (!text) return text;
        // Mask UPI ID: ramesh@okaxis -> ra****@okaxis
        let masked = text.replace(/[a-zA-Z0-9.\-_]+@[a-zA-Z]+/g, (match) => {
            const parts = match.split('@');
            const name = parts[0];
            const safeName = name.length > 2 ? name.substring(0, 2) + '*'.repeat(name.length-2) : '**';
            return `${safeName}@${parts[1]}`;
        });
        
        // Mask Phone Numbers: 9876543210 -> ******3210
        masked = masked.replace(/(?:\+91|91)?\W*[6-9]\d{9}/g, (match) => {
             const digits = match.replace(/\D/g, '');
             if (digits.length >= 10) return '*'.repeat(digits.length - 4) + digits.slice(-4);
             return match;
        });

        // Mask 16 digit cards
        masked = masked.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, 'XXXX-XXXX-XXXX-****');
        return masked;
    },

    /**
     * Parses intent and extracts distinct entities (Amount vs Phone vs UPI vs Name)
     */
    processText(text) {
        const lowerMatch = text.toLowerCase();
        let intent = 'unknown';

        // 1. Detect Help
        if (DICT.help.some(w => lowerMatch.includes(w)) && !DICT.payment.some(w => lowerMatch.includes(w))) {
            return { intent: 'help' };
        }

        // 2. Detect Analytics
        if (DICT.month.some(w => lowerMatch.includes(w)) && (DICT.history.some(w => lowerMatch.includes(w)) || lowerMatch.includes('spend') || lowerMatch.includes('spent'))) {
            return { intent: 'analytics_month' };
        }
        if (DICT.today.some(w => lowerMatch.includes(w)) && (DICT.history.some(w => lowerMatch.includes(w)) || lowerMatch.includes('spend') || lowerMatch.includes('spent') || lowerMatch.includes('much'))) {
            return { intent: 'analytics_today' };
        }

        // 3. Detect History
        if (DICT.history.some(w => lowerMatch.includes(w))) {
            return { intent: 'history' };
        }

        // 4. Detect Payment Intent & Entities
        const isPayment = DICT.payment.some(w => lowerMatch.includes(w));
        const containsNumber = /\d+/.test(lowerMatch);
        
        if (isPayment || containsNumber) {
            
            // A. Extract Target ID (Phone or UPI)
            let merchantUpi = null;
            let merchantName = 'Unknown Merchant';
            
            // Check for explicit UPI id
            const upiMatch = lowerMatch.match(/[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{3,}/i);
            if (upiMatch) {
                merchantUpi = upiMatch[0];
                merchantName = merchantUpi;
            } 
            else {
                // Check for Phone Number (10 digits starting with 6-9)
                const phoneMatch = lowerMatch.match(/(?:\+91|91)?\W*([6-9]\d{9})/i);
                if (phoneMatch) {
                    merchantUpi = phoneMatch[1]; // just the 10 digits
                    merchantName = `Mobile: ${merchantUpi}`;
                }
            }

            // B. Extract Amount (A number <= 999999 to isolate from stray phone numbers)
            const allNumbers = lowerMatch.match(/\b\d+\b/g) || [];
            let amount = null;
            
            // Prefer numbers accompanied by currency keywords first
            const explicitAmountMatch = lowerMatch.match(/(?:rs\.|rs|rupees|₹|inr|bucks)\s*(\d+)|(\d+)\s*(?:rs\.|rs|rupees|₹|inr|bucks)/i);
            if (explicitAmountMatch) {
                amount = parseInt(explicitAmountMatch[1] || explicitAmountMatch[2], 10);
            } else {
                // Otherwise find the first sensible amount number that isn't the phone number we just extracted
                for (const numStr of allNumbers) {
                    if (merchantUpi && merchantUpi.includes(numStr)) continue; // ignore if it belongs to phone/target
                    const val = parseInt(numStr, 10);
                    if (val > 0 && val <= 500000) {
                        amount = val;
                        break;
                    }
                }
            }

            // C. Extract Fallback Text Name ("Pay 200 to Ramesh")
            if (!merchantUpi) {
                const toIdx = lowerMatch.indexOf(' to ');
                if (toIdx !== -1) {
                    const extracted = text.substring(toIdx + 4).trim().split(' ')[0]; // grab next single word
                    // only use it if it's not a number
                    if (extracted && isNaN(parseInt(extracted))) {
                        merchantName = extracted;
                        merchantUpi = `${merchantName.toLowerCase()}@okaxis`;
                    }
                } else {
                    // Try rough fallback skipping amount and payment verbs
                    const cleaned = text.replace(new RegExp(amount, 'g'), '').trim();
                    const filtered = cleaned.split(' ').filter(w => !DICT.payment.includes(w.toLowerCase())).filter(w => w.length > 2);
                    if (filtered.length > 0) {
                        merchantName = filtered[filtered.length-1]; // guess the last significant word is name
                        merchantUpi = `${merchantName.toLowerCase()}@okaxis`;
                    }
                }
            }

            if (amount > 0 && merchantName !== 'Unknown Merchant') {
                return { 
                    intent: 'payment', 
                    amount, 
                    target: merchantName,
                    targetUpi: merchantUpi || `${merchantName.toLowerCase()}@okaxis`
                };
            }
        }

        return { intent: 'unknown' };
    },

    /**
     * Identifies anomalies or duplicate payments
     */
    analyzeRisk(amount, merchantName) {
        let alerts = [];
        const threshold = 5000;
        
        if (amount >= threshold) {
            alerts.push('high_value');
        }

        const history = SyncManager.getAllTransactions();
        const FiveMinsAgo = Date.now() - (5 * 60 * 1000);
        
        const duplicates = history.filter(tx => 
            tx.amount === amount && 
            tx.timestamp > FiveMinsAgo
        );

        if (duplicates.length > 0) {
            alerts.push('duplicate_risk');
        }

        return alerts;
    }
};
