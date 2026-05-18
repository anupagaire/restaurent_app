'use client';

import { useState, useEffect } from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { apiFetch } from '@/lib/api';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({ first_name: '', last_name: '', email: '' });

  useEffect(() => {
    apiFetch('/api/v1/user/me/')
      .then(r => r.json())
      .then(data => setUser(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <CustomerSidebar user={user} />
      <main className="flex-1 p-6 md:p-8 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}