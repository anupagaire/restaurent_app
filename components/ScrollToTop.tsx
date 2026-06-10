'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScrollToTop() {
  const router = useRouter();

  useEffect(() => {
    // तुरुन्तै scroll top मा लैजाने
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // अलिकति delay दिएर फेरि check गर्ने (कुनै component ले scroll गरायो कि भनेर)
    const timer1 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 100);

    const timer2 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return null;
}