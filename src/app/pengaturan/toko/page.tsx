
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
// import type { StoreSettings } from '@/types'; // StoreSettings type is implicitly defined
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link'; // Ditambahkan Link
import { ArrowLeft } from 'lucide-react'; // Ditambahkan ArrowLeft

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Nama toko tidak boleh kosong").max(50, "Nama toko maksimal 50 karakter"),
  storeAddress: z.string().min(1, "Alamat toko tidak boleh kosong").max(200, "Alamat maksimal 200 karakter"),
  storePhone: z.string().max(20, "Nomor telepon maksimal 20 karakter").optional().or(z.literal('')),
  storeEmail: z.string().email("Format email tidak valid").max(50, "Email maksimal 50 karakter").optional().or(z.literal('')),
});

type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

const LOCAL_STORAGE_KEY = 'storeSettings';
const DEFAULT_STORE_NAME = 'RM_NET Cashier';

export default function TokoSettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  const [initialValues, setInitialValues] = useState<StoreSettingsFormData>({
    storeName: DEFAULT_STORE_NAME,
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as StoreSettingsFormData;
        setInitialValues(parsedSettings);
        reset(parsedSettings); 
      }
    } catch (e) {
      console.error("Error reading store settings from localStorage", e);
    }
    setMounted(true);
  }, [reset]);

  useEffect(() => {
    if (mounted) {
      reset(initialValues);
    }
  }, [initialValues, mounted, reset]);


  const onSubmit: SubmitHandler<StoreSettingsFormData> = (data) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Pengaturan Disimpan",
        description: "Informasi toko berhasil diperbarui.",
      });
      window.dispatchEvent(new CustomEvent('storeSettingsUpdated', { detail: data }));
    } catch (error) {
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan pengaturan.",
        variant: "destructive",
      });
      console.error("Error saving store settings to localStorage", error);
    }
  };
  
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold text-foreground font-headline">Pengaturan Toko</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Toko</CardTitle>
            <CardDescription>Konfigurasikan detail toko Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/pengaturan" aria-label="Kembali ke Pengaturan">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground font-headline">Pengaturan Toko</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Toko</CardTitle>
            <CardDescription>Konfigurasikan detail toko Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="storeName">Nama Toko</Label>
              <Input id="storeName" {...register('storeName')} />
              {errors.storeName && <p className="text-sm text-destructive">{errors.storeName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storeAddress">Alamat Toko</Label>
              <Textarea id="storeAddress" {...register('storeAddress')} />
              {errors.storeAddress && <p className="text-sm text-destructive">{errors.storeAddress.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storePhone">Nomor Telepon</Label>
              <Input id="storePhone" {...register('storePhone')} type="tel" placeholder="Opsional"/>
              {errors.storePhone && <p className="text-sm text-destructive">{errors.storePhone.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storeEmail">Email Toko</Label>
              <Input id="storeEmail" {...register('storeEmail')} type="email" placeholder="Opsional" />
              {errors.storeEmail && <p className="text-sm text-destructive">{errors.storeEmail.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
