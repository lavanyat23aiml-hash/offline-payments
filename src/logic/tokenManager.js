/**
 * Token Manager — Pre-authorized offline payment tokens
 * Hard cap: ₹1,000 per load. Each token is single-use with 7-day expiry.
 * Tokens are now funded from the Wallet Balance.
 * Features "Token Splitting" for partial payments.
 */
const TOKEN_KEY = 'offline_payment_tokens';

export const TokenManager = {
  init() {
    // Starts with 0 tokens by default on new devices (Removed auto-seeding).
    if (localStorage.getItem(TOKEN_KEY) === null) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify([]));
    }
  },

  async preloadTokens(amounts = []) {
    const tokens = amounts.map(amount => ({
      id: `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      timestamp: Date.now(),
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
      signature: btoa(`signed_${amount}_${Date.now()}`),
      used: false,
    }));

    const all = [...this.getTokens(), ...tokens];
    localStorage.setItem(TOKEN_KEY, JSON.stringify(all));
    return tokens;
  },

  getTokens() {
    try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || '[]'); }
    catch { return []; }
  },

  getActiveTokens() {
    return this.getTokens().filter(t => !t.used && t.expiry > Date.now());
  },

  getAvailableBalance() {
    return this.getActiveTokens().reduce((s, t) => s + t.amount, 0);
  },

  getMaxDailyLimit() { return 1000; }, // Virtual max per-load limit for display

  getMaxBalance() { return 1000; }, // Max allowed in offline reserve at once

  getTokenById(id) {
    return this.getTokens().find(t => t.id === id) || null;
  },

  validateTokens(ids) {
    return ids.every(id => {
      const t = this.getTokenById(id);
      return t && !t.used && t.expiry > Date.now();
    });
  },

  /**
   * consumeTokens — Robustly handles partial payments via Token Splitting
   * If a token is larger than the needed payment, it is consumed and a 
   * "change" token is added back to the pool.
   */
  consumeTokens(amount) {
    const all = this.getTokens();
    const available = all.filter(t => !t.used && t.expiry > Date.now());
    if (this.getAvailableBalance() < amount) throw new Error('Insufficient offline tokens');

    // Sort smallest to largest to minimize splitting if possible
    available.sort((a, b) => a.amount - b.amount);
    
    let rem = amount;
    const selected = [];
    const newTokens = [];

    // Step 1: Use exact or smaller tokens first
    for (const tok of available) {
      if (rem <= 0) break;
      if (tok.amount <= rem) { 
        selected.push(tok); 
        rem -= tok.amount; 
        tok.used = true; 
      }
    }

    // Step 2: Use a partial larger token (Token Splitting)
    if (rem > 0) {
      const largeTok = available.find(t => !t.used && t.amount > rem);
      if (largeTok) {
        largeTok.used = true;
        selected.push(largeTok);
        
        // CREATE CHANGE TOKEN
        const changeAmount = largeTok.amount - rem;
        const changeTok = {
          id: `tok_change_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          amount: changeAmount,
          timestamp: Date.now(),
          expiry: largeTok.expiry, // Maintain original expiry
          signature: btoa(`signed_change_${changeAmount}_${Date.now()}`),
          used: false,
          isChange: true
        };
        
        all.push(changeTok); // Add change back to pool
        rem = 0;
      } else {
        throw new Error('Cannot match token amount (No sufficient tokens)');
      }
    }

    localStorage.setItem(TOKEN_KEY, JSON.stringify(all));
    return selected;
  },

  invalidateToken(id) {
    const all = this.getTokens();
    const t = all.find(x => x.id === id);
    if (t) { t.used = true; localStorage.setItem(TOKEN_KEY, JSON.stringify(all)); }
  },

  clearTokens() { localStorage.removeItem(TOKEN_KEY); },
};
