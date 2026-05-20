
'use client'; 

import { Settings, Image as ImageIconLucide, LogOut, Sun, Moon, UserCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback } from 'react';
import type { StoreSettings } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { LOGO_STORAGE_KEY, THEME_KEY, DEFAULT_STORE_NAME } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const dailyQuotes: string[] = [
  "Kesuksesan dimulai dari langkah kecil setiap hari.",
  "Jangan takut gagal, takutlah jika tidak pernah mencoba.",
  "Hari ini adalah kesempatan baru untuk menjadi lebih baik.",
  "Setiap tantangan adalah peluang untuk bertumbuh.",
  "Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras.",
  "Fokus pada tujuanmu, bukan pada rintangan.",
  "Kebahagiaan adalah perjalanan, bukan tujuan akhir.",
  "Jadilah versi terbaik dari dirimu sendiri hari ini.",
  "Pikiran positif membawa hasil positif.",
  "Belajar dari kemarin, hidup untuk hari ini, berharap untuk besok."
];

export default function Header() {
  const [storeName, setStoreName] = useState(DEFAULT_STORE_NAME);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [quoteDate, setQuoteDate] = useState<string | null>(null);

  const auth = useAuth();
  const router = useRouter();

  const loadInitialTheme = useCallback(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
      if (storedTheme) {
        setCurrentTheme(storedTheme);
        // Initial class setting is handled by script in RootLayout
      } else {
        setCurrentTheme('light'); 
      }
    } catch (e) {
      console.error("Error reading theme from localStorage for Header", e);
      setCurrentTheme('light');
    }
  }, []);

  const loadStoreData = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('storeSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as Partial<StoreSettings>;
        setStoreName(parsedSettings.storeName || DEFAULT_STORE_NAME);
      } else {
        setStoreName(DEFAULT_STORE_NAME);
      }

      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedLogo) {
        setLogoSrc(storedLogo);
      } else {
        setLogoSrc(null);
      }
    } catch (e) {
      console.error("Error reading data from localStorage for Header", e);
      setStoreName(DEFAULT_STORE_NAME);
      setLogoSrc(null);
    }
  }, []);

  useEffect(() => {
    loadInitialTheme();
    loadStoreData();
    setMounted(true); 

    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<StoreSettings>>;
      if (customEvent.detail && customEvent.detail.storeName) {
        setStoreName(customEvent.detail.storeName);
      } else {
        const savedSettings = localStorage.getItem('storeSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings) as Partial<StoreSettings>;
          if(!parsedSettings.storeName) setStoreName(DEFAULT_STORE_NAME);
        } else {
          setStoreName(DEFAULT_STORE_NAME);
        }
      }
    };
    
    const handleLogoUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string | null>;
      setLogoSrc(customEvent.detail);
    };

    window.addEventListener('storeSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('logoUpdated', handleLogoUpdate);

    return () => {
      window.removeEventListener('storeSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, [loadStoreData, loadInitialTheme]);

  useEffect(() => {
    if (mounted) { 
      const updateDateTime = () => {
        const now = new Date();
        setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
        setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      };

      const updateQuote = () => {
        const today = new Date().toLocaleDateString();
        if (quoteDate !== today) {
          const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
          const newQuote = dailyQuotes[randomIndex];
          setCurrentQuote(newQuote);
          setQuoteDate(today);
          try {
            localStorage.setItem('dailyQuote', newQuote);
            localStorage.setItem('quoteDate', today);
          } catch (error) {
            console.error("Error saving quote to localStorage:", error);
          }
        }
      };
      
      try {
        const storedQuote = localStorage.getItem('dailyQuote');
        const storedQuoteDate = localStorage.getItem('quoteDate');
        const today = new Date().toLocaleDateString();
 
        if (storedQuote && storedQuoteDate === today) {
          setCurrentQuote(storedQuote);
          setQuoteDate(storedQuoteDate);
        } else {
          updateQuote();
        }
      } catch (error) {
        console.error("Error loading quote from localStorage:", error);
        updateQuote(); 
      }
      
      updateDateTime(); 
      const intervalId = setInterval(() => {
        updateDateTime();
        updateQuote(); 
      }, 1000); // Update every second for the clock
 
      return () => clearInterval(intervalId); 
    }
  }, [mounted, quoteDate]);


  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
       console.error("Error saving theme to localStorage or updating class", e);
    }
  };

  if (!mounted) { 
      return (
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 bg-muted rounded-md flex items-center justify-center">
                 <ImageIconLucide className="h-5 w-5 text-muted-foreground" />
              </Skeleton>
              <div className="flex flex-col">
                <Skeleton className="h-7 w-36" /> 
                <Skeleton className="h-3 w-28 mt-1" />
              </div>
            </Link>
             <div className="flex-grow flex flex-col items-center justify-center text-center px-2">
                <Skeleton className="h-3 w-3/4 max-w-xs mb-1" />
                <Skeleton className="h-3 w-1/2 max-w-[180px]" />
            </div>
            <nav className="flex items-center">
              <Skeleton className="h-9 w-9 rounded-full" />
            </nav>
          </div>
        </header>
      );
  }

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2 md:gap-4">
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
          {logoSrc ? (
            <NextImage 
              src={logoSrc} 
              alt="Logo Toko" 
              width={32}
              height={32}
              className="object-contain rounded-sm"
              style={{ maxHeight: '32px' }}
              priority
            />
          ) : (
            <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center">
              <ImageIconLucide className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground font-headline leading-tight">
              {storeName}
            </h1>
            <p className="hidden sm:block text-[10px] text-muted-foreground font-sans tracking-wide">
              Fotocopy, Print, and Service
            </p>
          </div>
        </Link>

        {auth.isLoggedIn && (
          <div className="flex flex-grow flex-col items-center justify-center text-center px-1 md:px-2 min-w-0">
            {currentQuote && (
              <div 
                className="hidden sm:flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs lg:text-sm text-foreground/80 italic cursor-help" 
                title={currentQuote}
              >
                <Lightbulb className="h-3 w-3 md:h-3.5 md:w-3.5 text-yellow-500 shrink-0" />
                <p className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-xs lg:max-w-md">{currentQuote}</p>
              </div>
            )}
            {(currentDate || currentTime) && (
              <div className="text-[9px] md:text-xs text-muted-foreground leading-tight flex items-center justify-center gap-1">
                {currentDate && <span className="hidden md:inline">{currentDate}</span>}
                {currentDate && currentTime && <span className="hidden md:inline mx-1 opacity-50">|</span>}
                {currentTime && <span className="font-medium text-primary/90">{currentTime}</span>}
              </div>
            )}
          </div>
        )}


        <nav className="flex items-center shrink-0">
          {auth.isLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={toggleTheme} className="cursor-pointer">
                  {currentTheme === 'light' ? (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Mode Gelap</span>
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Mode Terang</span>
                    </>
                  )}
                </DropdownMenuItem>
                {auth.isLoggedIn && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/pengaturan" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Pengaturan</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {auth.isLoggedIn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
