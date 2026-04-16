// app/menu/page.tsx
import { Suspense } from 'react';
import MenuPageContent from '@/components/menu/MenuPageContent';   
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';


export default function MenuPage() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<MenuLoading />}>
        <MenuPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}

// Simple loading component
function MenuLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#513012] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading menu...</p>
      </div>
    </div>
  );
}