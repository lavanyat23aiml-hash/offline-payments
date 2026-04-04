import { BankServer } from './bankServer';

/**
 * Token Manager — Pre-authorized offline payment tokens
 * Employs Simulated Bank Server for cryptographic Token Issuance.
 */
const TOKEN_KEY = 'offline_payment_tokens';

export const TokenManager = {
  init() {
    if (localStorage.getItem(TOKEN_KEY) === null) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify([]));
    }
  },

  async preloadTokens(userId, totalAmount) {
    if (!userId) userId = 'demo_user';
    
    // Call the Bank Server to securely issue cryptographically signed tokens
    // taking the requested amount and issuing strict denominations.
    const tokens = await BankServer.issueTokens(userId, totalAmount);

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

  getMaxDailyLimit() { return 1000; },

  getMaxBalance() { return 1000; },

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
   * Returns FULL token objects so the BankServer can cryptographically 
   * validate them during sync.
   */
  consumeTokens(amount) {
    const all = this.getTokens();
    const available = all.filter(t => !t.used && t.expiry > Date.now());
    if (this.getAvailableBalance() < amount) throw new Error('Insufficient offline tokens');

    // Sort smallest to largest to minimize splitting if possible
    available.sort((a, b) => a.amount - b.amount);
    
    let rem = amount;
    const selected = [];

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
          expiry: largeTok.expiry,
          signature: btoa(`signed_device_change_${changeAmount}_${Date.now()}`),
          used: false,
          isChange: true,
          parentId: largeTok.tokenId
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
    const t = all.find(x => (x.id || x.tokenId) === id);
    if (t) { t.used = true; localStorage.setItem(TOKEN_KEY, JSON.stringify(all)); }
  },

  clearTokens() { localStorage.removeItem(TOKEN_KEY); },
};
