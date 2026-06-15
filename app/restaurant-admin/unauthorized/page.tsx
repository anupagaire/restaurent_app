'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-6">🚫</div>
      <h1 className="text-2xl font-bold text-secondary mb-3">Access Denied</h1>
      <p className="text-secondary mb-6">
        You don't have permission to access this page.
        Please contact your administrator.
      </p>
      <Link
        href="/restaurant-admin"
        className="px-6 py-3 rounded-xl font-semibold text-white"
        style={{ background: '#513012' }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}