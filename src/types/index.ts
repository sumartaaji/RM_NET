
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethodType = 'cash' | 'transfer'; // Renamed from PaymentMethod to avoid conflict

export interface PaymentSetting {
  id: string; // e.g., 'cash', 'bca', 'gopay'
  name: string; // e.g., 'Tunai', 'BCA Transfer'
  type: PaymentMethodType;
  enabled: boolean;
  accountNumber?: string;
  accountName?: string;
  // icon?: React.ElementType; // Storing React components directly in JSON/localStorage is problematic. We'll map icons in the UI.
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone?: string;
  storeEmail?: string;
}

export interface UserProfile {
  userName: string;
  userEmail: string;
}

export interface TransactionItem {
  id: string;
  name: string;
  price: number; // price at the time of sale
  quantity: number;
}

export interface Transaction {
  id: string; // Unique ID, can be timestamp
  dateTime: string; // ISO string
  items: TransactionItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType; // Updated to use PaymentMethodType
  transferOptionId?: string; // Stores the ID of the selected PaymentSetting if type is 'transfer'
  transferOptionName?: string; // Stores the name of the selected transfer option for display
  transactionNumber: string;
  amountPaid?: number; // Jumlah uang yang dibayarkan pelanggan
  changeGiven?: number; // Jumlah kembalian
}

export type SortOption = 
  | 'default' 
  | 'name-asc' 
  | 'name-desc' 
  | 'price-asc' 
  | 'price-desc';

// Previous TransferOption type is no longer needed as it's covered by PaymentSetting.id
// export type TransferOption = 'shopeepay' | 'gopay' | 'ovo' | 'bca' | 'seabank' | 'qris' | null;
