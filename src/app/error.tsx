
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h2 className="text-2xl font-semibold mb-4">Terjadi Kesalahan!</h2>
      <p className="text-muted-foreground mb-8">Maaf, terjadi kesalahan yang tidak terduga saat memproses halaman ini.</p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Coba Lagi</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>Kembali ke Beranda</Button>
      </div>
    </div>
  );
}
