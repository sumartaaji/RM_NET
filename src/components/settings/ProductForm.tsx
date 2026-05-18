
'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Product } from '@/types';

const productFormSchema = z.object({
  id: z.string().optional(), 
  name: z.string().min(1, "Nama produk tidak boleh kosong").max(100, "Nama produk maksimal 100 karakter"),
  price: z.coerce.number().min(0, "Harga harus positif"),
  // Stok dihapus dari skema
  category: z.string().min(1, "Kategori harus dipilih"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null; 
  categories: string[];
  onSubmit: (data: ProductFormData) => void;
  setDialogOpen: (open: boolean) => void;
}

export default function ProductForm({ product, categories, onSubmit, setDialogOpen }: ProductFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      id: product?.id || undefined,
      name: product?.name || '',
      price: product?.price || 0,
      // Stok dihapus dari defaultValues
      category: product?.category || '',
      description: product?.description || '',
    },
  });

  const handleFormSubmit: SubmitHandler<ProductFormData> = (data) => {
    onSubmit(data);
    reset(); 
  };

  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>{product ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
        <DialogDescription>
          {product ? 'Perbarui detail produk.' : 'Isi detail untuk produk baru.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nama</Label>
          <Input id="name" {...register('name')} className="col-span-3" />
          {errors.name && <p className="col-span-4 text-sm text-destructive text-right">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">Harga (Rp)</Label>
          <Input id="price" type="number" {...register('price')} className="col-span-3" />
          {errors.price && <p className="col-span-4 text-sm text-destructive text-right">{errors.price.message}</p>}
        </div>

        {/* Input field untuk Stok dihapus */}

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Kategori</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  {categories.length === 0 && <SelectItem value="" disabled>Tidak ada kategori</SelectItem>}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="col-span-4 text-sm text-destructive text-right">{errors.category.message}</p>}
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Deskripsi</Label>
          <Textarea id="description" {...register('description')} className="col-span-3" placeholder="Opsional"/>
          {errors.description && <p className="col-span-4 text-sm text-destructive text-right">{errors.description.message}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (product ? 'Simpan Perubahan' : 'Tambah Produk')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
