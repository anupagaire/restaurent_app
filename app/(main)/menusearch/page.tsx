'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuComparison from '@/components/home/MenuComparision';

function MenuSearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  return (
    <div className="min-h-screen bg-[#fdf8f3] py-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary via-[#3d1a08] to-[#1a0b02] py-10 px-6 text-center">
        <p className="text-accent/60 text-xs font-medium uppercase tracking-widest mb-2">Menu Finder</p>
        <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">
          Compare Dishes Across Restaurants
        </h1>
        <p className="text-accent/60 text-sm">Ranked by rating · Filter by price</p>
      </div>

      {/* Component in full-page mode */}
      <MenuComparison isHomePage={false} initialQuery={q} />
    </div>
  );
}

export default function MenuSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-secondary text-sm">Loading...</p>
        </div>
      </div>
    }>
      <MenuSearchContent />
    </Suspense>
  );
}