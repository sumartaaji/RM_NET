
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIconPage } from 'lucide-react'; 
import { useAuth } from '@/hooks/useAuth'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react'; 
import { SETTINGS_NAV_ICONS } from '@/lib/constants';

const settingsNavItems = [
  { 
    name: 'Profil & Toko', 
    href: '/pengaturan/profil', 
    icon: SETTINGS_NAV_ICONS.User, 
    description: 'Kelola nama pengguna, email, keamanan akun, serta informasi dasar toko Anda.' 
  },
  { 
    name: 'Tampilan & Logo', 
    href: '/pengaturan/tampilan', 
    icon: SETTINGS_NAV_ICONS.Palette, 
    description: 'Sesuaikan tema terang/gelap aplikasi dan ubah logo aplikasi.' 
  },
  { 
    name: 'Produk & Kategori', 
    href: '/pengaturan/produk', 
    icon: SETTINGS_NAV_ICONS.Package, 
    description: 'Manajemen daftar produk, pengelompokan produk ke kategori, dan harga jual.' 
  },
  { 
    name: 'Transaksi, Struk & Printer', 
    href: '/pengaturan/printer-struk', 
    icon: SETTINGS_NAV_ICONS.Printer, 
    description: 'Atur metode pembayaran, format struk, koneksi printer, diskon, dan pajak.' 
  },
  { 
    name: 'Laporan & Data', 
    href: '/pengaturan/laporan-data', 
    icon: SETTINGS_NAV_ICONS.BarChart2, 
    description: 'Atur jadwal, ekspor laporan, lihat statistik penjualan, dan sinkronisasi data.' 
  },
  { 
    name: 'Riwayat Transaksi', 
    href: '/pengaturan/riwayat', 
    icon: SETTINGS_NAV_ICONS.History, 
    description: 'Lihat dan kelola semua transaksi yang telah tercatat di aplikasi.' 
  },
  { 
    name: 'Backup, Restore & Reset', 
    href: '/pengaturan/reset', 
    icon: SETTINGS_NAV_ICONS.RotateCcw, 
    description: 'Cadangkan data, pulihkan dari cadangan, atau reset aplikasi ke kondisi awal.' 
  },
];

export default function SettingsPage() {
  const auth = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) {
      router.push('/login');
    }
    setMounted(true); 
  }, [auth.isLoading, auth.isLoggedIn, router]);

  if (!mounted || auth.isLoading || (!auth.isLoading && !auth.isLoggedIn)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <SettingsIconPage className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/" aria-label="Kembali ke Kasir">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground font-headline">
            Pusat Pengaturan
          </h1>
        </div>
      </div>
      
      <p className="text-center text-lg text-muted-foreground -mt-4 mb-10">
        Pilih salah satu menu di bawah ini untuk mengkonfigurasi aplikasi Anda.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {settingsNavItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link 
              key={index}
              href={item.href}
              className="block hover:no-underline group"
            >
              <Card className={`h-full flex flex-col hover:shadow-xl ${item.name.includes('Reset') ? 'hover:border-destructive/50 group-hover:ring-destructive/30' : 'hover:border-primary/50 group-hover:ring-primary/30'} transition-all duration-200 ease-in-out cursor-pointer group-hover:ring-2 group-hover:-translate-y-1`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-5">
                  <CardTitle className={`text-xl font-semibold font-headline ${item.name.includes('Reset') ? 'group-hover:text-destructive' : 'group-hover:text-primary'} transition-colors`}>
                    {item.name}
                  </CardTitle>
                  <IconComponent className={`h-7 w-7 text-muted-foreground ${item.name.includes('Reset') ? 'group-hover:text-destructive' : 'group-hover:text-primary'} transition-colors`} />
                </CardHeader>
                <CardContent className="flex-grow px-5 pb-5">
                  <CardDescription className="text-sm leading-relaxed line-clamp-3">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

