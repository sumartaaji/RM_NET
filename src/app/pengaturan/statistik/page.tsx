
'use client';

import Link from 'next/link';
import { ArrowLeft, DollarSign, ListChecks, BarChart3 as BarChartIconLucide } from 'lucide-react'; // Renamed BarChart3 to avoid conflict
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useCallback } from 'react';
import type { Transaction, Product } from '@/types';
import { TRANSACTIONS_STORAGE_KEY, PRODUCTS_STORAGE_KEY } from '@/lib/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DailySales {
  date: string;
  total: number;
}

interface CategorySales {
  name: string;
  value: number;
}

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF4242', '#FF7F50', '#DC143C', '#00CED1', '#FFD700'];

export default function StatistikPenjualanPage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactionsCount, setTotalTransactionsCount] = useState(0);
  const [averageSale, setAverageSale] = useState(0);
  const [dailySalesData, setDailySalesData] = useState<DailySales[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<CategorySales[]>([]);

  const processData = useCallback((loadedTransactions: Transaction[], loadedProducts: Product[]) => {
    // Calculate basic stats
    const total = loadedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    setTotalSales(total);
    setTotalTransactionsCount(loadedTransactions.length);
    setAverageSale(loadedTransactions.length > 0 ? total / loadedTransactions.length : 0);

    // Process data for daily sales chart
    const salesByDate: { [key: string]: { sum: number, originalDate: Date } } = {};
    loadedTransactions.forEach(t => {
      const transactionDate = new Date(t.dateTime);
      const dateKey = transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD for sorting
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { sum: 0, originalDate: transactionDate };
      }
      salesByDate[dateKey].sum += t.totalAmount;
    });

    const formattedDailySales = Object.entries(salesByDate)
      .map(([_, { sum, originalDate }]) => ({
        date: originalDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), // For display
        total: sum,
        originalDate // For sorting
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
      .map(({date, total}) => ({date, total})); // Remove originalDate after sorting
    setDailySalesData(formattedDailySales);

    // Process data for category sales chart
    const salesByCategory: { [key: string]: number } = {};
    loadedTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const productDetails = loadedProducts.find(p => p.id === item.id || p.name === item.name);
        const category = productDetails?.category || 'Lainnya';
        salesByCategory[category] = (salesByCategory[category] || 0) + (item.price * item.quantity);
      });
    });
    const formattedCategorySales = Object.entries(salesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    setCategorySalesData(formattedCategorySales);

  }, []);

  const loadAllData = useCallback(() => {
    try {
      const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      const loadedTransactions = storedTransactions ? JSON.parse(storedTransactions) as Transaction[] : [];
      setTransactions(loadedTransactions);

      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const loadedProducts = storedProducts ? JSON.parse(storedProducts) as Product[] : [];
      setProducts(loadedProducts);
      
      processData(loadedTransactions, loadedProducts);

    } catch (e) {
      console.error("Error loading data for statistics:", e);
    }
  }, [processData]);

  useEffect(() => {
    loadAllData();
    setMounted(true);
    
    const handleTransactionsUpdated = () => loadAllData();
    // Assuming 'productsUpdated' might also be relevant if categories are changed or products affecting categories
    window.addEventListener('transactionsUpdated', handleTransactionsUpdated);
    window.addEventListener('productsUpdated', handleTransactionsUpdated); // Potentially refresh if product categories change
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdated);
      window.removeEventListener('productsUpdated', handleTransactionsUpdated);
    };
  }, [loadAllData]);

  if (!mounted) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-1/2 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
        </div>
        <Skeleton className="h-72 w-full rounded-lg mb-6" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/pengaturan/laporan-data" aria-label="Kembali ke Laporan & Data">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-foreground font-headline">Statistik Penjualan</h1>
      </div>
      <p className="text-sm text-muted-foreground -mt-6 mb-6">
        Statistik diperbarui berdasarkan data transaksi yang tersimpan di perangkat ini.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalSales.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactionsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {averageSale.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
      </div>

      {transactions.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Penjualan Harian</CardTitle>
              <CardDescription>Total penjualan berdasarkan hari.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySalesData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={50} />
                  <YAxis 
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rp${new Intl.NumberFormat('id-ID', {notation: 'compact', compactDisplay: 'short'}).format(value)}`}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
                    formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`, "Total"]}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}/>
                  <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Penjualan" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Penjualan per Kategori</CardTitle>
              <CardDescription>Distribusi pendapatan berdasarkan kategori produk.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] w-full flex justify-center items-center p-2">
             {categorySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                       contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
                       formatter={(value: number, name: string) => [`Rp${value.toLocaleString('id-ID')}`, name]}
                       labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{fontSize: '11px', lineHeight: '16px', paddingTop: '20px'}}
                      payload={
                        categorySalesData.map(
                          (entry, index) => ({
                            value: entry.name,
                            type: 'square',
                            id: entry.name,
                            color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
                          })
                        )
                      }
                    />
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={2}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {categorySalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <p className="text-muted-foreground">Tidak ada data penjualan kategori untuk ditampilkan.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="items-center">
            <BarChartIconLucide className="h-12 w-12 text-muted-foreground mb-2" />
            <CardTitle>Belum Ada Data Transaksi</CardTitle>
            <CardDescription>Lakukan penjualan untuk melihat statistik di sini.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="default">
              <Link href="/">Kembali ke Kasir</Link>
            </Button>
          </CardContent>
        </Card>
      )}
       <div className="text-center text-muted-foreground text-xs pt-4 col-span-1 md:col-span-3">
        <p>Semua statistik dan diagram bersumber dari data transaksi yang tersimpan secara lokal di perangkat ini.</p>
      </div>
    </div>
  );
}
