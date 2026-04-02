/**
 * Token Manager
 * Handles pre-loading, storage, and consumption of offline payment tokens.
 */

const TOKEN_STORAGE_KEY = 'offline_payment_tokens';
const USED_TOKEN_STORAGE_KEY = 'used_payment_tokens';

export const TokenManager = {
  /**
   * Generates a batch of signed-tokens (simulated).
   * In a real app, these would come from the server while online.
   */
  async preloadTokens(amounts = [100, 200, 500, 200]) {
    const tokens = amounts.map(amount => ({
      id: `token_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      timestamp: Date.now(),
      expiry: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      signature: btoa(`signed_${amount}_${Date.now()}`), // Mock signature
      used: false
    }));

    const existingTokens = this.getTokens();
    const updatedTokens = [...existingTokens, ...tokens];
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(updatedTokens));
    return tokens;
  },

  /**
   * Initializes the wallet with ₹1000 if it's the first run.
   */
  init() {
    if (this.getTokens().length === 0) {
      this.preloadTokens([500, 200, 200, 100]);
    }
  },

  getTokens() {
    const data = localStorage.getItem(TOKEN_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getAvailableBalance() {
    return this.getTokens()
      .filter(t => !t.used && t.expiry > Date.now())
      .reduce((sum, t) => sum + t.amount, 0);
  },

  /**
   * Consumes tokens for a specific amount.
   * Returns the tokens used if successful.
   */
  consumeTokens(amount) {
    const allTokens = this.getTokens();
    const available = allTokens.filter(t => !t.used && t.expiry > Date.now());

    if (this.getAvailableBalance() < amount) {
      throw new Error('Insufficient offline balance');
    }

    // Simple greedy algorithm to pick tokens
    available.sort((a, b) => b.amount - a.amount);

    let remaining = amount;
    const selected = [];

    for (const token of available) {
      if (remaining <= 0) break;
      if (token.amount <= remaining) {
        selected.push(token);
        remaining -= token.amount;
        token.used = true;
      }
    }

    // If we still have remaining, we might need to use a larger token and "give change" 
    // (In a real system, tokens might be split or we just use a larger one).
    // For this prototype, if we can't match exactly, we take the smallest token > remaining.
    if (remaining > 0) {
      const nextSmallest = available.find(t => !t.used && t.amount > remaining);
      if (nextSmallest) {
        nextSmallest.used = true;
        selected.push(nextSmallest);
        remaining = 0;
      } else {
        throw new Error('Could not find suitable tokens for exact amount');
      }
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(allTokens));
    return selected;
  },

  clearTokens() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};
