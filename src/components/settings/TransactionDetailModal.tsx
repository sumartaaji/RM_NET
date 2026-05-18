
'use client';

import type { Transaction, StoreSettings, TransactionItem } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TransactionDetailModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  transaction: Transaction | null;
  storeSettings: Partial<StoreSettings>;
}

export default function TransactionDetailModal({ 
  isOpen, 
  setIsOpen, 
  transaction,
  storeSettings
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };
  
  const getPaymentMethodDisplay = (transaction: Transaction): string => {
    if (transaction.paymentMethod === 'cash') return 'Tunai';
    if (transaction.paymentMethod === 'transfer') {
      return transaction.transferOptionName || 'Transfer';
    }
    return 'Tidak Diketahui';
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="font-headline text-xl">Detail Transaksi: {transaction.transactionNumber}</DialogTitle>
          <DialogDescription>
            Dicatat pada: {formatDate(transaction.dateTime)}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow my-4 pr-2">
          <div className="space-y-4 text-sm">
            <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">{storeSettings.storeName || 'Nama Toko Anda'}</h3>
                {storeSettings.storeAddress && <p className="text-xs text-muted-foreground">{storeSettings.storeAddress}</p>}
                {storeSettings.storePhone && <p className="text-xs text-muted-foreground">Telp: {storeSettings.storePhone}</p>}
            </div>

            <Separator/>
            
            <h4 className="font-semibold text-md mt-2">Item Dibeli:</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-right">Harga Satuan (Rp)</TableHead>
                  <TableHead className="text-right">Subtotal (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction.items.map((item: TransactionItem) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{(item.price * item.quantity).toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-3"/>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>Subtotal:</div>
              <div className="text-right font-medium">Rp {transaction.subtotal.toLocaleString('id-ID')}</div>
              
              {transaction.taxAmount > 0 && (
                <>
                  <div>Pajak ({((transaction.taxAmount / transaction.subtotal) * 100 || 0).toFixed(0)}%):</div>
                  <div className="text-right font-medium">Rp {transaction.taxAmount.toLocaleString('id-ID')}</div>
                  <div className="col-span-2"><Separator className="my-1"/></div>
                </>
              )}
              
              <div className="text-base font-semibold">Total:</div>
              <div className="text-right text-base font-semibold text-primary">Rp {transaction.totalAmount.toLocaleString('id-ID')}</div>
            </div>
            
            <Separator className="my-3"/>
            
            <div className="flex justify-between">
                <span className="font-semibold">Metode Pembayaran:</span>
                <span className="font-medium">{getPaymentMethodDisplay(transaction)}</span>
            </div>
             <p className="text-center text-xs text-muted-foreground pt-4">Terima kasih telah berbelanja!</p>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
