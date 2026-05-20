
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const changePinSchema = z.object({
  currentPin: z.string().min(1, "PIN saat ini harus diisi."),
  newPin: z.string()
    .min(4, "PIN baru minimal 4 digit.")
    .max(6, "PIN baru maksimal 6 digit.")
    .regex(/^\d+$/, "PIN baru harus terdiri dari angka."),
  confirmNewPin: z.string()
}).refine(data => data.newPin === data.confirmNewPin, {
  message: "Konfirmasi PIN baru tidak cocok.",
  path: ["confirmNewPin"],
});

type ChangePinFormData = z.infer<typeof changePinSchema>;

interface ChangePinDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ChangePinDialog({ isOpen, setIsOpen }: ChangePinDialogProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePinFormData>({
    resolver: zodResolver(changePinSchema),
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
     setMounted(true);
  }, []);

  if (!mounted) return null;

  const onSubmit: SubmitHandler<ChangePinFormData> = async (data) => {
    const result = auth.changePin(data.currentPin, data.newPin);
    if (result.success) {
      toast({ title: "Sukses", description: result.message });
      reset();
      setIsOpen(false);
    } else {
      toast({ title: "Gagal", description: result.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) reset(); // Reset form on close
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> Ganti PIN Keamanan
          </DialogTitle>
          <DialogDescription>
            Masukkan PIN Anda saat ini dan PIN baru yang diinginkan. PIN baru harus 4-6 digit angka.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="currentPin">PIN Saat Ini</Label>
            <div className="relative mt-1">
              <Input 
                id="currentPin" 
                type={showCurrentPin ? "text" : "password"} 
                {...register('currentPin')} 
                maxLength={6}
                className="pr-10" 
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
              >
                {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.currentPin && <p className="text-sm text-destructive mt-1">{errors.currentPin.message}</p>}
          </div>
          <div>
            <Label htmlFor="newPin">PIN Baru (4-6 Digit)</Label>
            <div className="relative mt-1">
              <Input 
                id="newPin" 
                type={showNewPin ? "text" : "password"} 
                {...register('newPin')} 
                maxLength={6}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPin(!showNewPin)}
              >
                {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.newPin && <p className="text-sm text-destructive mt-1">{errors.newPin.message}</p>}
          </div>
          <div>
            <Label htmlFor="confirmNewPin">Konfirmasi PIN Baru</Label>
            <div className="relative mt-1">
              <Input 
                id="confirmNewPin" 
                type={showConfirmPin ? "text" : "password"} 
                {...register('confirmNewPin')} 
                maxLength={6}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
              >
                {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmNewPin && <p className="text-sm text-destructive mt-1">{errors.confirmNewPin.message}</p>}
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan PIN Baru'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
