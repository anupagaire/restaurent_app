'use client';

import { useState, useEffect } from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { apiFetch } from '@/lib/api';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({ first_name: '', last_name: '', email: '' });

  useEffect(() => {
    apiFetch('/api/v1/user/me/')
      .then(r => r.json())
      .then(data => {
        setUser({
          first_name: data.first_name || '',
          last_name:  data.last_name  || '',
          email:      data.email      || '',
        });
        const access  = localStorage.getItem('access_token')  || '';
        const refresh = localStorage.getItem('refresh_token') || '';
        if (access && data.email) {
          localStorage.setItem(
            'qr_menu_auth',
            JSON.stringify({ access, refresh, email: data.email }),
          );
        }
      })
      .catch(() => {
        // Token expired or invalid → redirect to login
        window.location.href = '/login';
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#faf8f5' }}>
      <CustomerSidebar user={user} />

      {/* Main content — add bottom padding on mobile so content clears the bottom nav */}
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 w-full">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}