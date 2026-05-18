
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
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ChangePinDialog from '@/components/settings/ChangePinDialog';

// Schema dan Tipe untuk Profil Pengguna
const userProfileSchema = z.object({
  userName: z.string().min(1, "Nama pengguna tidak boleh kosong").max(50, "Nama pengguna maksimal 50 karakter"),
  userEmail: z.string().email("Format email tidak valid").max(50, "Email maksimal 50 karakter"),
});
type UserProfileFormData = z.infer<typeof userProfileSchema>;
const PROFILE_LOCAL_STORAGE_KEY = 'userProfileSettings';
const DEFAULT_USER_NAME = 'Pengguna RM_NET';
const DEFAULT_USER_EMAIL = 'user@example.com';

// Schema dan Tipe untuk Pengaturan Toko
const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Nama toko tidak boleh kosong").max(50, "Nama toko maksimal 50 karakter"),
  storeAddress: z.string().min(1, "Alamat toko tidak boleh kosong").max(200, "Alamat maksimal 200 karakter"),
  storePhone: z.string().max(20, "Nomor telepon maksimal 20 karakter").optional().or(z.literal('')),
  storeEmail: z.string().email("Format email tidak valid").max(50, "Email maksimal 50 karakter").optional().or(z.literal('')),
});
type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;
const STORE_LOCAL_STORAGE_KEY = 'storeSettings';
const DEFAULT_STORE_NAME = 'RM_NET Cashier';

export default function ProfilSettingsPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isChangePinDialogOpen, setIsChangePinDialogOpen] = useState(false);

  // State dan Form untuk Profil Pengguna
  const [initialProfileValues, setInitialProfileValues] = useState<UserProfileFormData>({
    userName: DEFAULT_USER_NAME,
    userEmail: DEFAULT_USER_EMAIL,
  });
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors, isSubmitting: isSubmittingProfile }, reset: resetProfile } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: initialProfileValues,
  });

  // State dan Form untuk Pengaturan Toko
  const [initialStoreValues, setInitialStoreValues] = useState<StoreSettingsFormData>({
    storeName: DEFAULT_STORE_NAME,
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
  });
  const { register: registerStore, handleSubmit: handleSubmitStore, formState: { errors: storeErrors, isSubmitting: isSubmittingStore }, reset: resetStore } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: initialStoreValues,
  });

  useEffect(() => {
    // Load Profil Pengguna
    try {
      const savedProfile = localStorage.getItem(PROFILE_LOCAL_STORAGE_KEY);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile) as UserProfileFormData;
        setInitialProfileValues(parsedProfile);
        resetProfile(parsedProfile);
      }
    } catch (e) {
      console.error("Error reading user profile from localStorage", e);
    }

    // Load Pengaturan Toko
    try {
      const savedSettings = localStorage.getItem(STORE_LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as StoreSettingsFormData;
        setInitialStoreValues(parsedSettings);
        resetStore(parsedSettings);
      }
    } catch (e) {
      console.error("Error reading store settings from localStorage", e);
    }
    setMounted(true);
  }, [resetProfile, resetStore]);

  useEffect(() => {
    if (mounted) {
      resetProfile(initialProfileValues);
      resetStore(initialStoreValues);
    }
  }, [initialProfileValues, initialStoreValues, mounted, resetProfile, resetStore]);

  const onProfileSubmit: SubmitHandler<UserProfileFormData> = (data) => {
    try {
      localStorage.setItem(PROFILE_LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Profil Disimpan",
        description: "Informasi profil berhasil diperbarui.",
      });
      // Dispatch event if other components need to react to profile changes
      // window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: data }));
    } catch (error) {
      toast({
        title: "Gagal Menyimpan Profil",
        description: "Terjadi kesalahan saat menyimpan profil.",
        variant: "destructive",
      });
      console.error("Error saving user profile to localStorage", error);
    }
  };

  const onStoreSubmit: SubmitHandler<StoreSettingsFormData> = (data) => {
    try {
      localStorage.setItem(STORE_LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Pengaturan Toko Disimpan",
        description: "Informasi toko berhasil diperbarui.",
      });
      window.dispatchEvent(new CustomEvent('storeSettingsUpdated', { detail: data }));
    } catch (error) {
      toast({
        title: "Gagal Menyimpan Pengaturan Toko",
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
          <h1 className="text-3xl font-semibold text-foreground font-headline">Pengaturan Profil & Toko</h1>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
         <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-4 w-2/3" />
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
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/pengaturan" aria-label="Kembali ke Pengaturan">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground font-headline">Pengaturan Profil & Toko</h1>
      </div>
      
      <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil Pengguna</CardTitle>
            <CardDescription>Perbarui nama dan alamat email Anda. Di sini Anda juga bisa mengganti PIN.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="userName">Nama Pengguna</Label>
              <Input id="userName" {...registerProfile('userName')} />
              {profileErrors.userName && <p className="text-sm text-destructive">{profileErrors.userName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="userEmail">Email</Label>
              <Input id="userEmail" type="email" {...registerProfile('userEmail')} />
              {profileErrors.userEmail && <p className="text-sm text-destructive">{profileErrors.userEmail.message}</p>}
            </div>
             <div className="space-y-1">
                <Label>Keamanan Akun</Label>
                <Button variant="outline" className="mt-2 text-sm w-full sm:w-auto" size="sm" onClick={() => setIsChangePinDialogOpen(true)}>
                  <KeyRound className="mr-2 h-4 w-4" /> Ganti PIN
                </Button>
                {auth.isPinDefault() && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Anda masih menggunakan PIN default. Demi keamanan, segera ganti PIN Anda.
                    </p>
                )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmittingProfile}>
              {isSubmittingProfile ? 'Menyimpan Profil...' : 'Simpan Profil'}
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      {isChangePinDialogOpen && (
        <ChangePinDialog 
            isOpen={isChangePinDialogOpen}
            setIsOpen={setIsChangePinDialogOpen}
        />
      )}


      <form onSubmit={handleSubmitStore(onStoreSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Toko</CardTitle>
            <CardDescription>Konfigurasikan detail nama, alamat, dan kontak toko Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="storeName">Nama Toko</Label>
              <Input id="storeName" {...registerStore('storeName')} />
              {storeErrors.storeName && <p className="text-sm text-destructive">{storeErrors.storeName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storeAddress">Alamat Toko</Label>
              <Textarea id="storeAddress" {...registerStore('storeAddress')} />
              {storeErrors.storeAddress && <p className="text-sm text-destructive">{storeErrors.storeAddress.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storePhone">Nomor Telepon Toko</Label>
              <Input id="storePhone" {...registerStore('storePhone')} type="tel" placeholder="Opsional"/>
              {storeErrors.storePhone && <p className="text-sm text-destructive">{storeErrors.storePhone.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storeEmail">Email Toko</Label>
              <Input id="storeEmail" {...registerStore('storeEmail')} type="email" placeholder="Opsional" />
              {storeErrors.storeEmail && <p className="text-sm text-destructive">{storeErrors.storeEmail.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmittingStore}>
              {isSubmittingStore ? 'Menyimpan Info Toko...' : 'Simpan Info Toko'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
