
// Sidebar sudah tidak digunakan di sini, semua navigasi ada di page.tsx
// import SettingsSidebar from '@/components/layout/SettingsSidebar';
import Header from '@/components/layout/Header'; // Impor Header

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header /> {/* Tambahkan Header di sini agar tetap konsisten */}
      {/* Kontainer utama sekarang akan lebih sederhana karena sidebar dihilangkan */}
      <div className="flex-1 container mx-auto p-4 md:p-6">
        {/* 
          Sebelumnya ada SettingsSidebar di sini, sekarang tidak ada.
          Main content (children) akan mengambil lebar penuh dari kontainer ini.
        */}
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
