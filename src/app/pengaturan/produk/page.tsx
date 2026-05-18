
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import { PRODUCTS_STORAGE_KEY, MOCK_PRODUCTS, CATEGORIES_STORAGE_KEY, DEFAULT_CATEGORIES } from '@/lib/constants';
import ProductForm, { type ProductFormData } from '@/components/settings/ProductForm';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, ArrowLeft, Tags } from 'lucide-react'; 
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

export default function ProdukSettingsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadProducts = useCallback(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts) as Partial<Product>[];
        // Validasi produk, tanpa properti stock
        const validatedProducts = parsedProducts.map(p => ({
            ...MOCK_PRODUCTS[0], // Provide all default fields from a mock product
            ...p, // Override with stored data
            id: p.id || Date.now().toString(), // Ensure ID
            name: p.name || 'Produk Tanpa Nama',
            price: typeof p.price === 'number' ? p.price : 0,
            category: p.category || 'Lainnya',
            // Properti stock tidak lagi disertakan
        })) as Product[];
        setProducts(validatedProducts);
      } else {
        // Produk mock tanpa stock
        setProducts(MOCK_PRODUCTS);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
      }
    } catch (e) {
      console.error("Error loading products from localStorage", e);
      setProducts(MOCK_PRODUCTS); // Fallback ke MOCK_PRODUCTS tanpa stock
    }
  }, []);

  const loadCategories = useCallback(() => {
    try {
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (e) {
      console.error("Error loading categories from localStorage", e);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
    setMounted(true);

    const handleCategoriesUpdate = () => loadCategories();
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
    };
  }, [loadProducts, loadCategories]);

  const saveProducts = (updatedProducts: Product[]) => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    } catch (e) {
      console.error("Error saving products to localStorage", e);
      toast({ title: "Gagal menyimpan produk", variant: "destructive" });
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const confirmDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    saveProducts(updatedProducts);
    toast({ title: "Produk berhasil dihapus" });
    setProductToDelete(null);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    if (editingProduct) { 
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { ...editingProduct, ...data } : p // Stock tidak lagi di-update
      );
      saveProducts(updatedProducts);
      toast({ title: `Produk "${data.name}" berhasil diperbarui` });
    } else { 
      const newProduct: Product = {
        ...data,
        id: data.id || Date.now().toString(),
        // Stock tidak lagi ditambahkan
      };
      saveProducts([...products, newProduct]);
      toast({ title: `Produk "${data.name}" berhasil ditambahkan` });
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-grow flex justify-between items-center">
             <h1 className="text-2xl font-semibold text-foreground font-headline">Pengaturan Produk & Kategori</h1>
             <div className="flex gap-2">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-40" />
             </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
            <CardDescription>Kelola semua produk yang tersedia di toko Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
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
        <div className="flex-grow flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-foreground font-headline">Pengaturan Produk & Kategori</h1>
            <div className="flex gap-2">
                <Button variant="outline" asChild>
                    <Link href="/pengaturan/kategori"><Tags className="mr-2 h-4 w-4"/> Kelola Kategori</Link>
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleAddProduct}><PlusCircle className="mr-2 h-4 w-4"/> Tambah Produk</Button>
                </DialogTrigger>
                {isDialogOpen && ( 
                    <ProductForm 
                    product={editingProduct} 
                    categories={categories} 
                    onSubmit={handleFormSubmit}
                    setDialogOpen={setIsDialogOpen}
                    />
                )}
                </Dialog>
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>Kelola semua produk yang tersedia di toko Anda beserta harga jual.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground">Belum ada produk. Silakan tambahkan produk baru.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga (Rp)</TableHead>
                  {/* Kolom Stok dihapus */}
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price.toLocaleString('id-ID')}</TableCell>
                    {/* Kolom Stok dihapus */}
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setProductToDelete(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
       {productToDelete && (
        <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus produk "{productToDelete.name}"? Tindakan ini tidak dapat diurungkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setProductToDelete(null)}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => confirmDeleteProduct(productToDelete.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
