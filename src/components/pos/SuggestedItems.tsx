
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, PlusCircle } from 'lucide-react';

interface SuggestedItemsProps {
  suggestedProductObjects: Product[];
  onAddToCart: (product: Product) => void;
  isLoading: boolean;
}

export default function SuggestedItems({ suggestedProductObjects, onAddToCart, isLoading }: SuggestedItemsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-headline">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
            Saran Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestedProductObjects || suggestedProductObjects.length === 0) {
    return null; 
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-headline">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          Saran Produk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestedProductObjects.map(product => (
            <div key={product.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors">
              <div className="flex-grow">
                <p className="text-sm font-medium leading-tight">{product.name}</p>
                <p className="text-xs text-primary">Rp {product.price.toLocaleString('id-ID')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddToCart(product)}
                aria-label={`Tambah ${product.name} ke keranjang`}
                className="shrink-0"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
