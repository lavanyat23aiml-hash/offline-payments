/**
 * Simulated Bank Server
 * Acts as the centralized authority that issues and validates offline tokens.
 * This runs locally but simulates a trusted backend environment.
 */

const SECRET_KEY = 'demo_bank_super_secret_key_2026';
const BANK_LEDGER_KEY = 'bank_used_tokens_ledger';

/**
 * Generate a SHA-256 signature for the token
 */
async function generateSignature(tokenId, amount, userId, expiry) {
    const data = `${tokenId}|${amount}|${userId}|${expiry}|${SECRET_KEY}`;
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const BankServer = {
    /**
     * Issues an array of signed tokens for a total amount, broken into denominations.
     */
    async issueTokens(userId, totalAmount) {
        if (totalAmount <= 0) throw new Error('Invalid amount');
        
        let remaining = totalAmount;
        const tokens = [];
        const denominations = [500, 200, 100, 50, 10]; 

        for (const denom of denominations) {
            while (remaining >= denom) {
                const tokenId = `bnk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const issuedAt = Date.now();
                const expiry = issuedAt + 7 * 24 * 60 * 60 * 1000; // 7 days

                const signature = await generateSignature(tokenId, denom, userId, expiry);

                tokens.push({
                    tokenId,
                    userId,
                    amount: denom,
                    issuedBy: 'Demo Bank Authority',
                    issuedAt,
                    expiry,
                    signature,
                    used: false
                });

                remaining -= denom;
            }
        }
        
        // Handle any odd remainder
        if (remaining > 0) {
             const tokenId = `bnk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
             const issuedAt = Date.now();
             const expiry = issuedAt + 7 * 24 * 60 * 60 * 1000;
             const signature = await generateSignature(tokenId, remaining, userId, expiry);
             
             tokens.push({
                 tokenId, 
                 userId, 
                 amount: remaining, 
                 issuedBy: 'Demo Bank Authority', 
                 issuedAt, 
                 expiry, 
                 signature, 
                 used: false
             });
        }
        
        return tokens;
    },

    getUsedLedger() {
        try {
            return JSON.parse(localStorage.getItem(BANK_LEDGER_KEY) || '[]');
        } catch {
            return [];
        }
    },

    markTokensUsed(tokenIds) {
        const ledger = this.getUsedLedger();
        const merged = Array.from(new Set([...ledger, ...tokenIds]));
        localStorage.setItem(BANK_LEDGER_KEY, JSON.stringify(merged));
    },

    /**
     * Validates a single token (Standard Token or Change Token)
     */
    async validateToken(token, userId) {
        // Edge Case: Offline generated change tokens
        if (token.isChange) {
            if (this.getUsedLedger().includes(token.tokenId)) return { valid: false, reason: "Change Token Double Spent" };
            // In a real system, the change token carries the signature of the parent token and the device.
            // We simulate basic trust here.
            return { valid: true };
        }

        // 1. Signature Verification
        const expectedSig = await generateSignature(token.tokenId, token.amount, token.userId, token.expiry);
        
        if (token.signature !== expectedSig) {
            return { valid: false, reason: "Cryptographic Mismatch / Tampering Detected" };
        }
        
        // 2. Data Integrity Verification
        if (token.userId !== userId) {
            return { valid: false, reason: "User ID Mismatch (Identity Fraud)" };
        }

        if (token.expiry < Date.now()) {
            return { valid: false, reason: "Token Expired" };
        }

        // 3. Double-Spend Verification
        if (this.getUsedLedger().includes(token.tokenId)) {
            return { valid: false, reason: "Double-Spend: Token already settled" };
        }

        return { valid: true };
    },

    /**
     * Settle an incoming offline sync transaction
     * Verifies all full tokens mathematically before accepting.
     */
    async syncTransaction(userId, tx) {
        // Network lag simulator
        await new Promise(r => setTimeout(r, 600));

        const tokenIdsUsed = [];

        if (!tx.fullTokens || !Array.isArray(tx.fullTokens) || tx.fullTokens.length === 0) {
            return { success: false, reason: "Malformed Payload: Empty or missing cryptography tokens" };
        }

        for (const token of tx.fullTokens) {
            const val = await this.validateToken(token, userId);
            if (!val.valid) {
                 return { success: false, reason: `Invalid Token (${token.tokenId.slice(-6)}): ${val.reason}` };
            }
            tokenIdsUsed.push(token.tokenId);
        }

        // Fraud Rule: Ensure the mathematical sum of signed tokens is sufficient
        const tokenSum = tx.fullTokens.reduce((s, t) => s + t.amount, 0);
        if (tokenSum < tx.amount) {
            return { success: false, reason: `Fraud Match: Tokens (₹${tokenSum}) cannot cover amount (₹${tx.amount})` };
        }

        // Commit: Mark all components of this transaction as irreversibly used in Database
        this.markTokensUsed(tokenIdsUsed);
        
        return { success: true };
    }
};
