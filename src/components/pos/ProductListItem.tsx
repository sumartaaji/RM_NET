
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductListItemProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductListItem({ product, onAddToCart }: ProductListItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow w-full group">
      <CardContent className="p-3 flex items-center gap-4">
        <div className="flex-grow">
          <h3 className="text-sm font-semibold font-headline group-hover:text-primary transition-colors truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <p className="text-lg font-bold text-primary mt-1">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
           {product.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
            }}
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
