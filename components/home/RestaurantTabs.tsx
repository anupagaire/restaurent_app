'use client';

import { useState } from 'react';
import MenuSection from '@/components/menu/MenuSection';
import ReviewSection from '@/components/home/ReviewSection';

interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category?: string;
}

interface Props {
  menuItems: MenuItem[];
  restaurantId: number;
  reviewCount?: number;
}

export default function RestaurantTabs({ menuItems, restaurantId, reviewCount = 0 }: Props) {
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');

  return (
    <div>
      
      <div style={{
        display: 'flex',
        gap: 0,
        background: '#fff',
        borderRadius: 14,
        padding: 4,
        border: '1px solid #eee',
        marginBottom: 24,
      }}>
        {(['menu', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '11px 16px',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              background: activeTab === tab ? '#513012' : 'transparent',
              color: activeTab === tab ? '#fff' : '#888',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'menu' ? `Menu (${menuItems.length})` : `Reviews${reviewCount > 0 ? ` (${reviewCount})` : ''}`}
          </button>
        ))}
      </div>

    
      {activeTab === 'menu' ? (
        menuItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', marginTop: 60, fontSize: 16 }}>
            No menu items available yet.
          </p>
        ) : (
          <MenuSection 
          menuItems={menuItems}
           restaurantId={restaurantId}
          acceptsOnlineOrders={true} />
        )
      ) : (
        <ReviewSection restaurantId={restaurantId} />
      )}
    </div>
  );
}