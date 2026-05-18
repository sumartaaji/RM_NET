
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-200 ease-in-out hover:shadow-xl group relative hover:scale-[1.03]">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-semibold leading-tight mb-1 font-headline group-hover:text-primary transition-colors">
          {product.name}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">{product.category}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-xl font-bold text-primary">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full transition-colors"
          aria-label={`Tambah ${product.name} ke keranjang`}
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Tambah
        </Button>
      </CardFooter>
    </Card>
  );
}
