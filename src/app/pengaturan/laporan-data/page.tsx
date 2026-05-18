
'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Clock, Database, BarChart3, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function PengaturanLaporanDataPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        {[1, 2, 3, 4].map(i => (
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
        <h1 className="text-3xl font-semibold text-foreground font-headline">Laporan & Data</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Download className="mr-2 h-5 w-5 text-primary" /> Ekspor Laporan Periodik</CardTitle>
          <CardDescription>Unduh laporan penjualan harian, mingguan, bulanan, atau tahunan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button disabled variant="outline" className="justify-start"><FileSpreadsheet className="mr-2 h-4 w-4" /> Ekspor Harian (Excel)</Button>
            <Button disabled variant="outline" className="justify-start"><FileTextIcon className="mr-2 h-4 w-4" /> Ekspor Harian (PDF)</Button>
            <Button disabled variant="outline" className="justify-start"><FileSpreadsheet className="mr-2 h-4 w-4" /> Ekspor Mingguan (Excel)</Button>
            <Button disabled variant="outline" className="justify-start"><FileTextIcon className="mr-2 h-4 w-4" /> Ekspor Mingguan (PDF)</Button>
            <Button disabled variant="outline" className="justify-start"><FileSpreadsheet className="mr-2 h-4 w-4" /> Ekspor Bulanan (Excel)</Button>
            <Button disabled variant="outline" className="justify-start"><FileTextIcon className="mr-2 h-4 w-4" /> Ekspor Bulanan (PDF)</Button>
            <Button disabled variant="outline" className="justify-start"><FileSpreadsheet className="mr-2 h-4 w-4" /> Ekspor Tahunan (Excel)</Button>
            <Button disabled variant="outline" className="justify-start"><FileTextIcon className="mr-2 h-4 w-4" /> Ekspor Tahunan (PDF)</Button>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Fitur ekspor laporan sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" /> Jadwal Tutup Laporan Harian Otomatis</CardTitle>
          <CardDescription>Atur waktu untuk pembuatan otomatis laporan penjualan harian.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="report-schedule-time">Waktu Tutup Laporan Harian (Jam)</Label>
            <Input id="report-schedule-time" type="time" disabled className="max-w-xs mt-1" defaultValue="23:59" />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="auto-generate-report" disabled />
            <Label htmlFor="auto-generate-report">Aktifkan Pembuatan Laporan Otomatis</Label>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Fitur penjadwalan laporan otomatis sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Database className="mr-2 h-5 w-5 text-primary" /> Sinkronisasi & Backup Data Lokal</CardTitle>
          <CardDescription>Simpan cadangan data transaksi atau pengaturan aplikasi Anda secara lokal ke perangkat PC.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button disabled variant="outline"><Download className="mr-2 h-4 w-4" /> Backup Semua Data Transaksi (.json)</Button>
          <Button disabled variant="outline"><Download className="mr-2 h-4 w-4" /> Backup Pengaturan Aplikasi (.json)</Button>
          <p className="text-xs text-muted-foreground pt-2">
            Fitur ini akan mengunduh file cadangan ke komputer Anda. Sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" /> Statistik Penjualan</CardTitle>
          <CardDescription>Akses dashboard untuk melihat visualisasi data penjualan (harian, mingguan, bulanan, tahunan) dalam bentuk diagram.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
            <Link href="/pengaturan/statistik">
              <BarChart3 className="mr-2 h-5 w-5" /> Buka Dashboard Statistik
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground pt-2">
            Dashboard statistik dengan diagram lingkaran dan batang akan segera hadir untuk memberikan insight penjualan Anda.
          </p>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm pt-4">
        <p>Beberapa fitur di halaman ini masih dalam tahap pengembangan dan akan segera tersedia.</p>
      </div>
    </div>
  );
}
