
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type LoginResult } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { KeyRound, LogIn, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_PIN } from '@/lib/constants'; 

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState('');
  const [remainingLockoutTime, setRemainingLockoutTime] = useState(0);

  useEffect(() => {
    if (!auth.isLoading && auth.isLoggedIn) {
      router.push('/');
    }
  }, [auth.isLoggedIn, auth.isLoading, router]);

  useEffect(() => {
    if (auth.isLockedOut && auth.lockoutUntil) {
        const updateTimer = () => {
            const now = Date.now();
            const timeLeft = Math.max(0, auth.lockoutUntil! - now);
            setRemainingLockoutTime(timeLeft);
            if (timeLeft > 0) {
                setLockoutMessage(`Akun terkunci. Coba lagi dalam ${formatTime(timeLeft)}.`);
            } else {
                setLockoutMessage('');
                setError(''); 
            }
        };
        updateTimer(); 
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    } else {
        setLockoutMessage('');
        setRemainingLockoutTime(0);
    }
  }, [auth.isLockedOut, auth.lockoutUntil]);

  const performLogin = useCallback(async (currentPin: string) => {
    setError('');
    setLockoutMessage('');
    setIsSubmitting(true);
    
    // Minimal delay for UI feedback, can be adjusted or removed
    await new Promise(resolve => setTimeout(resolve, 200));

    // This check is also good here though useEffect might cover it for auto-submit
    if (!/^\d{4,6}$/.test(currentPin)) {
      setError('PIN harus terdiri dari 4 hingga 6 digit angka.');
      setIsSubmitting(false);
      // No vibration
      return;
    }

    const loginResult: LoginResult = auth.loginWithPin(currentPin);

    if (loginResult.success) {
      toast({
        title: 'Login Berhasil',
        description: loginResult.message || 'Anda akan diarahkan ke halaman utama.',
      });
      // Navigation is handled by the auth.isLoggedIn effect
    } else {
      setError(loginResult.message || 'PIN salah atau akun terkunci.');
      // No vibration
      if (loginResult.isLockedOut && loginResult.lockoutEndsAt) {
        // Lockout message is handled by its own useEffect
      }
      // Clear PIN only if the attempt was made with a full valid-length PIN that failed
      // This prevents clearing the input if an intermediate (e.g. 3-digit) PIN was somehow processed
      if (currentPin.length >= 4 && currentPin.length <= 6) {
          setPin(''); 
      }
      toast({
        title: 'Login Gagal',
        description: loginResult.message || 'PIN salah atau akun terkunci.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  }, [auth, toast, setError, setLockoutMessage, setIsSubmitting, setPin]);

  // useEffect for auto-login
  useEffect(() => {
    const isPinLengthValid = pin.length >= 4 && pin.length <= 6;
    const canAttemptLogin = isPinLengthValid && !isSubmitting && !(auth.isLockedOut && remainingLockoutTime > 0);

    if (canAttemptLogin) {
      performLogin(pin);
    }
  }, [pin, isSubmitting, auth.isLockedOut, remainingLockoutTime, performLogin]);


  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Perform login only if not already submitting and not locked out,
    // and if PIN is of a potentially submittable length (>=4).
    // Auto-submit useEffect will handle the 4-6 digit check more specifically.
    if (pin.length >= 4 && !isSubmitting && !(auth.isLockedOut && remainingLockoutTime > 0)) {
        await performLogin(pin);
    }
  };

  const isEffectivelyLocked = auth.isLockedOut && remainingLockoutTime > 0;

  if (auth.isLoading || (!auth.isLoading && auth.isLoggedIn)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-xs">
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <KeyRound className="h-7 w-7 text-primary/70" />
            </Skeleton>
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full rounded-md" /> 
            <Skeleton className="h-10 w-full py-3" /> 
          </CardContent>
          <CardFooter className="text-center">
            <Skeleton className="h-4 w-1/3 mx-auto" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xs">
        <CardHeader className="space-y-2 text-center">
          {isEffectivelyLocked ? (
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          ) : (
            <KeyRound className="mx-auto h-12 w-12 text-primary" />
          )}
          <CardTitle className="text-2xl font-headline">
            {isEffectivelyLocked ? 'Akun Terkunci' : 'Masukkan PIN'}
          </CardTitle>
          <CardDescription>
            {isEffectivelyLocked 
              ? lockoutMessage 
              : 'Untuk masuk, masukkan PIN 4-6 digit Anda.'}
          </CardDescription>
        </CardHeader>
        {!isEffectivelyLocked && (
          <form onSubmit={handleManualSubmit}>
            <CardContent className="space-y-4">
              <Input
                id="pin"
                type="password" // Keep as password to hide digits
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // Allow only digits
                maxLength={6} // Max 6 digits
                placeholder="----"
                className="text-center text-2xl tracking-[0.3em] font-mono h-14"
                aria-label="PIN Input"
                autoFocus
                disabled={isEffectivelyLocked || isSubmitting}
                autoComplete="one-time-code" // Helps password managers and improves accessibility for OTP-like fields
              />
              {error && !lockoutMessage && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button 
                type="submit" 
                className="w-full text-base py-3" 
                size="lg" 
                // Disable button if PIN is too short, or locked, or already submitting
                disabled={isSubmitting || pin.length < 4 || isEffectivelyLocked}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memverifikasi...
                  </div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" /> Verifikasi PIN
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        )}
        {!isEffectivelyLocked && (
            <CardFooter className="flex justify-center text-xs text-muted-foreground">
                <p>PIN default: {DEFAULT_PIN} (jika belum diubah).</p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
