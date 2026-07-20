// src/core/store/auth.store.js
const AUTH_KEY = 'assethop_auth';
const CIBIL_KEY = 'assethop_sim_cibil';

export const authStore = {
  listeners: new Set(),

  get() {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(authData) {
    if (authData) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
    this.notify();
  },

  clear() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CIBIL_KEY);
    this.notify();
  },

  getCibil() {
    const score = localStorage.getItem(CIBIL_KEY);
    return score ? parseInt(score, 10) : 750; // Default CIBIL is 750 (gives CIBIL waiver)
  },

  setCibil(score) {
    localStorage.setItem(CIBIL_KEY, score.toString());
    this.notify();
  },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  notify() {
    const data = this.get();
    const cibil = this.getCibil();
    for (const listener of this.listeners) {
      listener({ user: data?.user || null, cibil });
    }
  }
};
