
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ProductCatalog from '@/components/pos/ProductCatalog';
import Cart from '@/components/pos/Cart';
import type { Product, CartItem as CartItemType, Transaction, TransactionItem, SortOption, PaymentMethodType } from '@/types';
import { MOCK_PRODUCTS, PRODUCTS_STORAGE_KEY, CATEGORIES_STORAGE_KEY, DEFAULT_CATEGORIES, TRANSACTIONS_STORAGE_KEY, CART_STORAGE_KEY } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, LogIn, Lightbulb } from 'lucide-react'; 
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useInactivityTimer } from '@/hooks/useInactivityTimer'; // Import the new hook

const INACTIVITY_TIMEOUT_MS = 1 * 60 * 1000; // 1 minute

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(['Semua']);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);
  
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleInactiveLogout = useCallback(() => {
    if (auth.isLoggedIn) { // Ensure user is still logged in to prevent multiple calls
      auth.logout();
      router.push('/login');
      toast({
        title: "Sesi Berakhir",
        description: "Anda telah logout karena tidak ada aktivitas selama 1 menit.",
        variant: "default", // atau "warning"
        duration: 7000,
      });
    }
  }, [auth, router, toast]);

  useInactivityTimer({
    timeoutMilliseconds: INACTIVITY_TIMEOUT_MS,
    onTimeout: handleInactiveLogout,
    isActive: auth.isLoggedIn && mounted, // Timer only active if logged in and component mounted
  });

  const loadData = useCallback(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts) as Partial<Product>[];
        const validatedProducts = parsedProducts.map(p => ({
          ...MOCK_PRODUCTS[0], 
          ...p, 
          id: p.id || Date.now().toString(),
          name: p.name || 'Produk Tanpa Nama',
          price: typeof p.price === 'number' ? p.price : 0,
          category: p.category || 'Lainnya',
        })) as Product[];
        setProducts(validatedProducts);
      } else {
        setProducts(MOCK_PRODUCTS);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
      }

      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setDynamicCategories(['Semua', ...JSON.parse(storedCategories)]);
      } else {
        const uniqueCategories = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category) || DEFAULT_CATEGORIES));
        setDynamicCategories(['Semua', ...uniqueCategories]);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(uniqueCategories));
      }

      const storedCartItems = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
      }

    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setProducts(MOCK_PRODUCTS); 
      setDynamicCategories(['Semua', ...DEFAULT_CATEGORIES]);
      setCartItems([]); 
    }
  }, []);

  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) {
      router.push('/login');
    }
  }, [auth.isLoading, auth.isLoggedIn, router]);

  useEffect(() => {
    if (auth.isLoggedIn) {
      loadData();
      setMounted(true); 

      const handleDataUpdate = () => loadData();
      window.addEventListener('productsUpdated', handleDataUpdate);
      window.addEventListener('categoriesUpdated', handleDataUpdate);

      return () => {
        window.removeEventListener('productsUpdated', handleDataUpdate);
        window.removeEventListener('categoriesUpdated', handleDataUpdate);
      };
    } else {
      setMounted(false);
    }
  }, [auth.isLoggedIn, loadData]);
  
  useEffect(() => {
    if (mounted && auth.isLoggedIn) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Error saving cart items to localStorage:", error);
      }
    }
  }, [cartItems, mounted, auth.isLoggedIn]);

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    toast({
      title: `${product.name} ditambahkan`,
      description: "Produk berhasil ditambahkan ke keranjang.",
      duration: 3000,
    });
  }, [toast]);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0) 
    );
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    if (itemToRemove) {
      toast({
        title: `${itemToRemove.name} dihapus`,
        description: "Produk berhasil dihapus dari keranjang.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [cartItems, toast]);
  

  const handleConfirmPayment = useCallback((
    paymentMethod: PaymentMethodType, 
    amountPaid?: number, 
    changeGiven?: number,
    transferOptionId?: string,
    transferOptionName?: string
  ) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmount = 0;
    const totalAmount = subtotal;

    const transactionItems: TransactionItem[] = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    let newTransactionNumber = 'RM001';
    try {
        const existingTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_STORAGE_KEY) || '[]') as Transaction[];
        if (existingTransactions.length > 0) {
            const sortedTransactions = existingTransactions
                .filter(t => t.transactionNumber && t.transactionNumber.startsWith('RM'))
                .sort((a, b) => {
                    const numA = parseInt(a.transactionNumber.substring(2), 10);
                    const numB = parseInt(b.transactionNumber.substring(2), 10);
                    return numA - numB;
                });
            
            if (sortedTransactions.length > 0) {
                const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
                const lastNumPart = parseInt(lastTransaction.transactionNumber.substring(2), 10);
                if (!isNaN(lastNumPart)) {
                    newTransactionNumber = `RM${String(lastNumPart + 1).padStart(3, '0')}`;
                }
            }
        }
    } catch (error) {
        console.error("Error generating new transaction number:", error);
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(), 
      dateTime: new Date().toISOString(),
      items: transactionItems,
      subtotal,
      taxAmount,
      totalAmount,
      paymentMethod,
      transactionNumber: newTransactionNumber,
      amountPaid: (paymentMethod === 'cash' || (paymentMethod === 'transfer' && amountPaid !== undefined)) ? amountPaid : totalAmount,
      changeGiven: (paymentMethod === 'cash' || (paymentMethod === 'transfer' && changeGiven !== undefined)) ? changeGiven : 0,
      ...(paymentMethod === 'transfer' && transferOptionId && { transferOptionId }),
      ...(paymentMethod === 'transfer' && transferOptionName && { transferOptionName }),
    };

    try {
      const existingTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_STORAGE_KEY) || '[]') as Transaction[];
      existingTransactions.unshift(newTransaction); 
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(existingTransactions));
      
      window.dispatchEvent(new CustomEvent('transactionsUpdated'));
      
      // Kode untuk memutar suara dihapus dari sini

      let toastDescription = `Transaksi #${newTransaction.transactionNumber} telah disimpan.`;
      if (paymentMethod === 'cash') {
        toastDescription += ` Metode: Tunai.`;
        if (newTransaction.changeGiven !== undefined && newTransaction.changeGiven > 0) {
          toastDescription += ` Kembalian: Rp ${newTransaction.changeGiven.toLocaleString('id-ID')}.`;
        } else {
          toastDescription += ` Uang pas diterima.`;
        }
      } else if (paymentMethod === 'transfer' && newTransaction.transferOptionName) {
         toastDescription += ` Metode: Transfer (${newTransaction.transferOptionName}).`;
         if (newTransaction.changeGiven !== undefined && newTransaction.changeGiven > 0) {
            toastDescription += ` Kembalian: Rp ${newTransaction.changeGiven.toLocaleString('id-ID')}.`;
          } else if (newTransaction.amountPaid === newTransaction.totalAmount) {
            toastDescription += ` Pembayaran sesuai tagihan.`;
          }
      }

      toast({
        title: "Pembayaran Berhasil!",
        description: toastDescription,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error saving transaction to localStorage:", error);
      toast({
        title: "Gagal Menyimpan Transaksi",
        description: "Terjadi kesalahan saat menyimpan detail transaksi.",
        variant: "destructive",
      });
    }
    
    setCartItems([]);
  }, [cartItems, toast]);
  
  const renderAppContent = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 bg-card p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold font-headline text-foreground">Katalog Produk</h2>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Tampilan Grid">
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="Tampilan Daftar">
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <ProductCatalog
            products={products}
            categories={dynamicCategories}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortOption={sortOption}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortOption}
            onAddToCart={handleAddToCart}
            viewMode={viewMode}
          />
        </div>

        <div className="lg:col-span-1 space-y-6 flex flex-col">
            <div className="flex-grow min-h-[300px] lg:min-h-0"> 
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onConfirmPayment={handleConfirmPayment}
              />
          </div>
        </div>
      </div>
    </>
  );
  
  if (auth.isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center items-center">
          <div className="text-center">
            <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/20" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-6 w-64 mx-auto" />
            <p className="mt-4 text-muted-foreground">Memeriksa status autentikasi...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!auth.isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center items-center">
           <div className="text-center">
            <LogIn className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">Anda belum masuk.</p>
            <p className="text-muted-foreground mb-4">Mengarahkan ke halaman masuk...</p>
            <Button onClick={() => router.push('/login')}>
              <LogIn className="mr-2 h-4 w-4" /> Pergi ke Halaman Masuk
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  if (!mounted) {
     return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center items-center">
          <div className="text-center">
            <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/20" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-6 w-64 mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Memuat data aplikasi...</p>
          </div>
        </main>
      </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 relative">
        {renderAppContent()}
      </main>
    </div>
  );
}
