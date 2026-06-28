'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

interface SubStatus {
  is_active: boolean;
  message: string | null;
  current_subscription: {
    id: number;
    status: string;
    end_date: string;
    plan: { name: string };
  } | null;
  latest_subscription: {
    id: number;
    status: string;
  } | null;
}

// Cache so we don't fetch on every page load
let cache: SubStatus | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export function useSubscription() {
  const [data, setData] = useState<SubStatus | null>(cache);
  const [loading, setLoading] = useState(!cache);

  const fetch_ = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cache && now - cacheTime < CACHE_TTL) {
      setData(cache);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // const token = localStorage.getItem('access_token') ?? '';
      const res = await apiFetch('/api/v1/subscription/subscriptions/current/');
const json = await res.json();
cache = json;
cacheTime = Date.now();
setData(json);
    } catch {
      // silent fail — treat as inactive
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return {
    isActive: data?.is_active ?? false,
    message: data?.message,
    currentSub: data?.current_subscription,
    latestSub: data?.latest_subscription,
    loading,
    refresh: () => fetch_(true),
  };
}

// Call this to clear cache after payment submitted
export function clearSubscriptionCache() {
  cache = null;
  cacheTime = 0;
}