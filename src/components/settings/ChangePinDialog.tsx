
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { KeyRound } from 'lucide-react';

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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePinFormData>({
    resolver: zodResolver(changePinSchema),
  });

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
            <Input 
              id="currentPin" 
              type="password" 
              {...register('currentPin')} 
              maxLength={6}
              className="mt-1" 
            />
            {errors.currentPin && <p className="text-sm text-destructive mt-1">{errors.currentPin.message}</p>}
          </div>
          <div>
            <Label htmlFor="newPin">PIN Baru (4-6 Digit)</Label>
            <Input 
              id="newPin" 
              type="password" 
              {...register('newPin')} 
              maxLength={6}
              className="mt-1"
            />
            {errors.newPin && <p className="text-sm text-destructive mt-1">{errors.newPin.message}</p>}
          </div>
          <div>
            <Label htmlFor="confirmNewPin">Konfirmasi PIN Baru</Label>
            <Input 
              id="confirmNewPin" 
              type="password" 
              {...register('confirmNewPin')} 
              maxLength={6}
              className="mt-1"
            />
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
