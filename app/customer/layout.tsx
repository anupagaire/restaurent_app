'use client';

import { UserProvider } from '@/context/UserContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LayoutInner>{children}</LayoutInner>
    </UserProvider>
  );
}

// Separate inner component so CustomerSidebar can use useUser() inside the provider
function LayoutInner({ children }: { children: React.ReactNode }) {
  // CustomerSidebar calls useUser() itself now — no prop drilling needed
  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#faf8f5' }}>
      <CustomerSidebar />
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 w-full">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}