// components/menu/MenuPageContent.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { menuCategories, menuItems } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function MenuPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'All');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = 
        activeCategory === 'All' || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#513012] mb-4">Our Menu</h1>
          <p className="text-gray-600 text-lg">Discover our signature dishes</p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <Input
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-lg py-6"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <Button
            variant={activeCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('All')}
            className="rounded-full"
          >
            All
          </Button>
          {menuCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.name ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat.name)}
              className="rounded-full"
            >
              {cat.icon} {cat.name}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-lg font-bold text-[#513012]">Rs. {item.price}</p>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex gap-2">
                  {item.isVeg ? (
                    <Badge className="bg-green-100 text-green-700">Veg</Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700">Non-Veg</Badge>
                  )}
                  {item.isPopular && (
                    <Badge className="bg-red-100 text-red-700">Popular</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}