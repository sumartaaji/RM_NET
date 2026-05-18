
import type { Product, SortOption } from '@/types';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem'; 
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown } from 'lucide-react';
import React from 'react';

interface ProductCatalogProps {
  products: Product[];
  categories: string[];
  searchTerm: string;
  selectedCategory: string;
  sortOption: SortOption;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortOption: SortOption) => void;
  onAddToCart: (product: Product) => void;
  viewMode: 'grid' | 'list';
}

export default function ProductCatalog({
  products,
  categories,
  searchTerm,
  selectedCategory,
  sortOption,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onAddToCart,
  viewMode,
}: ProductCatalogProps) {
  
  const sortedAndFilteredProducts = React.useMemo(() => {
    let tempProducts = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'Semua' || product.category === selectedCategory)
    );

    // Create a new array for sorting to avoid mutating the filtered array directly if products prop is used elsewhere
    let productsToSort = [...tempProducts];

    switch (sortOption) {
      case 'name-asc':
        productsToSort.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        productsToSort.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        productsToSort.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        productsToSort.sort((a, b) => b.price - a.price);
        break;
      case 'default':
      default:
        // No sorting, or return to original order from filter (which depends on original products array order)
        // If original `products` array order is desired for 'default', no sort is needed here.
        break;
    }
    return productsToSort;
  }, [products, searchTerm, selectedCategory, sortOption]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-base"
            aria-label="Search products"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] text-base" aria-label="Pilih kategori">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category} className="text-base">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px] text-base" aria-label="Urutkan produk">
             <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Urutkan berdasarkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default" className="text-base">Urutan Default</SelectItem>
            <SelectItem value="name-asc" className="text-base">Nama (A-Z)</SelectItem>
            <SelectItem value="name-desc" className="text-base">Nama (Z-A)</SelectItem>
            <SelectItem value="price-asc" className="text-base">Harga (Termurah)</SelectItem>
            <SelectItem value="price-desc" className="text-base">Harga (Termahal)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {sortedAndFilteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sortedAndFilteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAndFilteredProducts.map(product => (
              <ProductListItem 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-lg">Produk tidak ditemukan.</p>
          <p>Coba kata kunci atau kategori lain, atau tambahkan produk baru di menu Pengaturan.</p>
        </div>
      )}
    </div>
  );
}
