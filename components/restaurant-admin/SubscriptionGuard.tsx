
'use client';

import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  // If true, shows a blocked UI instead of redirecting
  showBlockedUI?: boolean;
}

export default function SubscriptionGuard({ children, showBlockedUI = true }: Props) {
  const router = useRouter();
  const { isActive, message, loading } = useSubscription();

 if (loading) {
  return <>{children}</>; 
}

  if (!isActive) {
    if (!showBlockedUI) {
      router.push('/restaurant-admin/subscription');
      return null;
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: '#fef2f2' }}
        >
          <AlertTriangle size={28} style={{ color: '#dc2626' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'secondary', fontFamily: 'Georgia, serif' }}>
          Subscription Required
        </h2>
        <p className="text-sm text-secondary mb-6 max-w-sm">
          {message ?? 'Your subscription is inactive. Please activate or renew your plan to access this feature.'}
        </p>
        <button
          onClick={() => router.push('/restaurant-admin/subscription')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm"
          style={{ background: '#513012', color: '#fff' }}
        >
          Choose a Plan <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return <>{children}</>;
}