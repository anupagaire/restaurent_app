'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Star, Send, Loader2, ChevronLeft, X,
  LogIn, CheckCircle2, Camera, CornerDownRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG  (reuse same env var as MenuSection)
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const AUTH_KEY = 'qr_menu_auth';

const MAX_DEPTH = 3;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface AuthData {
  access: string;
  refresh: string;
  email: string;
}

interface ReviewUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

interface ReviewPhoto {
  id: number;
  object_id: number;
  photo_url: string;
}

interface MenuReview {
  id: number;
  menu: number;
  restaurant: number;
  parent: number | null;
  user: ReviewUser | null;
  rating: number;
  review: string;
  is_published: boolean;
  photos: ReviewPhoto[];
  created_on: string;
}

export interface MenuReviewSectionProps {
  menuId: number;
  menuName: string;
  restaurantId: number;
  /** Pass this if you want the drawer/back-button variant */
  onClose?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS  (same as MenuSection — shared localStorage key)
// ─────────────────────────────────────────────────────────────────────────────
function getAuth(): AuthData | null {
  try {
    const s = localStorage.getItem(AUTH_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function saveAuth(d: AuthData) { localStorage.setItem(AUTH_KEY, JSON.stringify(d)); }
function clearAuth() { localStorage.removeItem(AUTH_KEY); }

/** Use the refresh token to get a new access token. */
async function apiRefreshToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/v1/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json();
  if (!data.access) throw new Error('No access token in refresh response');
  return data.access;
}

/**
 * Returns a guaranteed-fresh access token.
 * - Tries the stored access token first (optimistic).
 * - On 401, silently refreshes using the refresh token and saves the new auth.
 * - If refresh also fails, clears auth and throws so the UI can show the login gate.
 *
 * Usage:
 *   const { token, auth: freshAuth } = await getValidToken();
 *   // then use token for the request, and if freshAuth differs, call setAuth(freshAuth)
 */
async function getValidToken(): Promise<{ token: string; auth: AuthData }> {
  const auth = getAuth();
  if (!auth) throw new Error('Not logged in');
  // Optimistically return the stored token; caller catches 401 and calls refreshAndRetry
  return { token: auth.access, auth };
}

/**
 * Try fn(token). If it throws a 401-like error, refresh and retry once.
 * Updates localStorage and returns the fresh AuthData so the component can setAuth().
 */
async function withTokenRefresh<T>(
  fn: (token: string) => Promise<T>,
): Promise<{ result: T; freshAuth: AuthData }> {
  const auth = getAuth();
  if (!auth) throw new Error('Not logged in');

  try {
    const result = await fn(auth.access);
    return { result, freshAuth: auth };
  } catch (err: unknown) {
    // Only refresh on 401
    const msg = err instanceof Error ? err.message : '';
    if (!msg.includes('401')) throw err;

    // Attempt refresh
    let newAccess: string;
    try {
      newAccess = await apiRefreshToken(auth.refresh);
    } catch {
      clearAuth();
      throw new Error('Your session has expired. Please log in again.');
    }

    const freshAuth: AuthData = { ...auth, access: newAccess };
    saveAuth(freshAuth);

    // Retry the original request with the new token
    const result = await fn(newAccess);
    return { result, freshAuth };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────
async function apiRegister(params: {
  email: string; password: string; name: string;
  phone: string | null; restaurantId: number;
}) {
  const res = await fetch(`${BASE_URL}/api/v1/user/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email.trim(),
      password1: params.password,
      password2: params.password,
      first_name: params.name.trim() || 'Guest',
      contact_no: params.phone || null,
      role: 'customer',
      restaurant: params.restaurantId,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Registration failed (${res.status})`;
    try {
      const err = JSON.parse(text);
      if (err.email) msg = Array.isArray(err.email) ? err.email[0] : err.email;
      else if (err.password1) msg = Array.isArray(err.password1) ? err.password1[0] : err.password1;
      else if (err.detail) msg = err.detail;
      else msg = JSON.stringify(err).slice(0, 200);
    } catch { /* keep default */ }
    throw new Error(msg);
  }
}

async function apiLogin(email: string, password: string): Promise<AuthData> {
  const res = await fetch(`${BASE_URL}/api/v1/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Login failed (${res.status})`;
    try {
      const err = JSON.parse(text);
      msg = err.detail || err.non_field_errors?.[0] || msg;
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  const data = JSON.parse(text);
  if (!data.access) throw new Error('Login response did not contain an access token.');
  return { access: data.access, refresh: data.refresh, email };
}

async function apiFetchMenuReviews(menuId: number): Promise<MenuReview[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/menu-reviews/?menu=${menuId}&ordering=-created_on&page_size=200`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []) as MenuReview[];
  } catch { return []; }
}

async function apiPostMenuReview(
  payload: {
    menu: number;
    restaurant: number;
    parent?: number | null;
    rating: number;
    review: string;
    is_published: boolean;
  },
  accessToken: string,
): Promise<MenuReview> {
  const res = await fetch(`${BASE_URL}/api/v1/menu-reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    // Always include the HTTP status so withTokenRefresh can detect 401
    let msg = `Failed to submit review (${res.status})`;
    try {
      const err = JSON.parse(text);
      const detail = err.detail || err.non_field_errors?.[0];
      if (detail) msg = `${detail} (${res.status})`;
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  return JSON.parse(text) as MenuReview;
}

const PHOTO_TYPE_CANDIDATES = ['menu_review', 'review', 'menu'];

// Try uploading with auth token first, then without — log exact server error each time
async function apiUploadPhoto(reviewId: number, file: File, accessToken?: string): Promise<void> {
  for (const type of PHOTO_TYPE_CANDIDATES) {
    // Attempt 1: with auth token (required for menu_review type)
    if (accessToken) {
      const fd1 = new FormData();
      fd1.append('type', type);
      fd1.append('object_id', String(reviewId));
      fd1.append('photo', file);
      const r1 = await fetch(`${BASE_URL}/api/v1/photo/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd1,
      });
      if (r1.ok) { console.log(`✅ Photo uploaded with auth, type="${type}"`); return; }
      const e1 = await r1.text().catch(() => '');
      console.warn(`[photo] WITH auth, type="${type}", status=${r1.status}, body:`, e1);
    }

    // Attempt 2: without auth token
    const fd2 = new FormData();
    fd2.append('type', type);
    fd2.append('object_id', String(reviewId));
    fd2.append('photo', file);
    const r2 = await fetch(`${BASE_URL}/api/v1/photo/`, {
      method: 'POST',
      body: fd2,
    });
    if (r2.ok) { console.log(`✅ Photo uploaded without auth, type="${type}"`); return; }
    const e2 = await r2.text().catch(() => '');
    console.warn(`[photo] WITHOUT auth, type="${type}", status=${r2.status}, body:`, e2);
  }

  console.warn('❌ All photo upload attempts exhausted for review', reviewId);
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function calcAvg(reviews: MenuReview[]): number | null {
  const top = reviews.filter(r => r.parent === null || r.parent === undefined);
  if (!top.length) return null;
  return top.reduce((s, r) => s + r.rating, 0) / top.length;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getDisplayName(review: MenuReview): string {
  if (review.user?.first_name) {
    return `${review.user.first_name} ${review.user.last_name ?? ''}`.trim();
  }
  return review.user?.email?.split('@')[0] ?? 'Guest';
}

function getInitials(review: MenuReview): string {
  const name = getDisplayName(review);
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function resolvePhotoUrl(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR DISPLAY
// ─────────────────────────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={rating >= s ? '#f59e0b' : 'none'}
          color={rating >= s ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR PICKER
// ─────────────────────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        >
          <Star
            size={30}
            fill={(hovered || value) >= star ? '#f59e0b' : 'none'}
            color={(hovered || value) >= star ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ review, size = 38 }: { review: MenuReview; size?: number }) {
  if (review.user?.avatar) {
    return (
      <img
        src={resolvePhotoUrl(review.user.avatar)}
        alt={getDisplayName(review)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: '#513012', color: '#fdf6ec',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.34, fontWeight: 700, flexShrink: 0,
      }}
    >
      {getInitials(review)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GATE (inline mini login / register for reviews)
// ─────────────────────────────────────────────────────────────────────────────
interface AuthGateProps {
  restaurantId: number;
  onAuthenticated: (auth: AuthData) => void;
  onAlreadyLoggedIn: (auth: AuthData) => void;
}

function AuthGate({ restaurantId, onAuthenticated, onAlreadyLoggedIn }: AuthGateProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'registering' | 'logging_in'>('idle');

  // Check localStorage on mount
  useEffect(() => {
    const existing = getAuth();
    if (existing) onAlreadyLoggedIn(existing);
  }, [onAlreadyLoggedIn]);

  const canSubmitRegister =
    email.trim().length > 0 && password.length >= 8 && password === confirmPassword;
  const canSubmitLogin =
    email.trim().length > 0 && password.length >= 6;

  const handleRegister = async () => {
    if (!canSubmitRegister) return;
    setError('');
    setLoading(true);
    try {
      setStep('registering');
      await apiRegister({ email, password, name: name.trim() || 'Guest', phone: null, restaurantId });
      setStep('logging_in');
      const auth = await apiLogin(email, password);
      saveAuth(auth);
      onAuthenticated(auth);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  const handleLogin = async () => {
    if (!canSubmitLogin) return;
    setError('');
    setLoading(true);
    try {
      setStep('logging_in');
      const auth = await apiLogin(email, password);
      saveAuth(auth);
      onAuthenticated(auth);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(184,147,106,0.35)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    color: '#1e0f02',
    background: '#fdf6ec',
  };

  const stepLabel =
    step === 'registering' ? 'Creating account…'
    : step === 'logging_in' ? 'Logging in…'
    : mode === 'register' ? 'Create account & review'
    : 'Log in & review';

  return (
    <div
      style={{
        background: '#fffbf5',
        border: '1px solid rgba(184,147,106,0.35)',
        borderRadius: 16,
        padding: '20px 20px',
        marginBottom: 28,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <LogIn size={15} color="#513012" />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#513012', margin: 0 }}>
          Sign in to leave a review
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        {(['register', 'login'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #513012',
              background: mode === m ? '#513012' : 'transparent',
              color: mode === m ? '#fdf6ec' : '#513012',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {m === 'register' ? 'New account' : 'I have an account'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mode === 'register' && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            style={inputBase}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="Email *"
          style={inputBase}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder={mode === 'register' ? 'Password (min 8 chars) *' : 'Password *'}
          style={inputBase}
        />
        {mode === 'register' && (
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Confirm password *"
              style={{
                ...inputBase,
                ...(confirmPassword && password !== confirmPassword
                  ? { borderColor: 'rgba(192,57,43,0.5)' }
                  : {}),
              }}
            />
            {confirmPassword && password !== confirmPassword && (
              <p style={{ fontSize: 11, color: '#c0392b', marginTop: 3 }}>Passwords don't match</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: 13, marginTop: 8 }}>{error}</p>
      )}

      <button
        onClick={mode === 'register' ? handleRegister : handleLogin}
        disabled={loading || (mode === 'register' ? !canSubmitRegister : !canSubmitLogin)}
        style={{
          marginTop: 14,
          width: '100%',
          padding: '10px 0',
          background: loading ? '#b8936a' : '#513012',
          color: '#fdf6ec',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? <><Loader2 size={14} className="animate-spin" /> {stepLabel}</> : stepLabel}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW CARD  (with nested replies, same pattern as ReviewSection)
// ─────────────────────────────────────────────────────────────────────────────
function MenuReviewCard({
  review,
  allReviews,
  menuId,
  restaurantId,
  depth,
  auth,
  onReplyPosted,
}: {
  review: MenuReview;
  allReviews: MenuReview[];
  menuId: number;
  restaurantId: number;
  depth: number;
  auth: AuthData | null;
  onReplyPosted: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyPhotos, setReplyPhotos] = useState<File[]>([]);
  const [replyPreviews, setReplyPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const directReplies = allReviews.filter(
    (r) => Number(r.parent) === Number(review.id),
  );

  const handleReply = async () => {
    if (!auth) { setError('You must be logged in to reply.'); return; }
    if (!replyText.trim()) { setError('Please write something.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        menu: menuId,
        restaurant: restaurantId,
        parent: review.id,
        rating: 5,  // replies don't need a meaningful rating
        review: replyText.trim(),
        is_published: true,
      };
      const { result: created, freshAuth } = await withTokenRefresh(
        (token) => apiPostMenuReview(payload, token),
      );
      // Token may have been refreshed — upload photos with fresh token
      for (const file of replyPhotos) {
        await apiUploadPhoto(created.id, file, freshAuth.access);
      }
      setReplyText('');
      setReplyPhotos([]);
      setReplyPreviews([]);
      setReplyOpen(false);
      onReplyPosted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Try again.';
      setError(msg.includes('session has expired') ? 'Session expired — please refresh the page.' : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setReplyPhotos(files);
    setReplyPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const indentLeft = Math.min(depth * 20, 60);

  return (
    <div style={{ marginLeft: indentLeft, marginBottom: 12 }}>
      <div
        style={{
          background: depth === 0 ? '#fff' : '#FBF8F5',
          border: '1px solid #eee',
          borderLeft: depth > 0 ? '3px solid #b8936a' : '1px solid #eee',
          borderRadius: 12,
          padding: '14px 18px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Avatar review={review} size={depth === 0 ? 38 : 30} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e0f02', margin: 0 }}>
              {getDisplayName(review)}
            </p>
            <p style={{ fontSize: 11, color: '#9a7458', margin: 0 }}>
              {formatDate(review.created_on)}
            </p>
          </div>
          {depth === 0 && (
            <StarDisplay rating={review.rating} size={13} />
          )}
        </div>

        {/* Text */}
        {review.review && (
          <p style={{ fontSize: 14, color: '#4a3728', lineHeight: 1.65, margin: 0 }}>
            {review.review}
          </p>
        )}

        {/* Photos */}
        {review.photos?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {review.photos.map((p) => (
              <img
                key={p.id}
                src={resolvePhotoUrl(p.photo_url)}
                alt="review photo"
                style={{
                  width: 80, height: 80, objectFit: 'cover',
                  borderRadius: 8, border: '1px solid #eee',
                }}
              />
            ))}
          </div>
        )}

        {/* Reply toggle */}
        {auth && depth < MAX_DEPTH && (
          <button
            onClick={() => { setReplyOpen(!replyOpen); setReplyText(''); setError(''); }}
            style={{
              marginTop: 10, background: 'none', border: 'none',
              color: '#513012', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', padding: 0,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            {replyOpen ? (
              <><X size={11} /> Cancel</>
            ) : (
              <><CornerDownRight size={11} /> Reply</>
            )}
          </button>
        )}

        {/* Reply form */}
        {replyOpen && (
          <div style={{ marginTop: 10 }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid rgba(184,147,106,0.35)',
                fontSize: 13, resize: 'vertical', fontFamily: 'inherit',
                outline: 'none', color: '#1e0f02', background: '#fdf6ec',
              }}
            />
            <label
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: '#9a7458', cursor: 'pointer',
                marginTop: 6, border: '1px dashed #ccc', borderRadius: 6,
                padding: '5px 10px',
              }}
            >
              <Camera size={12} /> Add photos
              <input
                type="file" accept="image/*" multiple
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </label>
            {replyPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {replyPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                    <button
                      onClick={() => {
                        setReplyPhotos((p) => p.filter((_, j) => j !== i));
                        setReplyPreviews((p) => p.filter((_, j) => j !== i));
                      }}
                      style={{
                        position: 'absolute', top: -5, right: -5,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#513012', color: '#fff', border: 'none',
                        cursor: 'pointer', fontSize: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            {error && (
              <p style={{ color: '#c0392b', fontSize: 12, marginTop: 4 }}>{error}</p>
            )}
            <button
              onClick={handleReply}
              disabled={submitting}
              style={{
                marginTop: 8, padding: '7px 18px',
                background: submitting ? '#b8936a' : '#513012',
                color: '#fdf6ec', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {submitting ? <><Loader2 size={12} className="animate-spin" /> Posting…</> : 'Post reply'}
            </button>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {directReplies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {directReplies.map((reply) => (
            <MenuReviewCard
              key={reply.id}
              review={reply}
              allReviews={allReviews}
              menuId={menuId}
              restaurantId={restaurantId}
              depth={depth + 1}
              auth={auth}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuReviewSection({
  menuId,
  menuName,
  restaurantId,
  onClose,
}: MenuReviewSectionProps) {
  const [reviews, setReviews] = useState<MenuReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Auth
  const [auth, setAuth] = useState<AuthData | null>(null);

  // New review form
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ── Load auth from localStorage on mount, and proactively refresh the token
  // so it is always fresh before the user tries to submit a review.
  useEffect(() => {
    const stored = getAuth();
    if (!stored) return;
    setAuth(stored);

    apiRefreshToken(stored.refresh)
      .then((newAccess) => {
        if (newAccess !== stored.access) {
          const fresh: AuthData = { ...stored, access: newAccess };
          saveAuth(fresh);
          setAuth(fresh);
        }
      })
      .catch(() => {
        // Refresh token also expired — clear auth so the login gate shows
        clearAuth();
        setAuth(null);
      });
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const data = await apiFetchMenuReviews(menuId);
    setReviews(data);
    setLoading(false);
  }, [menuId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const topLevel = reviews.filter((r) => r.parent === null || r.parent === undefined);
  const avg = calcAvg(reviews);
  const visibleTopLevel = showAll ? topLevel : topLevel.slice(0, 5);

  // ── Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // ── Submit review (with automatic token refresh on 401)
  const handleSubmit = async () => {
    if (!auth) { setError('Please sign in first.'); return; }
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (!reviewText.trim()) { setError('Please write a review.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        menu: menuId,
        restaurant: restaurantId,
        rating,
        review: reviewText.trim(),
        is_published: true,
      };
      const { result: created, freshAuth } = await withTokenRefresh(
        (token) => apiPostMenuReview(payload, token),
      );
      if (freshAuth.access !== auth.access) setAuth(freshAuth);

      for (const file of photos) {
        await apiUploadPhoto(created.id, file, freshAuth.access);
      }
      setSubmitted(true);
      setRating(0);
      setReviewText('');
      setPhotos([]);
      setPhotoPreviews([]);
      await fetchReviews();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      if (msg.includes('session has expired') || msg.includes('Not logged in')) {
        setAuth(null);
        setError('Your session expired. Please log in again.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Styles
  const isDrawer = !!onClose;
  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(184,147,106,0.35)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    color: '#1e0f02',
    background: '#fdf6ec',
  };

  const content = (
    <div
      style={{
        ...(isDrawer
          ? { padding: '0 20px 80px', maxWidth: 680, margin: '0 auto' }
          : { marginTop: 48 }),
      }}
    >
      {isDrawer && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 0' }}>
            <div>
              <button
                onClick={onClose}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9a7458', fontSize: 12, padding: 0, marginBottom: 6,
                }}
              >
                <ChevronLeft size={14} /> Back to menu
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e0f02', fontFamily: 'Georgia, serif', margin: 0 }}>
                {menuName}
              </h2>
            </div>
            <button onClick={onClose} style={{ color: '#9a7458', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
          <hr style={{ borderColor: 'rgba(184,147,106,0.25)', marginBottom: 20 }} />
        </>
      )}

      {/* ── Section title (inline mode) */}
      {!isDrawer && (
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#513012', marginBottom: 20 }}>
          Reviews {topLevel.length > 0 && `(${topLevel.length})`}
        </h2>
      )}

      {/* ── Rating summary */}
      {avg !== null && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: '#FBF8F5', borderRadius: 16,
            padding: '16px 20px', marginBottom: 24,
            border: '1px solid rgba(184,147,106,0.2)',
          }}
        >
          <span style={{ fontSize: 48, fontWeight: 700, color: '#513012', lineHeight: 1 }}>
            {avg.toFixed(1)}
          </span>
          <div>
            <StarDisplay rating={Math.round(avg)} size={20} />
            <p style={{ fontSize: 13, color: '#9a7458', marginTop: 4 }}>
              Based on {topLevel.length} review{topLevel.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* ── Auth gate (shows only when not logged in) */}
      {!auth && (
        <AuthGate
          restaurantId={restaurantId}
          onAuthenticated={(a) => setAuth(a)}
          onAlreadyLoggedIn={(a) => setAuth(a)}
        />
      )}

      {auth && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 32,
          }}
        >
          {/* Logged-in badge */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#f0faf4', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 10, padding: '8px 14px', marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="#22c55e" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                Reviewing as {auth.email}
              </span>
            </div>
            <button
              onClick={() => { clearAuth(); setAuth(null); }}
              style={{ fontSize: 11, color: '#9a7458', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Switch
            </button>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e0f02', marginBottom: 4, marginTop: 0 }}>
            ✍️ Write a review
          </h3>

          {submitted && (
            <p style={{ fontSize: 13, color: '#38a169', marginBottom: 12 }}>
              ✓ Review submitted! Thank you.
            </p>
          )}

          <p style={{ fontSize: 13, color: '#9a7458', marginBottom: 6, marginTop: 12 }}>Your rating *</p>
          <StarPicker value={rating} onChange={(v) => { setRating(v); setError(''); }} />

          <p style={{ fontSize: 13, color: '#9a7458', marginBottom: 6, marginTop: 14 }}>Your review *</p>
          <textarea
            value={reviewText}
            onChange={(e) => { setReviewText(e.target.value); setError(''); }}
            placeholder="Share your honest opinion about this dish…"
            rows={4}
            style={inputBase}
          />

          {/* Photos */}
          <div style={{ marginTop: 14 }}>
            <label
              style={{
                fontSize: 13, color: '#888', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                border: '1px dashed #ccc', borderRadius: 8, padding: '8px 14px',
              }}
            >
              <Camera size={14} /> Add photos (optional)
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
            {photoPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                    <button
                      onClick={() => {
                        setPhotos((p) => p.filter((_, j) => j !== i));
                        setPhotoPreviews((p) => p.filter((_, j) => j !== i));
                      }}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#513012', color: '#fff', border: 'none',
                        cursor: 'pointer', fontSize: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 10 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            style={{
              marginTop: 16, padding: '10px 28px',
              background: submitting || rating === 0 ? '#b8936a' : '#513012',
              color: '#fdf6ec', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              cursor: submitting || rating === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            {submitting
              ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              : <><Send size={14} /> Submit review</>
            }
          </button>
        </div>
      )}

      {/* ── Existing reviews */}
      <p
        style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#b8936a', marginBottom: 12,
        }}
      >
        Customer Reviews
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 size={26} className="animate-spin" style={{ color: '#b8936a' }} />
        </div>
      ) : topLevel.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>🍽️</p>
          <p style={{ fontSize: 14, color: '#9a7458' }}>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div>
          {visibleTopLevel.map((r) => (
            <MenuReviewCard
              key={r.id}
              review={r}
              allReviews={reviews}
              menuId={menuId}
              restaurantId={restaurantId}
              depth={0}
              auth={auth}
              onReplyPosted={fetchReviews}
            />
          ))}
          {topLevel.length > 5 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                marginTop: 12, background: 'none', border: 'none',
                color: '#513012', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              }}
            >
              View all {topLevel.length} reviews →
            </button>
          )}
        </div>
      )}
    </div>
  );

  // ── Drawer wrapper
  if (isDrawer) {
    return (
      <>
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(30,15,2,0.6)', backdropFilter: 'blur(3px)',
          }}
          onClick={onClose}
        />
        <div
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
            borderRadius: '24px 24px 0 0', overflowY: 'auto',
            background: '#fffdf8', maxHeight: '90vh',
          }}
        >
          {/* drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d4b896' }} />
          </div>
          {content}
        </div>
      </>
    );
  }

  // ── Inline section
  return content;
}