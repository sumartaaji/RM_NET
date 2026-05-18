
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon, ArrowLeft, UploadCloud, Trash2, Image as ImageIconLucide } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { LOGO_STORAGE_KEY } from '@/lib/constants';
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

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export default function TampilanSettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // State untuk Logo
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadTheme = useCallback(() => {
    try {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        if (storedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.error("Error reading theme from localStorage", e);
    }
  }, []);
  
  const loadLogo = useCallback(() => {
    try {
      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedLogo) {
        setCurrentLogo(storedLogo);
        setPreviewUrl(storedLogo); // Set previewUrl based on currentLogo initially
      } else {
        setCurrentLogo(null);
        setPreviewUrl(null);
      }
    } catch (e) {
      console.error("Error loading logo from localStorage", e);
      toast({ title: "Gagal memuat logo", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    loadTheme();
    loadLogo();
    setMounted(true);
  }, [loadTheme, loadLogo]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error("Error saving theme to localStorage", e);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: "Ukuran file terlalu besar", description: `Maksimal ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        setSelectedFile(null);
        setPreviewUrl(currentLogo); 
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({ title: "Format file tidak didukung", description: "Pilih JPG, PNG, GIF, WEBP, atau SVG.", variant: "destructive" });
        setSelectedFile(null);
        setPreviewUrl(currentLogo);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(currentLogo);
    }
  };

  const handleSaveLogo = () => {
    if (selectedFile && previewUrl) {
      try {
        localStorage.setItem(LOGO_STORAGE_KEY, previewUrl);
        setCurrentLogo(previewUrl);
        toast({ title: "Logo berhasil disimpan" });
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: previewUrl }));
        setSelectedFile(null); 
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (e) {
        console.error("Error saving logo to localStorage", e);
        toast({ title: "Gagal menyimpan logo", description: "Penyimpanan lokal mungkin penuh.", variant: "destructive" });
      }
    } else {
      toast({ title: "Tidak ada logo dipilih", description: "Silakan pilih file logo terlebih dahulu.", variant: "warning" });
    }
  };

  const triggerDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLogo = () => {
    try {
      localStorage.removeItem(LOGO_STORAGE_KEY);
      setCurrentLogo(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "Logo berhasil dihapus" });
      window.dispatchEvent(new CustomEvent('logoUpdated', { detail: null }));
      setIsDeleteDialogOpen(false);
    } catch (e) {
      console.error("Error deleting logo from localStorage", e);
      toast({ title: "Gagal menghapus logo", variant: "destructive" });
    }
  };


  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold text-foreground font-headline">Preferensi Tampilan & Logo</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Tema Aplikasi</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-20 w-full" /></CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle>Logo Aplikasi</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
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
        <h1 className="text-3xl font-semibold text-foreground font-headline">Preferensi Tampilan & Logo</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tema Aplikasi</CardTitle>
          <CardDescription>Pilih tema terang atau gelap untuk tampilan aplikasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={(value) => handleThemeChange(value as 'light' | 'dark')}
            className="space-y-2"
          >
            <Label htmlFor="light-theme" className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent transition-colors">
              <RadioGroupItem value="light" id="light-theme" />
              <div className="flex items-center gap-2 text-base">
                <Sun className="h-5 w-5" /> Terang
              </div>
            </Label>
            <Label htmlFor="dark-theme" className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent transition-colors">
              <RadioGroupItem value="dark" id="dark-theme" />
              <div className="flex items-center gap-2 text-base">
                <Moon className="h-5 w-5" /> Gelap
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo Aplikasi Saat Ini</CardTitle>
          <CardDescription>Ini adalah logo yang akan ditampilkan di header aplikasi.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 min-h-[150px] bg-muted/30 rounded-md border border-dashed">
          {previewUrl ? (
            <NextImage src={previewUrl} alt="Preview Logo" width={120} height={40} style={{ objectFit: 'contain', maxHeight: '40px' }} />
          ) : (
            <div className="text-center text-muted-foreground">
              <ImageIconLucide className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Belum ada logo.</p>
              <p className="text-xs">Unggah logo di bawah ini.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xl">Unggah atau Ganti Logo Aplikasi</CardTitle>
          <CardDescription className="text-sm">Pilih file gambar (JPG, PNG, GIF, WEBP, SVG, maks {MAX_FILE_SIZE_MB}MB).</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="logo-upload" className="text-sm">Pilih File Logo</Label>
            <Input
              id="logo-upload"
              type="file"
              ref={fileInputRef}
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleFileChange}
              className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            {selectedFile && <p className="text-xs text-muted-foreground mt-1">File dipilih: <span className="font-medium">{selectedFile.name}</span> ({ (selectedFile.size / 1024).toFixed(2) } KB)</p>}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button onClick={handleSaveLogo} disabled={!selectedFile} className="w-full sm:w-auto text-sm" size="sm">
            <UploadCloud className="mr-2 h-4 w-4" /> Simpan Logo
          </Button>
          {currentLogo && (
             <Button variant="destructive" onClick={triggerDeleteDialog} className="w-full sm:w-auto text-sm" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Logo Saat Ini
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {currentLogo && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Logo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus logo saat ini? Tindakan ini tidak dapat diurungkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDeleteLogo}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

