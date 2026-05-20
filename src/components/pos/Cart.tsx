
import type { CartItem as CartItemType, PaymentMethodType, PaymentSetting } from '@/types';
import CartItem from './CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, DollarSign, ArrowRightLeft, Edit2, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from 'react';
import { PAYMENT_SETTINGS_STORAGE_KEY, DEFAULT_PAYMENT_SETTINGS, getPaymentMethodIcon } from '@/lib/constants';

interface CartProps {
  cartItems: CartItemType[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId:string) => void;
  onConfirmPayment: (paymentMethod: PaymentMethodType, amountPaid?: number, changeGiven?: number, transferOptionId?: string, transferOptionName?: string) => void;
}

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onConfirmPayment }: CartProps) {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>(DEFAULT_PAYMENT_SETTINGS);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('cash');
  const [selectedTransferOptionId, setSelectedTransferOptionId] = useState<string | null>(null);
  const [showAmountInputForTransfer, setShowAmountInputForTransfer] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [calculatedChange, setCalculatedChange] = useState(0);
  const [mounted, setMounted] = useState(false);

  const loadSettings = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed: PaymentSetting[] = JSON.parse(storedSettings);
        // Merge missing defaults for existing users
        const merged = [...parsed];
        let hasNewDefaults = false;

        DEFAULT_PAYMENT_SETTINGS.forEach(def => {
          if (!merged.find(m => m.id === def.id)) {
            merged.push(def);
            hasNewDefaults = true;
          }
        });

        if (hasNewDefaults) {
          setPaymentSettings(merged);
          localStorage.setItem(PAYMENT_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } else {
          setPaymentSettings(parsed);
        }
      } else {
        setPaymentSettings(DEFAULT_PAYMENT_SETTINGS);
      }
    } catch (e) {
      console.error("Error loading payment settings for cart:", e);
      setPaymentSettings(DEFAULT_PAYMENT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    setMounted(true);
    window.addEventListener('paymentSettingsUpdated', loadSettings);
    return () => window.removeEventListener('paymentSettingsUpdated', loadSettings);
  }, [loadSettings]);


  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; 

  useEffect(() => {
    if (cartItems.length === 0) {
      setAmountReceived('');
      setSelectedTransferOptionId(null);
      setShowAmountInputForTransfer(false);
      setCalculatedChange(0);
    }
  }, [cartItems.length]);

  useEffect(() => {
    setAmountReceived('');
    setCalculatedChange(0);
    setSelectedTransferOptionId(null);
    setShowAmountInputForTransfer(false);
  }, [selectedMethod]);

  useEffect(() => {
    const received = parseFloat(amountReceived);
    if ((selectedMethod === 'cash' || (selectedMethod === 'transfer' && showAmountInputForTransfer)) && !isNaN(received) && received >= total) {
      setCalculatedChange(received - total);
    } else {
      setCalculatedChange(0);
    }
  }, [amountReceived, total, selectedMethod, showAmountInputForTransfer]);

  const handleTransferOptionSelect = (optionId: string) => {
    setSelectedTransferOptionId(optionId);
    setShowAmountInputForTransfer(true);
    setAmountReceived(''); 
    setCalculatedChange(0);
  };

  const handlePaymentAction = () => {
    const paid = parseFloat(amountReceived);
    let transferName: string | undefined = undefined;
    if (selectedMethod === 'transfer' && selectedTransferOptionId) {
        const selectedOptionDetails = paymentSettings.find(s => s.id === selectedTransferOptionId);
        transferName = selectedOptionDetails?.name;
    }
    onConfirmPayment(selectedMethod, paid, calculatedChange, selectedTransferOptionId || undefined, transferName);
    
    setSelectedMethod('cash'); 
    setAmountReceived('');
    setSelectedTransferOptionId(null);
    setShowAmountInputForTransfer(false);
    setCalculatedChange(0);
  };

  const isAmountInputRequired = selectedMethod === 'cash' || (selectedMethod === 'transfer' && showAmountInputForTransfer);
  const receivedValidNumber = !isNaN(parseFloat(amountReceived));
  const isAmountSufficient = isAmountInputRequired ? (receivedValidNumber && parseFloat(amountReceived) >= total) : true;
  
  let canConfirmPayment = cartItems.length > 0;
  if (selectedMethod === 'cash') {
    canConfirmPayment = canConfirmPayment && amountReceived !== '' && isAmountSufficient;
  } else if (selectedMethod === 'transfer') {
    canConfirmPayment = canConfirmPayment && selectedTransferOptionId !== null && showAmountInputForTransfer && amountReceived !== '' && isAmountSufficient;
  }

  const enabledTransferOptions = paymentSettings.filter(s => s.type === 'transfer' && s.enabled);
  const selectedTransferOptionDetails = selectedTransferOptionId ? paymentSettings.find(s => s.id === selectedTransferOptionId) : null;

  if (!mounted) {
    return (
      <Card className="shadow-xl flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center text-xl font-headline">
            <ShoppingCart className="mr-2 h-6 w-6 text-primary" />
            Keranjang
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          Memuat pengaturan pembayaran...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-xl font-headline">
          <ShoppingCart className="mr-2 h-6 w-6 text-primary" />
          Keranjang
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        {cartItems.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
            <ShoppingCart className="h-16 w-16 mb-4 text-gray-300" />
            <p>Keranjang belanja kosong.</p>
            <p className="text-sm">Silakan tambahkan produk.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px] sm:max-h-[400px] lg:max-h-[450px]">
            <div className="p-4 space-y-2">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      {cartItems.length > 0 && (
        <CardFooter className="flex flex-col gap-2 p-3 border-t">
          <div className="w-full flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <Separator className="my-1" />
          <div className="w-full flex justify-between text-lg font-semibold text-primary">
            <span>Total:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          
          <Separator className="my-1" />

          <div className="w-full space-y-2">
            <Label className="text-base font-medium">Metode Pembayaran</Label>
            <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethodType)} className="flex gap-3">
              <Label htmlFor="cash-method" className="flex-1 flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/50 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent transition-colors">
                <RadioGroupItem value="cash" id="cash-method" />
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Tunai</span>
              </Label>
              <Label htmlFor="transfer-method" className="flex-1 flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/50 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent transition-colors">
                <RadioGroupItem value="transfer" id="transfer-method" />
                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                <span>Transfer</span>
              </Label>
            </RadioGroup>

            {selectedMethod === 'transfer' && !showAmountInputForTransfer && (
              <div className="pt-2 space-y-2">
                <Label className="text-sm">Pilih Opsi Transfer:</Label>
                {enabledTransferOptions.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {enabledTransferOptions.map(opt => {
                      const Icon = getPaymentMethodIcon(opt.id);
                      return (
                        <Button
                          key={opt.id}
                          variant={selectedTransferOptionId === opt.id ? "default" : "outline"}
                          onClick={() => handleTransferOptionSelect(opt.id)}
                          className="flex items-center justify-start gap-2 w-full text-left h-auto py-2 px-3 text-xs"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{opt.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Tidak ada opsi transfer yang aktif. Aktifkan di Pengaturan Transaksi.</p>
                )}
              </div>
            )}
            
            {selectedMethod === 'transfer' && showAmountInputForTransfer && selectedTransferOptionDetails && (
                <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                            Metode Dipilih: <span className="text-primary">{selectedTransferOptionDetails.name}</span>
                        </p>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                                setShowAmountInputForTransfer(false);
                                setAmountReceived('');
                                setCalculatedChange(0);
                            }}
                            className="p-0 h-auto text-xs text-primary hover:text-primary/80"
                        >
                            <Edit2 className="mr-1 h-3 w-3" /> Ganti
                        </Button>
                    </div>
                    {(selectedTransferOptionDetails.accountNumber || selectedTransferOptionDetails.accountName) && (
                        <div className="text-xs text-muted-foreground p-2 border border-dashed rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                {selectedTransferOptionDetails.accountNumber && <span>No. Rek/ID: <span className="font-semibold text-foreground">{selectedTransferOptionDetails.accountNumber}</span><br/></span>}
                                {selectedTransferOptionDetails.accountName && <span>A/N: <span className="font-semibold text-foreground">{selectedTransferOptionDetails.accountName}</span></span>}
                            </div>
                        </div>
                    )}
                </div>
            )}


            {isAmountInputRequired && (
              <div className="space-y-2 pt-1">
                <div>
                  <Label htmlFor="amountReceivedCart" className="text-sm">Jumlah Uang Diterima (Rp)</Label>
                  <Input
                    id="amountReceivedCart"
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="mt-1 text-base hide-arrows"
                    min="0"
                  />
                </div>
                {parseFloat(amountReceived) >= total && calculatedChange >= 0 && (
                  <div>
                    <Label className="text-sm">Kembalian (Rp)</Label>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {calculatedChange.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
                {amountReceived && parseFloat(amountReceived) < total && (
                   <p className="text-xs text-destructive">
                     Jumlah uang diterima kurang dari total tagihan.
                   </p>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handlePaymentAction}
            className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-base py-3"
            size="lg"
            disabled={!canConfirmPayment}
          >
            Konfirmasi & Bayar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
