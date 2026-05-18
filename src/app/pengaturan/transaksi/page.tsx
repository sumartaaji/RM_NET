
'use client';

import Link from 'next/link';
import { ArrowLeft, ReceiptText, CreditCard, Tag, Percent, Edit3, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { PaymentSetting } from '@/types';
import { PAYMENT_SETTINGS_STORAGE_KEY, DEFAULT_PAYMENT_SETTINGS, getPaymentMethodIcon } from '@/lib/constants';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

export default function PengaturanTransaksiPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([]);
  const [editingSetting, setEditingSetting] = useState<PaymentSetting | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [tempAccountNumber, setTempAccountNumber] = useState('');
  const [tempAccountName, setTempAccountName] = useState('');

  const loadPaymentSettings = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setPaymentSettings(JSON.parse(storedSettings));
      } else {
        setPaymentSettings(DEFAULT_PAYMENT_SETTINGS);
        localStorage.setItem(PAYMENT_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
      }
    } catch (e) {
      console.error("Error loading payment settings:", e);
      setPaymentSettings(DEFAULT_PAYMENT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    loadPaymentSettings();
    setMounted(true);
  }, [loadPaymentSettings]);

  const savePaymentSettings = (settings: PaymentSetting[]) => {
    try {
      localStorage.setItem(PAYMENT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setPaymentSettings(settings);
      window.dispatchEvent(new CustomEvent('paymentSettingsUpdated'));
      toast({ title: "Pengaturan Metode Pembayaran Disimpan" });
    } catch (e) {
      console.error("Error saving payment settings:", e);
      toast({ title: "Gagal Menyimpan Pengaturan", variant: "destructive" });
    }
  };

  const handleEnableToggle = (id: string, enabled: boolean) => {
    const updatedSettings = paymentSettings.map(setting =>
      setting.id === id ? { ...setting, enabled } : setting
    );
    savePaymentSettings(updatedSettings);
  };

  const handleEditSetting = (setting: PaymentSetting) => {
    setEditingSetting(setting);
    setTempAccountNumber(setting.accountNumber || '');
    setTempAccountName(setting.accountName || '');
    setIsFormDirty(false);
  };

  const handleSaveEdit = () => {
    if (editingSetting) {
      const updatedSettings = paymentSettings.map(setting =>
        setting.id === editingSetting.id
          ? { ...setting, accountNumber: tempAccountNumber, accountName: tempAccountName }
          : setting
      );
      savePaymentSettings(updatedSettings);
      setEditingSetting(null);
    }
  };
  
  useEffect(() => {
    if (editingSetting) {
        const numChanged = tempAccountNumber !== (editingSetting.accountNumber || '');
        const nameChanged = tempAccountName !== (editingSetting.accountName || '');
        setIsFormDirty(numChanged || nameChanged);
    } else {
        setIsFormDirty(false);
    }
  }, [tempAccountNumber, tempAccountName, editingSetting]);


  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        {[1,2,3,4].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
              { i % 2 === 0 && <Skeleton className="h-8 w-3/4 mt-2" /> }
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
        <h1 className="text-3xl font-semibold text-foreground font-headline">Pengaturan Transaksi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" /> Metode Pembayaran</CardTitle>
          <CardDescription>Kelola metode pembayaran yang diterima, termasuk detail rekening untuk transfer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentSettings.map(setting => {
            const Icon = getPaymentMethodIcon(setting.id);
            return (
              <div key={setting.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <Label htmlFor={`switch-${setting.id}`} className="text-base font-medium cursor-pointer">
                      {setting.name}
                    </Label>
                  </div>
                  {setting.type === 'transfer' && (
                     <Switch
                      id={`switch-${setting.id}`}
                      checked={setting.enabled}
                      onCheckedChange={(checked) => handleEnableToggle(setting.id, checked)}
                    />
                  )}
                   {setting.type === 'cash' && (
                     <CheckCircle className="h-5 w-5 text-green-500" title="Selalu Aktif"/>
                   )}
                </div>
                {setting.type === 'transfer' && setting.enabled && (
                  <div className="mt-3 pl-9 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">No. Rek/ID:</span> {setting.accountNumber || <span className="text-muted-foreground italic">Belum diatur</span>}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Atas Nama:</span> {setting.accountName || <span className="text-muted-foreground italic">Belum diatur</span>}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => handleEditSetting(setting)} className="mt-1">
                      <Edit3 className="mr-2 h-3 w-3" /> Edit Detail
                    </Button>
                  </div>
                )}
                {setting.type === 'transfer' && !setting.enabled && (
                    <p className="mt-2 pl-9 text-sm text-muted-foreground italic flex items-center gap-1"><XCircle className="h-4 w-4" /> Dinonaktifkan</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {editingSetting && (
        <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Detail: {editingSetting.name}</DialogTitle>
              <DialogDescription>
                Masukkan nomor rekening/ID dan nama pemilik akun untuk metode pembayaran ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-account-number">Nomor Rekening / ID Virtual Account</Label>
                <Input
                  id="edit-account-number"
                  value={tempAccountNumber}
                  onChange={(e) => setTempAccountNumber(e.target.value)}
                  placeholder={editingSetting.id === 'qris' ? "ID Merchant QRIS (jika ada)" : "Masukkan nomor"}
                />
              </div>
              <div>
                <Label htmlFor="edit-account-name">Atas Nama (Pemilik Akun)</Label>
                <Input
                  id="edit-account-name"
                  value={tempAccountName}
                  onChange={(e) => setTempAccountName(e.target.value)}
                  placeholder={editingSetting.id === 'qris' ? "Nama Toko Anda (untuk QRIS)" : "Masukkan nama"}
                />
              </div>
              {editingSetting.id === 'qris' && (
                 <div className="text-xs text-muted-foreground p-2 border border-dashed rounded-md bg-amber-50 flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Untuk QRIS, "Nomor Rekening" bisa diisi ID Merchant atau dikosongkan. "Atas Nama" biasanya adalah nama toko Anda yang tertera di QRIS. Pengguna akan scan QR fisik di toko.</span>
                 </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSetting(null)}>Batal</Button>
              <Button onClick={handleSaveEdit} disabled={!isFormDirty}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ReceiptText className="mr-2 h-5 w-5 text-primary" /> Format Nomor Struk</CardTitle>
          <CardDescription>Atur prefix dan format nomor struk. Nomor urut akan ditambahkan secara otomatis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label htmlFor="receiptPrefix">Prefix Struk</Label>
            <Input id="receiptPrefix" defaultValue="RM" aria-readonly disabled className="max-w-xs"/>
            <p className="text-xs text-muted-foreground">Contoh: RM001, RM002. Saat ini, prefix dan nomor urut dikelola otomatis dari halaman kasir.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Tag className="mr-2 h-5 w-5 text-primary" /> Pengaturan Diskon & Promo</CardTitle>
          <CardDescription>Konfigurasi diskon (global atau per item) dan promosi untuk pelanggan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fitur untuk menambahkan dan mengelola diskon (persentase, nominal tetap) serta kode promo sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Percent className="mr-2 h-5 w-5 text-primary" /> Pengaturan Pajak</CardTitle>
          <CardDescription>Tentukan tarif PPN (Pajak Pertambahan Nilai) dan biaya layanan (service charge) jika berlaku.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="vatPercentage">PPN (%)</Label>
            <Input id="vatPercentage" type="number" defaultValue="0" aria-readonly disabled className="max-w-xs"/>
          </div>
          <div className="space-y-1">
            <Label htmlFor="serviceChargePercentage">Biaya Layanan (%)</Label>
            <Input id="serviceChargePercentage" type="number" defaultValue="0" aria-readonly disabled className="max-w-xs"/>
          </div>
          <p className="text-xs text-muted-foreground">
            Integrasi perhitungan pajak ke dalam total transaksi di kasir sedang dalam pengembangan. Saat ini pajak dihitung 0%.
          </p>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm pt-4">
        <p>Beberapa pengaturan di halaman ini masih bersifat placeholder dan akan diimplementasikan secara fungsional di versi mendatang.</p>
        <p>Pastikan untuk menyimpan perubahan pada metode pembayaran agar diterapkan di kasir.</p>
      </div>
    </div>
  );
}
