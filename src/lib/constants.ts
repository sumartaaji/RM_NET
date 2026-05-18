
import type { Product, PaymentSetting } from '@/types';
import { Landmark, QrCode, ShoppingBag, Wallet, DollarSign, CreditCard as CreditCardIcon, RotateCcw, Package, Settings, User, Palette, History, ImageIcon, ReceiptText, Printer, BarChart2, AlertTriangle, ArrowUpCircle } from 'lucide-react';

export const PRODUCTS_STORAGE_KEY = 'posProducts';
export const CATEGORIES_STORAGE_KEY = 'posCategories';
export const TRANSACTIONS_STORAGE_KEY = 'posTransactions';
export const LOGO_STORAGE_KEY = 'appLogo';
export const PAYMENT_SETTINGS_STORAGE_KEY = 'posPaymentSettings';
export const CART_STORAGE_KEY = 'posCartItems';
export const STORE_SETTINGS_KEY = 'storeSettings';
export const PROFILE_SETTINGS_KEY = 'userProfileSettings'; // Tetap ada jika masih digunakan untuk profil pengguna
export const THEME_KEY = 'theme';
export const AUTH_STORAGE_KEY = 'appIsLoggedIn';
export const PIN_STORAGE_KEY = 'appPin';
export const FAILED_LOGIN_ATTEMPTS_KEY = 'failedLoginAttempts';
export const LOCKOUT_UNTIL_KEY = 'lockoutUntil';


export const DEFAULT_STORE_NAME = 'RM_NET Cashier';
export const DEFAULT_PIN = '1234'; // PIN default 4 angka


export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Pulpen Gel Hitam', price: 3500, category: 'Alat Tulis', description: 'Pulpen gel tinta hitam, nyaman ditulis.' },
  { id: '2', name: 'Buku Tulis Hardcover A5', price: 12000, category: 'Buku', description: 'Buku tulis A5 dengan sampul keras.' },
  { id: '3', name: 'Pensil Mekanik 0.5mm', price: 7000, category: 'Alat Tulis', description: 'Pensil mekanik plus isi.' },
  { id: '4', name: 'Penghapus Ujian Steadler', price: 2500, category: 'Alat Tulis', description: 'Penghapus khusus ujian, bersih.' },
  { id: '5', name: 'Penggaris Besi 30cm', price: 5000, category: 'Alat Ukur', description: 'Penggaris besi anti karat 30cm.' },
  { id: '6', name: 'Kertas HVS A4 80gsm (Rim)', price: 55000, category: 'Kertas', description: '1 Rim Kertas HVS A4 80gsm premium.' },
  { id: '7', name: 'Stabilo Set 4 Warna', price: 25000, category: 'Alat Tulis', description: 'Set stabilo 4 warna pastel.' },
  { id: '8', name: 'Spidol Permanen Hitam', price: 6000, category: 'Alat Tulis', description: 'Spidol permanen warna hitam.' },
  { id: '9', name: 'Lem Stik UHU', price: 4000, category: 'Perekat', description: 'Lem stik UHU ukuran sedang.' },
  { id: '10', name: 'Cutter Kecil SDI', price: 8000, category: 'Alat Potong', description: 'Cutter kecil SDI, tajam dan aman.' },
  { id: '11', name: 'Map Kancing Plastik', price: 3000, category: 'Penyimpanan', description: 'Map plastik dengan kancing.' },
  { id: '12', name: 'Sticky Notes Post-it', price: 9000, category: 'Catatan', description: 'Sticky notes Post-it warna warni.' },
];

export const DEFAULT_CATEGORIES = ['Alat Tulis', 'Buku', 'Alat Ukur', 'Kertas', 'Perekat', 'Alat Potong', 'Penyimpanan', 'Catatan'];

export const DEFAULT_PAYMENT_SETTINGS: PaymentSetting[] = [
  { id: 'cash', name: 'Tunai', type: 'cash', enabled: true },
  { id: 'bca', name: 'BCA', type: 'transfer', enabled: true, accountNumber: '', accountName: '' },
  { id: 'gopay', name: 'GoPay', type: 'transfer', enabled: true, accountNumber: '', accountName: '' },
  { id: 'ovo', name: 'OVO', type: 'transfer', enabled: true, accountNumber: '', accountName: '' },
  { id: 'shopeepay', name: 'ShopeePay', type: 'transfer', enabled: true, accountNumber: '', accountName: '' },
  { id: 'seabank', name: 'SeaBank', type: 'transfer', enabled: true, accountNumber: '', accountName: '' },
  { id: 'qris', name: 'QRIS', type: 'transfer', enabled: true, accountNumber: '', accountName: '' },
];

export const PAYMENT_METHOD_ICONS: Record<string, React.ElementType> = {
  cash: DollarSign,
  bca: Landmark,
  gopay: Wallet,
  ovo: Wallet,
  shopeepay: ShoppingBag,
  seabank: Landmark,
  qris: QrCode,
  default: CreditCardIcon
};

export const getPaymentMethodIcon = (id: string): React.ElementType => {
  return PAYMENT_METHOD_ICONS[id] || PAYMENT_METHOD_ICONS.default;
};

export const SETTINGS_NAV_ICONS = {
  User, // Untuk Profil & Toko
  Palette, // Untuk Tampilan & Logo
  Package, // Untuk Produk & Kategori
  Printer, // Untuk Transaksi, Struk & Printer
  BarChart2, // Untuk Laporan & Data
  History, // Untuk Riwayat Transaksi
  RotateCcw, // Untuk Backup, Restore & Reset
};

