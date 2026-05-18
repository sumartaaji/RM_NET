
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Store, Palette, ArrowLeft, Package, Tags, History, ImageIcon } from 'lucide-react'; // Ditambahkan ImageIcon
import { Separator } from '@/components/ui/separator';

const settingsNavItems = [
  { name: 'Profil Pengguna', href: '/pengaturan/profil', icon: User },
  { name: 'Pengaturan Toko', href: '/pengaturan/toko', icon: Store },
  { name: 'Preferensi Tampilan', href: '/pengaturan/tampilan', icon: Palette },
  { name: 'Logo Aplikasi', href: '/pengaturan/logo', icon: ImageIcon }, // Item baru
  { name: 'Pengaturan Produk', href: '/pengaturan/produk', icon: Package },
  { name: 'Pengaturan Kategori', href: '/pengaturan/kategori', icon: Tags },
  { name: 'Riwayat Pembayaran', href: '/pengaturan/riwayat', icon: History },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card p-4 rounded-lg shadow-md space-y-2 flex-shrink-0">
      <Button
        variant="outline"
        asChild
        className="w-full justify-start text-left h-auto py-2 px-3 mb-4"
      >
        <Link href="/" className="flex items-center">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Kembali ke Kasir
        </Link>
      </Button>
      
      <h2 className="text-lg font-semibold mb-2 px-2 text-foreground font-headline">Menu Pengaturan</h2>
      <Separator className="mb-2" />
      <nav className="flex flex-col space-y-1">
        {settingsNavItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            asChild
            className={cn(
              'w-full justify-start text-left h-auto py-2 px-3',
              pathname === item.href
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'hover:bg-muted/50 text-foreground'
            )}
          >
            <Link href={item.href} className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
