// lib/subscription-api.ts

import { apiFetch } from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── JSON requests — reuses apiFetch (handles auth + token refresh) ───────────

async function apiJSON<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init); // apiFetch returns raw Response
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.detail ?? data?.errors?.detail ?? data?.message ?? JSON.stringify(data),
    );
  }
  return data as T;
}

// ─── Multipart/FormData — apiFetch handles this too (detects FormData body) ───

async function apiForm<T>(path: string, body: FormData): Promise<T> {
  // apiFetch already skips Content-Type for FormData — pass it straight through
  const res = await apiFetch(path, { method: 'POST', body });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.detail ?? data?.errors?.detail ?? data?.message ?? JSON.stringify(data),
    );
  }
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Plan {
  id: number;
  created_on: string;
  updated_on: string;
  code: 'free_trial' | string;
  name: string;
  description: string;
  price: string;
  duration_days: number;
  features: string | Record<string, any>;
  limits: string | Record<string, any>;
  is_trial: boolean;
  is_active: boolean;
  ordering: number;
}

export interface PromoCode {
  id: number;
  created_on: string;
  updated_on: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  valid_from: string;
  valid_until: string;
  max_usage: number;
  used_count: number;
  active: boolean;
  one_time_per_user: boolean;
  stackable: boolean;
  applicable_plans: number[];
  applicable_restaurants: number[];
}

export interface PromoValidateResult {
  valid: boolean;
  code: string;
  discount_amount: string;
  final_amount: string;
  extension_days: number;
  full_free_access: boolean;
}

export interface PaymentRequest {
  id: number;
  restaurant: number;
  plan: number;
  plan_detail: Plan;
  promo_code: number | null;
  status: 'pending' | 'approved' | 'rejected';
  amount: string;
  discount_amount: string;
  final_amount: string;
  payment_instructions: any;
  transaction_reference: string;
  payment_note: string;
  proof_image_url: string;
  uploaded_by: number;
  uploaded_at: string;
  verified_by: number | null;
  verified_at: string | null;
  admin_notes: string;
  created_on: string;
  updated_on: string;
}

export interface Subscription {
  id: number;
  restaurant: number;
  plan: Plan;
  status: 'trialing' | 'active' | 'expired' | 'cancelled' | 'pending';
  start_date: string;
  end_date: string;
  activated_by: number | null;
  source: 'trial' | 'manual' | 'promo';
  payment_request: number | null;
  promo_code: number | null;
  notes: string;
  is_currently_active: boolean;
  created_on: string;
  updated_on: string;
}

export interface CurrentSubscription {
  is_active: boolean;
  message: string;
  current_subscription: Subscription | null;
  latest_subscription: Subscription | null;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Plans API ────────────────────────────────────────────────────────────────

export const plansApi = {
  list: (params?: string) =>
    apiJSON<PaginatedResult<Plan>>(`/api/v1/subscription/plans/${params ? '?' + params : ''}`),

  get: (id: number) =>
    apiJSON<Plan>(`/api/v1/subscription/plans/${id}/`),

  create: (body: Partial<Plan>) =>
    apiJSON<Plan>('/api/v1/subscription/plans/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<Plan>) =>
    apiJSON<Plan>(`/api/v1/subscription/plans/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: (id: number, body: Partial<Plan>) =>
    apiJSON<Plan>(`/api/v1/subscription/plans/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    apiJSON<void>(`/api/v1/subscription/plans/${id}/`, { method: 'DELETE' }),
};

// ─── Promos API ───────────────────────────────────────────────────────────────

export const promosApi = {
  list: (params?: string) =>
    apiJSON<PaginatedResult<PromoCode>>(`/api/v1/subscription/promos/${params ? '?' + params : ''}`),

  available: () =>
    apiJSON<PaginatedResult<PromoCode>>('/api/v1/subscription/promos/available/'),

  get: (id: number) =>
    apiJSON<PromoCode>(`/api/v1/subscription/promos/${id}/`),

  create: (body: Partial<PromoCode>) =>
    apiJSON<PromoCode>('/api/v1/subscription/promos/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<PromoCode>) =>
    apiJSON<PromoCode>(`/api/v1/subscription/promos/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: (id: number, body: Partial<PromoCode>) =>
    apiJSON<PromoCode>(`/api/v1/subscription/promos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    apiJSON<void>(`/api/v1/subscription/promos/${id}/`, { method: 'DELETE' }),

  validate: (code: string, plan: number) =>
    apiJSON<PromoValidateResult>('/api/v1/subscription/promos/validate/', {
      method: 'POST',
      body: JSON.stringify({ code, plan }),
    }),

  apply: (code: string, plan: number) =>
    apiJSON<PromoValidateResult>('/api/v1/subscription/promos/apply/', {
      method: 'POST',
      body: JSON.stringify({ code, plan }),
    }),
};

// ─── Subscriptions API ────────────────────────────────────────────────────────

export const subscriptionsApi = {
  current: () =>
    apiJSON<CurrentSubscription>('/api/v1/subscription/subscriptions/current/'),

  history: (params?: string) =>
    apiJSON<PaginatedResult<Subscription>>(
      `/api/v1/subscription/subscriptions/history/${params ? '?' + params : ''}`,
    ),
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export const paymentsApi = {
  /** Step 1: Create payment request — JSON body */
  create: (body: {
    plan: number;
    promo_code?: string;
    transaction_reference?: string;
    payment_note?: string;
  }) =>
    apiJSON<PaymentRequest>('/api/v1/subscription/payments/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Step 2: Upload proof image — multipart FormData */
  uploadProof: (paymentId: number, fd: FormData) =>
    apiForm<PaymentRequest>(`/api/v1/subscription/payments/${paymentId}/upload_proof/`, fd),

  /** Check payment status */
  status: () =>
    apiJSON<PaginatedResult<PaymentRequest>>('/api/v1/subscription/payments/status/'),
};