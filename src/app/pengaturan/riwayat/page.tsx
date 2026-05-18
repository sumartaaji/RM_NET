
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Transaction, StoreSettings } from '@/types';
import { TRANSACTIONS_STORAGE_KEY, STORE_SETTINGS_KEY, DEFAULT_STORE_NAME } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, History as HistoryIcon, Printer, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import TransactionDetailModal from '@/components/settings/TransactionDetailModal';
import PrintableReceipt from '@/components/settings/PrintableReceipt';
import { Skeleton } from '@/components/ui/skeleton';
import html2canvas from 'html2canvas';
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


export default function RiwayatPembayaranPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransactionForView, setSelectedTransactionForView] = useState<Transaction | null>(null);
  
  const [transactionForImageSave, setTransactionForImageSave] = useState<Transaction | null>(null);
  const [transactionToCaptureDOM, setTransactionToCaptureDOM] = useState<Transaction | null>(null); 

  const [transactionForDirectPrint, setTransactionForDirectPrint] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [showDeleteAllConfirmDialog, setShowDeleteAllConfirmDialog] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [storeSettings, setStoreSettings] = useState<Partial<StoreSettings>>({ storeName: DEFAULT_STORE_NAME });
  const receiptRef = useRef<HTMLDivElement>(null);

  const loadTransactions = useCallback(() => {
    try {
      const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions) as Transaction[]);
      } else {
        setTransactions([]);
      }
    } catch (e) {
      console.error("Error loading transactions from localStorage", e);
      toast({ title: "Gagal memuat riwayat transaksi", variant: "destructive" });
      setTransactions([]);
    }
  }, [toast]);

  const loadStoreSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem(STORE_SETTINGS_KEY);
      if (savedSettings) {
        setStoreSettings(JSON.parse(savedSettings));
      }
      const userProfile = localStorage.getItem('userProfileSettings');
      if (userProfile) {
        const parsedProfile = JSON.parse(userProfile);
        setStoreSettings(prev => ({...prev, userName: parsedProfile.userName}));
      }
    } catch (e) {
      console.error("Error loading store settings or user profile", e);
    }
  }, []);


  useEffect(() => {
    loadTransactions();
    loadStoreSettings();
    setMounted(true);
  }, [loadTransactions, loadStoreSettings]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransactionForView(transaction);
    setIsModalOpen(true);
  };

  const handleInitiateSaveReceiptAsImage = (transaction: Transaction) => {
    setTransactionForImageSave(transaction); 
    setTransactionToCaptureDOM(transaction);   
    toast({ title: "Menyiapkan Struk", description: "Harap tunggu sebentar..." });
  };

  useEffect(() => {
    if (transactionToCaptureDOM && receiptRef.current && transactionForImageSave && transactionForImageSave.id === transactionToCaptureDOM.id) {
      const captureAndDownload = async () => {
        if (!receiptRef.current) {
            toast({ title: "Gagal Menyimpan Struk", description: "Referensi struk tidak ditemukan.", variant: "destructive" });
            setTransactionForImageSave(null);
            setTransactionToCaptureDOM(null);
            return;
        }
        try {
          const canvas = await html2canvas(receiptRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
          });
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `struk-${transactionToCaptureDOM.transactionNumber}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({ title: "Struk Disimpan", description: "Struk berhasil diunduh sebagai gambar." });
        } catch (error) {
          console.error("Error saving receipt as image:", error);
          toast({ title: "Gagal Menyimpan Struk", description: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}`, variant: "destructive" });
        } finally {
          setTransactionForImageSave(null);
          setTransactionToCaptureDOM(null);
        }
      };
      
      const timerId = setTimeout(captureAndDownload, 100);
      return () => clearTimeout(timerId);
    }
  }, [transactionToCaptureDOM, transactionForImageSave, toast]);


  const handleDirectPrint = (transaction: Transaction) => {
    setTransactionForDirectPrint(transaction);
  };

  useEffect(() => {
    if (transactionForDirectPrint && receiptRef.current) {
      document.body.classList.add('printing-active');
      
      const handleAfterPrint = () => {
        document.body.classList.remove('printing-active');
        setTransactionForDirectPrint(null);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      
      setTimeout(() => {
        window.print();
      }, 100); 
    }
  }, [transactionForDirectPrint]);

  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
  };

  const confirmDeleteTransaction = () => {
    if (!transactionToDelete) return;
    try {
      const updatedTransactions = transactions.filter(t => t.id !== transactionToDelete.id);
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
      toast({ title: "Transaksi Dihapus", description: `Transaksi #${transactionToDelete.transactionNumber} berhasil dihapus.` });
      window.dispatchEvent(new CustomEvent('transactionsUpdated'));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({ title: "Gagal Menghapus Transaksi", variant: "destructive" });
    }
    setTransactionToDelete(null);
  };

  const handleBackupAllTransactions = () => {
    try {
      const currentTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (!currentTransactions || JSON.parse(currentTransactions).length === 0) {
        toast({
          title: "Tidak Ada Transaksi",
          description: "Tidak ada data transaksi untuk di-backup.",
          variant: "default"
        });
        return;
      }
      const jsonString = currentTransactions; // Already a JSON string from localStorage
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      link.href = url;
      link.download = `rm_net_riwayat_transaksi_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Transaksi Berhasil",
        description: `Semua data transaksi telah diunduh sebagai ${link.download}.`,
      });
    } catch (error) {
      console.error("Error during transactions backup:", error);
      toast({
        title: "Backup Transaksi Gagal",
        description: "Terjadi kesalahan saat membuat file backup transaksi.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteAllTransactions = () => {
    try {
      localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
      setTransactions([]);
      toast({
        title: "Semua Transaksi Dihapus",
        description: "Seluruh riwayat transaksi telah berhasil dihapus.",
      });
      window.dispatchEvent(new CustomEvent('transactionsUpdated'));
    } catch (error) {
      console.error("Error deleting all transactions:", error);
      toast({
        title: "Gagal Menghapus Semua Transaksi",
        description: "Terjadi kesalahan.",
        variant: "destructive",
      });
    }
    setShowDeleteAllConfirmDialog(false);
  };


  const getPaymentMethodDisplay = (transaction: Transaction): string => {
    if (transaction.paymentMethod === 'cash') return 'Tunai';
    if (transaction.paymentMethod === 'transfer') {
      return transaction.transferOptionName || 'Transfer';
    }
    return 'Tidak Diketahui';
  };
  
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground font-headline flex items-center">
            <HistoryIcon className="mr-3 h-6 w-6" /> Riwayat Pembayaran
          </h1>
        </div>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Memuat Riwayat...</CardTitle>
              <CardDescription>Harap tunggu sebentar.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-44" />
            </div>
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
        <h1 className="text-2xl font-semibold text-foreground font-headline flex items-center">
          <HistoryIcon className="mr-3 h-6 w-6" /> Riwayat Pembayaran
        </h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>Berikut adalah semua transaksi yang telah tercatat.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleBackupAllTransactions} className="w-full sm:w-auto text-sm" size="sm">
              <Download className="mr-2 h-4 w-4" /> Backup Transaksi (JSON)
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteAllConfirmDialog(true)} 
              disabled={transactions.length === 0} 
              className="w-full sm:w-auto text-sm" 
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Semua Transaksi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada riwayat transaksi.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal & Waktu</TableHead>
                  <TableHead>Total Pembayaran (Rp)</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                    <TableCell>{new Date(transaction.dateTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                    <TableCell>{transaction.totalAmount.toLocaleString('id-ID')}</TableCell>
                    <TableCell>{getPaymentMethodDisplay(transaction)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" onClick={() => handleViewTransaction(transaction)} title="Lihat Detail">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDirectPrint(transaction)} title="Print Struk">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleInitiateSaveReceiptAsImage(transaction)} title="Unduh Struk">
                        <Download className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction)} title="Hapus Transaksi" className="text-destructive hover:text-destructive hover:bg-destructive/10">
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

      {selectedTransactionForView && (
        <TransactionDetailModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          transaction={selectedTransactionForView}
          storeSettings={storeSettings}
        />
      )}

      {transactionToDelete && (
        <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus transaksi <span className="font-semibold">#{transactionToDelete.transactionNumber}</span> secara permanen.
                Data yang sudah dihapus tidak dapat dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTransaction}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog open={showDeleteAllConfirmDialog} onOpenChange={setShowDeleteAllConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-destructive h-5 w-5"/>Konfirmasi Hapus Semua Transaksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda benar-benar yakin ingin menghapus <span className="font-bold">SEMUA</span> riwayat transaksi? 
              Tindakan ini tidak dapat diurungkan dan semua data transaksi akan hilang permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllTransactions}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div id="print-container" ref={receiptRef}>
        {(transactionForImageSave || transactionForDirectPrint) && (
           <PrintableReceipt 
            transaction={transactionForImageSave || transactionForDirectPrint!} 
            storeSettings={storeSettings} />
        )}
      </div>
    </div>
  );
}

