
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label tidak digunakan, bisa dihapus jika tidak ada error dependensi lain
// import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // CardFooter dihapus karena tidak digunakan
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES_STORAGE_KEY, DEFAULT_CATEGORIES, PRODUCTS_STORAGE_KEY } from '@/lib/constants';
import type { Product } from '@/types';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function KategoriSettingsPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadCategories = useCallback(() => {
    try {
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (e) {
      console.error("Error loading categories from localStorage", e);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  const loadProducts = useCallback(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (e) {
      console.error("Error loading products from localStorage", e);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadProducts();
    setMounted(true);
  }, [loadCategories, loadProducts]);

  const saveCategories = (updatedCategories: string[]) => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
      window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    } catch (e) {
      console.error("Error saving categories to localStorage", e);
      toast({ title: "Gagal menyimpan kategori", variant: "destructive" });
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({ title: "Nama kategori tidak boleh kosong", variant: "destructive" });
      return;
    }
    if (categories.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
      toast({ title: "Kategori sudah ada", variant: "destructive" });
      return;
    }
    const updatedCategories = [...categories, newCategory.trim()];
    saveCategories(updatedCategories);
    setNewCategory('');
    toast({ title: `Kategori "${newCategory.trim()}" berhasil ditambahkan` });
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const isCategoryUsed = products.some(product => product.category === categoryToDelete);
    if (isCategoryUsed) {
      toast({
        title: "Kategori Digunakan",
        description: `Kategori "${categoryToDelete}" tidak dapat dihapus karena sedang digunakan oleh satu atau lebih produk.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    saveCategories(updatedCategories);
    toast({ title: `Kategori "${categoryToDelete}" berhasil dihapus` });
  };
  
  if (!mounted) {
    return (
       <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground font-headline">Pengaturan Kategori</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Memuat Kategori...</CardTitle></CardHeader>
          <CardContent><p>Silakan tunggu...</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/pengaturan/produk" aria-label="Kembali ke Pengaturan Produk & Kategori">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-foreground font-headline">Pengaturan Kategori</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tambah Kategori Baru</CardTitle>
          <CardDescription>Masukkan nama untuk kategori produk baru.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nama Kategori Baru"
              className="flex-grow"
            />
            <Button onClick={handleAddCategory}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>Kelola kategori produk yang sudah ada.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground">Belum ada kategori. Silakan tambahkan kategori baru.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                  <span className="text-foreground">{category}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini akan menghapus kategori "{category}". Kategori tidak dapat dihapus jika masih digunakan oleh produk.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
