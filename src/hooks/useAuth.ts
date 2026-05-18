
'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  AUTH_STORAGE_KEY, 
  PIN_STORAGE_KEY, 
  DEFAULT_PIN, 
  FAILED_LOGIN_ATTEMPTS_KEY, 
  LOCKOUT_UNTIL_KEY 
} from '@/lib/constants';

export interface LoginResult {
  success: boolean;
  isLockedOut?: boolean;
  lockoutEndsAt?: number; // timestamp for when lockout ends
  message?: string;
}

export interface AuthHook {
  isLoggedIn: boolean;
  isLoading: boolean;
  loginWithPin: (enteredPin: string) => LoginResult;
  logout: () => void;
  changePin: (currentPin: string, newPin: string) => { success: boolean; message: string };
  isPinDefault: () => boolean;
  isLockedOut: boolean;
  lockoutUntil: number | null; // timestamp
  failedAttempts: number;
}

export function useAuth(): AuthHook {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appPin, setAppPin] = useState<string>(DEFAULT_PIN);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const isCurrentlyLockedOut = useCallback((): boolean => {
    const currentLockoutTimestamp = lockoutUntil;
    return !!currentLockoutTimestamp && Date.now() < currentLockoutTimestamp;
  }, [lockoutUntil]);

  useEffect(() => {
    // Load auth state
    try {
      const storedAuthState = localStorage.getItem(AUTH_STORAGE_KEY);
      setIsLoggedIn(storedAuthState === 'true');
    } catch (e) {
      console.error("Failed to load auth state from localStorage", e);
      setIsLoggedIn(false);
    }

    // Load PIN
    try {
      const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
      if (storedPin && /^\d{4,6}$/.test(storedPin)) {
        setAppPin(storedPin);
      } else {
        localStorage.setItem(PIN_STORAGE_KEY, DEFAULT_PIN);
        setAppPin(DEFAULT_PIN);
      }
    } catch (e) {
      console.error("Failed to load PIN from localStorage", e);
      try { localStorage.setItem(PIN_STORAGE_KEY, DEFAULT_PIN); } catch (lsError) { /* ignore */ }
      setAppPin(DEFAULT_PIN);
    }

    // Load lockout state
    try {
      const storedAttempts = localStorage.getItem(FAILED_LOGIN_ATTEMPTS_KEY);
      setFailedAttempts(storedAttempts ? parseInt(storedAttempts, 10) : 0);
      const storedLockout = localStorage.getItem(LOCKOUT_UNTIL_KEY);
      const lockoutTimestamp = storedLockout ? parseInt(storedLockout, 10) : null;
      if (lockoutTimestamp && Date.now() < lockoutTimestamp) {
        setLockoutUntil(lockoutTimestamp);
      } else {
        // Clear expired lockout from storage
        localStorage.removeItem(LOCKOUT_UNTIL_KEY);
        localStorage.removeItem(FAILED_LOGIN_ATTEMPTS_KEY); // Also reset attempts if lockout expired
        setFailedAttempts(0);
      }
    } catch (e) {
      console.error("Failed to load lockout state from localStorage", e);
    }
    setIsLoading(false);
  }, []);

  const loginWithPin = useCallback((enteredPin: string): LoginResult => {
    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      return { success: false, isLockedOut: true, lockoutEndsAt: lockoutUntil, message: 'Akun terkunci. Coba lagi nanti.' };
    }

    if (enteredPin === appPin) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        setIsLoggedIn(true);
        localStorage.removeItem(FAILED_LOGIN_ATTEMPTS_KEY);
        localStorage.removeItem(LOCKOUT_UNTIL_KEY);
        setFailedAttempts(0);
        setLockoutUntil(null);
        return { success: true, message: 'Login berhasil!' };
      } catch (e) {
        console.error("Failed to save auth state to localStorage", e);
        return { success: false, message: 'Login gagal karena kesalahan sistem.' };
      }
    } else {
      // PIN salah
      const currentAttempts = failedAttempts + 1;
      setFailedAttempts(currentAttempts);
      localStorage.setItem(FAILED_LOGIN_ATTEMPTS_KEY, currentAttempts.toString());

      let lockoutDuration = 0; // milliseconds
      let message = 'PIN yang Anda masukkan salah.';

      if (currentAttempts >= 12) { 
        lockoutDuration = 60 * 60 * 1000; // 60 minutes
      } else if (currentAttempts >= 9) { 
        lockoutDuration = 15 * 60 * 1000; // 15 minutes
      } else if (currentAttempts >= 6) { 
        lockoutDuration = 5 * 60 * 1000;  // 5 minutes
      } else if (currentAttempts >= 3) { 
        lockoutDuration = 1 * 60 * 1000;   // 1 minute
      }

      if (lockoutDuration > 0) {
        const newLockoutTimestamp = now + lockoutDuration;
        localStorage.setItem(LOCKOUT_UNTIL_KEY, newLockoutTimestamp.toString());
        setLockoutUntil(newLockoutTimestamp);
        message = `PIN salah. Akun terkunci. (Percobaan: ${currentAttempts})`;
        return { success: false, isLockedOut: true, lockoutEndsAt: newLockoutTimestamp, message };
      } else {
        const attemptsRemaining = 3 - currentAttempts;
        message = `PIN salah. ${attemptsRemaining > 0 ? `Sisa percobaan sebelum kunci: ${attemptsRemaining}.` : 'Percobaan berikutnya akan mengunci akun.'} (Percobaan: ${currentAttempts})`;
      }
      return { success: false, message };
    }
  }, [appPin, failedAttempts, lockoutUntil]);

  const logout = useCallback(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'false');
      setIsLoggedIn(false);
    } catch (e) {
      console.error("Failed to save auth state to localStorage", e);
    }
  }, []);

  const changePin = useCallback((currentPin: string, newPin: string): { success: boolean; message: string } => {
    if (currentPin !== appPin) {
      return { success: false, message: 'PIN saat ini salah.' };
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      return { success: false, message: 'PIN baru harus terdiri dari 4 hingga 6 digit angka.' };
    }
    if (newPin === currentPin) {
      return { success: false, message: 'PIN baru tidak boleh sama dengan PIN saat ini.' };
    }
    try {
      localStorage.setItem(PIN_STORAGE_KEY, newPin);
      setAppPin(newPin);
      return { success: true, message: 'PIN berhasil diubah.' };
    } catch (e) {
      console.error("Failed to save new PIN to localStorage", e);
      return { success: false, message: 'Gagal menyimpan PIN baru karena kesalahan sistem.' };
    }
  }, [appPin]);

  const isPinDefault = useCallback((): boolean => {
    try {
      const currentStoredPin = localStorage.getItem(PIN_STORAGE_KEY);
      return currentStoredPin === DEFAULT_PIN || currentStoredPin === null;
    } catch (e) {
      return appPin === DEFAULT_PIN; 
    }
  }, [appPin]);

  return { 
    isLoggedIn, 
    isLoading, 
    loginWithPin, 
    logout, 
    changePin, 
    isPinDefault,
    isLockedOut: isCurrentlyLockedOut(),
    lockoutUntil,
    failedAttempts
  };
}
