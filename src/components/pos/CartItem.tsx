
'use client';

import type { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useRef, useEffect, useCallback } from 'react';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const HOLD_INTERVAL_DELAY = 150; // ms

export default function CartItem({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
  const incrementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const decrementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const quantityRef = useRef(item.quantity);

  useEffect(() => {
    quantityRef.current = item.quantity;
  }, [item.quantity]);

  const stopIncrementing = useCallback(() => {
    if (incrementIntervalRef.current) {
      clearInterval(incrementIntervalRef.current);
      incrementIntervalRef.current = null;
    }
  }, []);

  const stopDecrementing = useCallback(() => {
    if (decrementIntervalRef.current) {
      clearInterval(decrementIntervalRef.current);
      decrementIntervalRef.current = null;
    }
  }, []);

  const performIncrement = useCallback(() => {
    onUpdateQuantity(item.id, quantityRef.current + 1);
  }, [item.id, onUpdateQuantity]);

  const performDecrement = useCallback(() => {
    if (quantityRef.current > 1) {
      onUpdateQuantity(item.id, quantityRef.current - 1);
    } else {
      onRemoveItem(item.id);
      stopDecrementing(); // Eksplisit hentikan interval jika item dihapus
    }
  }, [item.id, onUpdateQuantity, onRemoveItem, stopDecrementing]);

  const handleMouseDownIncrement = () => {
    stopDecrementing(); // Pastikan interval lain dihentikan
    performIncrement(); // Aksi awal
    incrementIntervalRef.current = setInterval(performIncrement, HOLD_INTERVAL_DELAY);
  };

  const handleMouseDownDecrement = () => {
    stopIncrementing(); // Pastikan interval lain dihentikan
    performDecrement(); // Aksi awal
    decrementIntervalRef.current = setInterval(performDecrement, HOLD_INTERVAL_DELAY);
  };

  // Bersihkan interval saat komponen unmount
  useEffect(() => {
    return () => {
      stopIncrementing();
      stopDecrementing();
    };
  }, [stopIncrementing, stopDecrementing]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newQuantity = parseInt(e.target.value);
    if (isNaN(newQuantity) || newQuantity < 0) newQuantity = 0;
    // Gunakan item.quantity (prop saat ini) untuk logika penghapusan, karena ini mencerminkan state sebelum input ini.
    if (newQuantity === 0 && item.quantity > 0) { 
      onRemoveItem(item.id);
    } else if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex-grow">
        <h4 className="text-sm font-medium truncate">{item.name}</h4>
        <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString('id-ID')}</p>
        <div className="flex items-center mt-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onMouseDown={handleMouseDownDecrement}
            onMouseUp={stopDecrementing}
            onMouseLeave={stopDecrementing}
            onTouchStart={(e) => { e.preventDefault(); handleMouseDownDecrement(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopDecrementing(); }}
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={item.quantity} // Tetap gunakan item.quantity untuk tampilan input terkontrol
            onChange={handleQuantityChange}
            className="h-7 w-12 text-center mx-1 hide-arrows [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Jumlah item"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onMouseDown={handleMouseDownIncrement}
            onMouseUp={stopIncrementing}
            onMouseLeave={stopIncrementing}
            onTouchStart={(e) => { e.preventDefault(); handleMouseDownIncrement(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopIncrementing(); }}
            aria-label="Tambah jumlah"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemoveItem(item.id)} aria-label="Hapus item">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
