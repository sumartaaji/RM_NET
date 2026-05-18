
'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpCircle, Info, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function PembaruanAplikasiPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Simulasi pemuatan data terakhir diperiksa dari localStorage jika ada
    // const storedLastChecked = localStorage.getItem('appLastUpdateCheck');
    // if (storedLastChecked) setLastChecked(new Date(storedLastChecked).toLocaleString('id-ID'));
  }, []);

  const handleCheckUpdate = useCallback(() => {
    setIsCheckingUpdate(true);
    toast({
      title: "Memeriksa Pembaruan...",
      description: "Harap tunggu sebentar.",
    });
    setTimeout(() => {
      setIsCheckingUpdate(false);
      const currentDate = new Date();
      setLastChecked(currentDate.toLocaleString('id-ID'));
      // localStorage.setItem('appLastUpdateCheck', currentDate.toISOString());
      toast({
        title: "Tidak Ada Pembaruan",
        description: "Aplikasi Anda sudah menggunakan versi terbaru.",
      });
    }, 2500);
  }, [toast]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
              {i % 2 === 0 && <Skeleton className="h-8 w-3/4 mt-2" />}
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
        <h1 className="text-3xl font-semibold text-foreground font-headline">Pembaruan Aplikasi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary" /> Status Pembaruan</CardTitle>
          <CardDescription>Informasi mengenai versi aplikasi Anda saat ini dan pemeriksaan pembaruan terakhir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md bg-muted/30">
            <p className="text-sm"><span className="font-medium">Versi Terpasang:</span> 1.0.0 (Simulasi)</p>
            <p className="text-sm"><span className="font-medium">Pembaruan Terakhir Diperiksa:</span> {lastChecked || 'Belum pernah (Simulasi)'}</p>
          </div>
          <Button onClick={handleCheckUpdate} disabled={isCheckingUpdate}>
            <ArrowUpCircle className="mr-2 h-4 w-4" /> 
            {isCheckingUpdate ? 'Memeriksa...' : 'Periksa Pembaruan Sekarang'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" /> Pengaturan Pembaruan</CardTitle>
          <CardDescription>Kelola bagaimana aplikasi Anda menangani pembaruan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center space-x-2 p-3 border rounded-md">
            <Switch 
              id="auto-update" 
              disabled 
              aria-readonly
            />
            <Label htmlFor="auto-update" className="text-sm">Aktifkan Pembaruan Otomatis</Label>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Fitur pembaruan otomatis akan tersedia di versi mendatang. Saat ini, pemeriksaan pembaruan dilakukan secara manual.
          </p>
          <p className="text-xs text-muted-foreground">
            Catatan: Proses pembaruan mungkin memerlukan koneksi internet yang stabil.
          </p>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm pt-4">
        <p>Fungsionalitas pembaruan aplikasi yang sebenarnya akan diimplementasikan di versi mendatang.</p>
      </div>
    </div>
  );
}
