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
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar user={user} />
      <main className="flex-1 p-8 max-w-2xl">{children}</main>
    </div>
  );
}