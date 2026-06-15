
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Star, Send, Loader2, ChevronLeft, X,
  LogIn, CheckCircle2, Camera, CornerDownRight,
} from 'lucide-react';
import {
  getAuth,
  saveAuth,
  clearAuth,
  apiRefreshToken,
  AuthData,
} from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const MAX_DEPTH = 3;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
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
  onClose?: () => void;
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

// ── Photo upload — menu_review type only, token required ──────────────────
async function apiUploadPhoto(
  reviewId: number,
  file: File,
  accessToken: string,
): Promise<void> {
  const fd = new FormData();
  fd.append('type', 'menu_review');
  fd.append('object_id', String(reviewId));
  fd.append('photo', file);

  const res = await fetch(`${BASE_URL}/api/v1/photo/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fd,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    console.error(`[photo] upload failed status=${res.status}`, err);
    throw new Error(`Photo upload failed (${res.status})`);
  }
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
        <Star key={s} size={size}
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
        <button key={star} type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        >
          <Star size={30}
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
      <img src={resolvePhotoUrl(review.user.avatar)} alt={getDisplayName(review)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#513012', color: '#fdf6ec',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, flexShrink: 0,
    }}>
      {getInitials(review)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GATE
// ─────────────────────────────────────────────────────────────────────────────
interface AuthGateProps {
  restaurantId: number;
  onAuthenticated: (auth: AuthData) => void;
}

function AuthGate({ restaurantId, onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'registering' | 'logging_in'>('idle');

  const canSubmitRegister = email.trim().length > 0 && password.length >= 8 && password === confirmPassword;
  const canSubmitLogin    = email.trim().length > 0 && password.length >= 6;

  const handleRegister = async () => {
    if (!canSubmitRegister) return;
    setError(''); setLoading(true);
    try {
      setStep('registering');
      await apiRegister({ email, password, name: name.trim() || 'Guest', phone: null, restaurantId });
      setStep('logging_in');
      const auth = await apiLogin(email, password);
      saveAuth(auth);
      onAuthenticated(auth);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally { setLoading(false); setStep('idle'); }
  };

  const handleLogin = async () => {
    if (!canSubmitLogin) return;
    setError(''); setLoading(true);
    try {
      setStep('logging_in');
      const auth = await apiLogin(email, password);
      saveAuth(auth);
      onAuthenticated(auth);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally { setLoading(false); setStep('idle'); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(184,147,106,0.35)', fontSize: 14,
    fontFamily: 'inherit', outline: 'none', color: 'secondary', background: '#fdf6ec',
  };

  const stepLabel =
    step === 'registering' ? 'Creating account…'
    : step === 'logging_in' ? 'Logging in…'
    : mode === 'register' ? 'Create account & review'
    : 'Log in & review';

  return (
    <div style={{
      background: '#fffbf5', border: '1px solid rgba(184,147,106,0.35)',
      borderRadius: 16, padding: '20px', marginBottom: 28,
    }}>
      <div className="flex items-center gap-2 mb-3">
        <LogIn size={15} color="#513012" />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#513012', margin: 0 }}>
          Sign in to leave a review
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {(['login', 'register'] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
            padding: '6px 14px', borderRadius: 20, border: '1px solid #513012',
            background: mode === m ? '#513012' : 'transparent',
            color: mode === m ? '#fdf6ec' : '#513012',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            {m === 'login' ? 'I have an account' : 'New account'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mode === 'register' && (
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)" style={inputBase} />
        )}
        <input type="email" value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="Email *" style={inputBase} />
        <input type="password" value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder={mode === 'register' ? 'Password (min 8 chars) *' : 'Password *'}
          style={inputBase} />
        {mode === 'register' && (
          <div>
            <input type="password" value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Confirm password *"
              style={{
                ...inputBase,
                ...(confirmPassword && password !== confirmPassword
                  ? { borderColor: 'rgba(192,57,43,0.5)' } : {}),
              }} />
            {confirmPassword && password !== confirmPassword && (
              <p style={{ fontSize: 11, color: '#c0392b', marginTop: 3 }}>Passwords don't match</p>
            )}
          </div>
        )}
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 8 }}>{error}</p>}

      <button
        onClick={mode === 'register' ? handleRegister : handleLogin}
        disabled={loading || (mode === 'register' ? !canSubmitRegister : !canSubmitLogin)}
        style={{
          marginTop: 14, width: '100%', padding: '10px 0',
          background: loading ? '#b8936a' : '#513012',
          color: '#fdf6ec', border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? <><Loader2 size={14} className="animate-spin" /> {stepLabel}</> : stepLabel}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW CARD (with nested replies)
// ─────────────────────────────────────────────────────────────────────────────
function MenuReviewCard({
  review, allReviews, menuId, restaurantId, depth, auth, onReplyPosted,
}: {
  review: MenuReview; allReviews: MenuReview[]; menuId: number;
  restaurantId: number; depth: number; auth: AuthData | null;
  onReplyPosted: () => void;
}) {
  const [replyOpen,     setReplyOpen]     = useState(false);
  const [replyText,     setReplyText]     = useState('');
  const [replyPhotos,   setReplyPhotos]   = useState<File[]>([]);
  const [replyPreviews, setReplyPreviews] = useState<string[]>([]);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');

  const directReplies = allReviews.filter((r) => Number(r.parent) === Number(review.id));

  const handleReply = async () => {
    if (!auth) { setError('You must be logged in to reply.'); return; }
    if (!replyText.trim()) { setError('Please write something.'); return; }
    setError(''); setSubmitting(true);
    try {
      // Use auth.access directly from prop — no withTokenRefresh
      const created = await apiPostMenuReview({
        menu: menuId,
        restaurant: restaurantId,
        parent: review.id,
        rating: 5,
        review: replyText.trim(),
        is_published: true,
      }, auth.access);

      for (const file of replyPhotos) {
        await apiUploadPhoto(created.id, file, auth.access);
      }

      setReplyText(''); setReplyPhotos([]); setReplyPreviews([]); setReplyOpen(false);
      onReplyPosted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg.includes('401') ? 'Session expired — please refresh the page.' : msg);
    } finally { setSubmitting(false); }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setReplyPhotos(files);
    setReplyPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  return (
    <div style={{ marginLeft: Math.min(depth * 20, 60), marginBottom: 12 }}>
      <div style={{
        background: depth === 0 ? '#fff' : '#FBF8F5',
        border: '1px solid #eee',
        borderLeft: depth > 0 ? '3px solid #b8936a' : '1px solid #eee',
        borderRadius: 12, padding: '14px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Avatar review={review} size={depth === 0 ? 38 : 30} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'secondary', margin: 0 }}>
              {getDisplayName(review)}
            </p>
            <p style={{ fontSize: 11, color: '#9a7458', margin: 0 }}>{formatDate(review.created_on)}</p>
          </div>
          {depth === 0 && <StarDisplay rating={review.rating} size={13} />}
        </div>

        {review.review && (
          <p style={{ fontSize: 14, color: '#4a3728', lineHeight: 1.65, margin: 0 }}>{review.review}</p>
        )}

        {review.photos?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {review.photos.map((p) => (
              <img key={p.id} src={resolvePhotoUrl(p.photo_url)} alt="review photo"
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
            ))}
          </div>
        )}

        {auth && depth < MAX_DEPTH && (
          <button
            onClick={() => { setReplyOpen(!replyOpen); setReplyText(''); setError(''); }}
            style={{
              marginTop: 10, background: 'none', border: 'none', color: '#513012',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            {replyOpen ? <><X size={11} /> Cancel</> : <><CornerDownRight size={11} /> Reply</>}
          </button>
        )}

        {replyOpen && (
          <div style={{ marginTop: 10 }}>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply…" rows={2}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid rgba(184,147,106,0.35)',
                fontSize: 13, resize: 'vertical', fontFamily: 'inherit',
                outline: 'none', color: 'secondary', background: '#fdf6ec',
              }} />
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: '#9a7458', cursor: 'pointer',
              marginTop: 6, border: '1px dashed #ccc', borderRadius: 6, padding: '5px 10px',
            }}>
              <Camera size={12} /> Add photos
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
            {replyPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {replyPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                    <button onClick={() => {
                      setReplyPhotos((p) => p.filter((_, j) => j !== i));
                      setReplyPreviews((p) => p.filter((_, j) => j !== i));
                    }} style={{
                      position: 'absolute', top: -5, right: -5, width: 16, height: 16,
                      borderRadius: '50%', background: '#513012', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {error && <p style={{ color: '#c0392b', fontSize: 12, marginTop: 4 }}>{error}</p>}
            <button onClick={handleReply} disabled={submitting} style={{
              marginTop: 8, padding: '7px 18px',
              background: submitting ? '#b8936a' : '#513012',
              color: '#fdf6ec', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {submitting ? <><Loader2 size={12} className="animate-spin" /> Posting…</> : 'Post reply'}
            </button>
          </div>
        )}
      </div>

      {directReplies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {directReplies.map((reply) => (
            <MenuReviewCard key={reply.id} review={reply} allReviews={allReviews}
              menuId={menuId} restaurantId={restaurantId} depth={depth + 1}
              auth={auth} onReplyPosted={onReplyPosted} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function MenuReviewSection({
  menuId, menuName, restaurantId, onClose,
}: MenuReviewSectionProps) {
  const [reviews,       setReviews]       = useState<MenuReview[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [showAll,       setShowAll]       = useState(false);

  // Auth — starts null, populated by useEffect after hydration
  const [auth,          setAuth]          = useState<AuthData | null>(null);
  const [authLoading,   setAuthLoading]   = useState(true);

  // Review form
  const [rating,        setRating]        = useState(0);
  const [reviewText,    setReviewText]    = useState('');
  const [photos,        setPhotos]        = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');
  const [submitted,     setSubmitted]     = useState(false);

  // ── Read localStorage after hydration, silently refresh token ──────────────
  useEffect(() => {
    const stored = getAuth();
    if (!stored) {
      setAuthLoading(false);
      return;
    }
    setAuth(stored);

    // Try to refresh token silently — if refresh token also expired, clear auth
    apiRefreshToken(stored.refresh)
      .then((newAccess) => {
        if (newAccess && newAccess !== stored.access) {
          const fresh: AuthData = { ...stored, access: newAccess };
          saveAuth(fresh);
          setAuth(fresh);
        }
      })
      .catch(() => {
        clearAuth();
        setAuth(null);
      })
      .finally(() => setAuthLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const data = await apiFetchMenuReviews(menuId);
    setReviews(data);
    setLoading(false);
  }, [menuId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const topLevel        = reviews.filter((r) => r.parent === null || r.parent === undefined);
  const avg             = calcAvg(reviews);
  const visibleTopLevel = showAll ? topLevel : topLevel.slice(0, 5);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // ── Submit review — uses auth.access directly from state (no withTokenRefresh) ──
  const handleSubmit = async () => {
    if (!auth) { setError('Please sign in first.'); return; }
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (!reviewText.trim()) { setError('Please write a review.'); return; }
    setError('');
    setSubmitting(true);

    try {
      // Step 1 — post review using token directly from React state
      const created = await apiPostMenuReview(
        {
          menu: menuId,
          restaurant: restaurantId,
          rating,
          review: reviewText.trim(),
          is_published: true,
        },
        auth.access,  // ← direct from state, never undefined
      );

      // Step 2 — upload photos using same token
      for (const file of photos) {
        await apiUploadPhoto(created.id, file, auth.access);
      }

      setSubmitted(true);
      setRating(0);
      setReviewText('');
      setPhotos([]);
      setPhotoPreviews([]);
      await fetchReviews();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      if (msg.includes('401')) {
        // Token expired — clear auth so user can log in again
        clearAuth();
        setAuth(null);
        setError('Session expired. Please log in again.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDrawer = !!onClose;

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid rgba(184,147,106,0.35)', fontSize: 14,
    fontFamily: 'inherit', outline: 'none', color: 'secondary', background: '#fdf6ec',
  };

  const content = (
    <div style={isDrawer
      ? { padding: '0 20px 80px', maxWidth: 680, margin: '0 auto' }
      : { marginTop: 48 }
    }>
      {/* Drawer header */}
      {isDrawer && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 0' }}>
            <div>
              <button onClick={onClose} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9a7458', fontSize: 12, padding: 0, marginBottom: 6,
              }}>
                <ChevronLeft size={14} /> Back to menu
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'secondary', fontFamily: 'Georgia, serif', margin: 0 }}>
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

      {/* Inline title */}
      {!isDrawer && (
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#513012', marginBottom: 20 }}>
          Reviews {topLevel.length > 0 && `(${topLevel.length})`}
        </h2>
      )}

      {/* Rating summary */}
      {avg !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: '#FBF8F5', borderRadius: 16,
          padding: '16px 20px', marginBottom: 24,
          border: '1px solid rgba(184,147,106,0.2)',
        }}>
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

      {/*
        AUTH SECTION logic:
        authLoading = true               → spinner (localStorage not yet read)
        authLoading = false, auth = null → AuthGate (not logged in)
        authLoading = false, auth = set  → write-review form
      */}
      {authLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <Loader2 size={22} className="animate-spin" style={{ color: '#b8936a' }} />
        </div>
      ) : !auth ? (
        <AuthGate
          restaurantId={restaurantId}
          onAuthenticated={(a) => { setAuth(a); setAuthLoading(false); }}
        />
      ) : (
        <div style={{
          background: '#fff', border: '1px solid #eee',
          borderRadius: 16, padding: '20px 24px', marginBottom: 32,
        }}>
          {/* Logged-in badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#f0faf4', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 10, padding: '8px 14px', marginBottom: 16,
          }}>
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

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'secondary', marginBottom: 4, marginTop: 0 }}>
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
          <textarea value={reviewText}
            onChange={(e) => { setReviewText(e.target.value); setError(''); }}
            placeholder="Share your honest opinion about this dish…"
            rows={4} style={inputBase} />

          <div style={{ marginTop: 14 }}>
            <label style={{
              fontSize: 13, color: '#888', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              border: '1px dashed #ccc', borderRadius: 8, padding: '8px 14px',
            }}>
              <Camera size={14} /> Add photos (optional)
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
            {photoPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                    <button onClick={() => {
                      setPhotos((p) => p.filter((_, j) => j !== i));
                      setPhotoPreviews((p) => p.filter((_, j) => j !== i));
                    }} style={{
                      position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                      borderRadius: '50%', background: '#513012', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 10 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={submitting || rating === 0} style={{
            marginTop: 16, padding: '10px 28px',
            background: submitting || rating === 0 ? '#b8936a' : '#513012',
            color: '#fdf6ec', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            cursor: submitting || rating === 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            {submitting
              ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              : <><Send size={14} /> Submit review</>
            }
          </button>
        </div>
      )}

      {/* Existing reviews */}
      <p style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: '#b8936a', marginBottom: 12,
      }}>
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
            <MenuReviewCard key={r.id} review={r} allReviews={reviews}
              menuId={menuId} restaurantId={restaurantId}
              depth={0} auth={auth} onReplyPosted={fetchReviews} />
          ))}
          {topLevel.length > 5 && !showAll && (
            <button onClick={() => setShowAll(true)} style={{
              marginTop: 12, background: 'none', border: 'none',
              color: '#513012', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}>
              View all {topLevel.length} reviews →
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isDrawer) {
    return (
      <>
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(30,15,2,0.6)', backdropFilter: 'blur(3px)' }}
          onClick={onClose}
        />
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
          borderRadius: '24px 24px 0 0', overflowY: 'auto',
          background: '#fffdf8', maxHeight: '90vh',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d4b896' }} />
          </div>
          {content}
        </div>
      </>
    );
  }

  return content;
}
