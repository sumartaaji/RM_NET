
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// useRouter tidak secara eksplisit digunakan untuk navigasi pasca-reset di sini, window.location.href digunakan.
// import { useRouter } from 'next/navigation'; 
import { ArrowLeft, AlertTriangle, RotateCcw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import {
  PRODUCTS_STORAGE_KEY,
  CATEGORIES_STORAGE_KEY,
  TRANSACTIONS_STORAGE_KEY,
  LOGO_STORAGE_KEY,
  PAYMENT_SETTINGS_STORAGE_KEY,
  CART_STORAGE_KEY,
  STORE_SETTINGS_KEY,
  PROFILE_SETTINGS_KEY,
  THEME_KEY,
  AUTH_STORAGE_KEY
} from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';


const ALL_DATA_KEYS = [
  PRODUCTS_STORAGE_KEY,
  CATEGORIES_STORAGE_KEY,
  TRANSACTIONS_STORAGE_KEY,
  LOGO_STORAGE_KEY,
  PAYMENT_SETTINGS_STORAGE_KEY,
  CART_STORAGE_KEY,
  STORE_SETTINGS_KEY,
  PROFILE_SETTINGS_KEY,
  THEME_KEY,
  AUTH_STORAGE_KEY, // Kunci ini penting untuk proses logout
];

export default function ResetAplikasiPage() {
  const { toast } = useToast();
  // const router = useRouter(); // Tidak digunakan untuk navigasi pasca-reset
  const [mounted, setMounted] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(0);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackupData = () => {
    try {
      const backupData: { [key: string]: string | null } = {};
      ALL_DATA_KEYS.forEach(key => {
        backupData[key] = localStorage.getItem(key);
      });

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      link.href = url;
      link.download = `rm_net_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Berhasil",
        description: `Data aplikasi telah diunduh sebagai ${link.download}.`,
      });
    } catch (error) {
      console.error("Error during backup:", error);
      toast({
        title: "Backup Gagal",
        description: "Terjadi kesalahan saat membuat file backup.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/json') {
      toast({
        title: "File Tidak Valid",
        description: "Harap pilih file backup .json yang benar.",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const restoredData = JSON.parse(text) as { [key: string]: string | null };
        
        let restoredKeysCount = 0;
        ALL_DATA_KEYS.forEach(knownKey => {
          if (restoredData.hasOwnProperty(knownKey) && restoredData[knownKey] !== null) {
            localStorage.setItem(knownKey, restoredData[knownKey]!);
            restoredKeysCount++;
          } else if (restoredData.hasOwnProperty(knownKey) && restoredData[knownKey] === null) {
             localStorage.removeItem(knownKey);
          }
        });

        if (restoredKeysCount === 0 && !Object.keys(restoredData).some(k => ALL_DATA_KEYS.includes(k))) {
            toast({
                title: "File Backup Tidak Sesuai",
                description: "File tidak mengandung data yang dikenali untuk aplikasi ini.",
                variant: "destructive",
            });
            return;
        }

        const themeValue = localStorage.getItem(THEME_KEY);
        if (themeValue === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
        
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: localStorage.getItem(LOGO_STORAGE_KEY) }));
        window.dispatchEvent(new CustomEvent('storeSettingsUpdated'));
        
        toast({
          title: "Restore Berhasil",
          description: "Data aplikasi telah dipulihkan. Aplikasi akan dimuat ulang.",
        });

        setTimeout(() => {
          window.location.reload(); 
        }, 2000);

      } catch (error) {
        console.error("Error during restore:", error);
        toast({
          title: "Restore Gagal",
          description: "File backup tidak valid atau rusak.",
          variant: "destructive",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleStartResetProcess = () => {
    setConfirmationStep(1);
  };

  const handleFirstDialogAction = () => {
    setConfirmationStep(2);
  };

  const handleSecondDialogAction = () => {
    if (resetConfirmationInput === 'RESET') {
      performFullReset();
    } else {
      toast({
        title: "Konfirmasi Gagal",
        description: "Teks konfirmasi tidak sesuai. Reset dibatalkan.",
        variant: "destructive",
      });
      setConfirmationStep(0);
      setResetConfirmationInput('');
    }
  };

  const performFullReset = () => {
    try {
      ALL_DATA_KEYS.forEach(key => {
        localStorage.removeItem(key);
      });

      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem(THEME_KEY, 'light'); 
      
      toast({
        title: "Reset Aplikasi Berhasil",
        description: "Semua data telah dihapus. Anda akan diarahkan ke halaman login.",
        duration: 1500, // Durasi toast tetap, navigasi dilakukan setelahnya
      });

      setConfirmationStep(0); 
      setResetConfirmationInput(''); 
      
      // Navigasi langsung ke halaman login
      window.location.href = '/login'; 

    } catch (error) {
      console.error("Error during app reset:", error);
      toast({
        title: "Reset Gagal",
        description: "Terjadi kesalahan saat mereset aplikasi.",
        variant: "destructive",
      });
      setConfirmationStep(0);
      setResetConfirmationInput('');
    }
  };
  
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-1/2 rounded-md" />
        </div>
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-40 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/pengaturan" aria-label="Kembali ke Pengaturan">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground font-headline flex items-center">
          <RotateCcw className="mr-3 h-7 w-7 text-primary" /> Backup, Restore, & Reset Aplikasi
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Download className="mr-2 h-5 w-5 text-primary" /> Backup Data Aplikasi</CardTitle>
          <CardDescription>
            Simpan semua data aplikasi (produk, transaksi, pengaturan, dll.) ke file di komputer Anda.
            Sangat disarankan untuk melakukan backup secara berkala atau sebelum melakukan reset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackupData} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Backup Semua Data ke PC
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Upload className="mr-2 h-5 w-5 text-primary" /> Restore Data Aplikasi</CardTitle>
          <CardDescription>
            Pulihkan data aplikasi dari file backup (.json) yang sebelumnya Anda simpan.
            Pastikan file backup berasal dari aplikasi ini. Merestore akan menimpa data saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            type="file" 
            ref={fileInputRef} 
            accept=".json" 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          <Button onClick={triggerFileInput} variant="outline" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" /> Pilih File Backup (.json) & Restore
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2 h-5 w-5" />Reset Aplikasi ke Pengaturan Awal</CardTitle>
          <CardDescription className="text-destructive/90">
            Peringatan Keras! Fitur ini akan menghapus SEMUA data aplikasi yang tersimpan di perangkat ini dan Anda akan otomatis keluar.
            Tindakan ini <span className="font-bold">TIDAK DAPAT DIURUNGKAN</span>.
            Pastikan Anda sudah mem-backup data jika diperlukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Aplikasi akan kembali ke kondisi awal seperti saat pertama kali digunakan. Anda akan otomatis keluar.
          </p>
          <Button
            variant="destructive"
            size="lg"
            onClick={handleStartResetProcess}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Mulai Proses Reset Aplikasi
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={confirmationStep === 1} onOpenChange={(open) => !open && setConfirmationStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-destructive"/>Konfirmasi Reset Tahap 1</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda benar-benar yakin ingin mereset semua data aplikasi? 
              Semua produk, kategori, transaksi, dan pengaturan akan dihapus secara permanen. Anda juga akan otomatis keluar.
              Tindakan ini tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationStep(0)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstDialogAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Saya Mengerti & Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmationStep === 2} onOpenChange={(open) => !open && setConfirmationStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-destructive"/>Konfirmasi Reset Tahap Akhir</AlertDialogTitle>
            <AlertDialogDescription>
                Ini adalah peringatan terakhir. Tindakan ini akan menghapus semua data aplikasi dan Anda akan otomatis keluar (logout).
                Untuk mengonfirmasi, silakan ketik "<span className="font-bold text-destructive">RESET</span>" pada kolom di bawah ini dan klik "Hapus Semua Data & Logout".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reset-confirm-input" className="text-sm font-medium">
              Ketik "RESET" untuk konfirmasi:
            </Label>
            <Input
              id="reset-confirm-input"
              type="text"
              value={resetConfirmationInput}
              onChange={(e) => setResetConfirmationInput(e.target.value)}
              className="mt-1 border-destructive focus:ring-destructive"
              placeholder="RESET"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmationStep(0); setResetConfirmationInput(''); }}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSecondDialogAction}
              disabled={resetConfirmationInput !== 'RESET'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus Semua Data & Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
    

    