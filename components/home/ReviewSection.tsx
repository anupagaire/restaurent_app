'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_DEPTH = 3;
const INITIAL_SHOW = 5;

interface ReviewUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}
interface ReviewPhoto {
  id: number;
  object_id: number;
  photo_url: string;
}
interface Review {
  id: number;
  parent: number | null;
  user: ReviewUser | null;
  rating: number;
  review: string;
  created_on: string;
  is_published: boolean;
  photos: ReviewPhoto[];
}
interface Props { restaurantId: number; }

// ── Helpers ──────────────────────────────────────────────────
function parseReview(raw: string): { name: string | null; text: string } {
  const match = raw.match(/^\[(.+?)\] ([\s\S]*)$/);
  if (match) return { name: match[1], text: match[2] };
  return { name: null, text: raw };
}
function getInitials(review: Review): string {
  if (review.user?.first_name)
    return (review.user.first_name[0] + (review.user.last_name?.[0] ?? '')).toUpperCase();
  const { name } = parseReview(review.review);
  if (name) return name.slice(0, 2).toUpperCase();
  return 'A';
}
function getDisplayName(review: Review): string {
  if (review.user?.first_name)
    return `${review.user.first_name} ${review.user.last_name ?? ''}`.trim();
  const { name } = parseReview(review.review);
  return name ?? 'Anonymous';
}
function getReviewText(review: Review): string {
  return parseReview(review.review).text;
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= count ? '#f59e0b' : 'secondary' }}>★</span>
      ))}
    </span>
  );
}
async function uploadPhoto(reviewId: number, file: File) {
  const fd = new FormData();
  fd.append('type', 'review');
  fd.append('object_id', String(reviewId));
  fd.append('photo', file);
  await fetch(`${BASE_URL}/api/v1/photo/`, { method: 'POST', body: fd });
}

function Avatar({ review, size = 36 }: { review: Review; size?: number }) {
  const initials = getInitials(review);
  const colors = ['#513012','#7c3e1a','#a05225','#c4682f','#6b3a1f'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  if (review.user?.avatar) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
        <Image src={review.user.avatar} alt={initials} width={size} height={size} style={{ objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Compose Box ──────────────────────────────────────────────
function ComposeBox({
  placeholder,
  onSubmit,
  onCancel,
  showName = false,
  showRating = false,
  compact = false,
}: {
  placeholder: string;
  onSubmit: (data: { name: string; text: string; rating: number; photos: File[] }) => Promise<void>;
  onCancel?: () => void;
  showName?: boolean;
  showRating?: boolean;
  compact?: boolean;
}) {
  const [focused, setFocused] = useState(!compact);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (showRating && rating === 0) { setError('Please select a rating.'); return; }
    if (!text.trim()) { setError('Please write something.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ name, text, rating, photos });
      setName(''); setText(''); setRating(0); setPhotos([]); setPreviews([]);
      if (compact) setFocused(false);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3 w-full">
      <div className="flex-1">
        {/* Name field */}
        {focused && showName && (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full text-sm px-0 py-1.5 border-b border-gray-200 outline-none focus:border-secondary mb-3 bg-transparent text-gray-700 placeholder:text-secondary transition-colors"
          />
        )}

        {/* Rating */}
        {focused && showRating && (
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
                style={{ color: i <= (hovered || rating) ? '#f59e0b' : 'secondary' }}
              >★</button>
            ))}
          </div>
        )}

        {/* Text area */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          rows={focused ? 3 : 1}
          className="w-full resize-none bg-transparent border-b border-gray-200 outline-none focus:border-secondary text-sm text-gray-800 placeholder:text-secondary py-1.5 transition-all"
          style={{ minHeight: focused ? 72 : 32 }}
        />

        {/* Photo previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                <button
                  onClick={() => { setPhotos(p => p.filter((_, j) => j !== i)); setPreviews(p => p.filter((_, j) => j !== i)); }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-600 text-white rounded-full text-[10px] flex items-center justify-center"
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        {/* Actions */}
        {focused && (
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-1.5 text-xs text-secondary hover:text-gray-600 cursor-pointer transition-colors">
              <span>📎</span> Photo
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files ?? []);
                  setPhotos(files);
                  setPreviews(files.map(f => URL.createObjectURL(f)));
                }} />
            </label>
            <div className="flex gap-2">
              {onCancel && (
                <button onClick={() => { onCancel(); if (compact) setFocused(false); }}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              )}
              <button onClick={handleSubmit} disabled={submitting || !text.trim()}
                className="px-5 py-1.5 rounded-full text-xs font-semibold bg-secondary text-white hover:bg-[#3d2209] disabled:opacity-40 transition-colors">
                {submitting ? 'Posting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Review Card ──────────────────────────────────────────────
function ReviewCard({
  review, allReviews, restaurantId, depth, onReplyPosted,
}: {
  review: Review;
  allReviews: Review[];
  restaurantId: number;
  depth: number;
  onReplyPosted: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const directReplies = allReviews.filter(r => Number(r.parent) === Number(review.id));

  const handleReply = async ({ name, text }: { name: string; text: string; rating: number; photos: File[] }) => {
    const namePrefix = name.trim() ? `[${name.trim()}] ` : '[Anonymous] ';
    const res = await fetch(`${BASE_URL}/api/v1/restaurant-reviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant: restaurantId,
        parent: review.id,
        review: `${namePrefix}${text.trim()}`,
        is_published: true,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail ?? 'Failed to post reply.');
    }
    setReplyOpen(false);
    onReplyPosted();
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'mt-3' : 'py-4 border-b border-gray-100 last:border-0'}`}>
      {/* Avatar */}
      <Avatar review={review} size={depth === 0 ? 36 : 28} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{getDisplayName(review)}</span>
          <span className="text-xs text-secondary">{timeAgo(review.created_on)}</span>
          {depth === 0 && review.rating > 0 && <Stars count={review.rating} size={12} />}
        </div>

        {/* Text */}
        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{getReviewText(review)}</p>

        {/* Photos */}
        {review.photos?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {review.photos.map(p => (
              <img key={p.id}
                src={p.photo_url.startsWith('http') ? p.photo_url : `${BASE_URL}${p.photo_url}`}
                alt="review photo"
                className="w-20 h-20 object-cover rounded-xl border border-gray-100"
              />
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-4 mt-2">
          {depth < MAX_DEPTH && (
            <button onClick={() => setReplyOpen(!replyOpen)}
              className="text-xs font-semibold text-secondary hover:text-secondary transition-colors">
              ↩ Reply
            </button>
          )}
          {directReplies.length > 0 && (
            <button onClick={() => setShowReplies(!showReplies)}
              className="text-xs font-semibold text-secondary hover:underline">
              {showReplies ? `▲ Hide ${directReplies.length} repl${directReplies.length > 1 ? 'ies' : 'y'}` : `▼ ${directReplies.length} repl${directReplies.length > 1 ? 'ies' : 'y'}`}
            </button>
          )}
        </div>

        {/* Reply compose */}
        {replyOpen && (
          <div className="mt-3 flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#F3E9DE] flex items-center justify-center text-[10px] font-bold text-secondary flex-shrink-0">
              Y
            </div>
            <ComposeBox
              placeholder="Add a reply..."
              onSubmit={handleReply}
              onCancel={() => setReplyOpen(false)}
              showName
              compact={false}
            />
          </div>
        )}

        {/* Nested replies */}
        {showReplies && directReplies.length > 0 && (
          <div className="mt-2 pl-2 border-l-2 border-gray-100 space-y-1">
            {directReplies.map(reply => (
              <ReviewCard key={reply.id} review={reply} allReviews={allReviews}
                restaurantId={restaurantId} depth={depth + 1} onReplyPosted={onReplyPosted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function ReviewSection({ restaurantId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'top'>('newest');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/v1/restaurant-reviews/?restaurant=${restaurantId}&page_size=200`,
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json();
      const topLevelReviews = data.results ?? [];

      const detailed = await Promise.all(
        topLevelReviews.map(async (r: Review) => {
          const dr = await fetch(`${BASE_URL}/api/v1/restaurant-reviews/${r.id}/`, { cache: 'no-store' });
          if (!dr.ok) return r;
          return dr.json();
        })
      );

      const allReviews: Review[] = [];
      detailed.forEach((r: Review & { replies?: Review[] }) => {
        allReviews.push(r);
        if (r.replies?.length) r.replies.forEach(reply => allReviews.push(reply));
      });

      setReviews(allReviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const topLevel = reviews.filter(r => r.parent === null || r.parent === undefined);
  const avgRating = topLevel.length
    ? topLevel.reduce((s, r) => s + r.rating, 0) / topLevel.length
    : null;

  const sorted = [...topLevel].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
    return b.rating - a.rating;
  });
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_SHOW);

  const handleSubmit = async ({ name, text, rating, photos }: { name: string; text: string; rating: number; photos: File[] }) => {
    const namePrefix = name.trim() ? `[${name.trim()}] ` : '[Anonymous] ';
    const res = await fetch(`${BASE_URL}/api/v1/restaurant-reviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant: restaurantId,
        rating,
        review: `${namePrefix}${text.trim()}`,
        is_published: true,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail ?? JSON.stringify(err));
    }
    const created = await res.json();
    for (const file of photos) await uploadPhoto(created.id, file);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    fetchReviews();
  };

  return (
    <div className="mt-12">
      {/* ── Write a review box ── */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
        <ComposeBox
          placeholder="Add a comment..."
          onSubmit={handleSubmit}
          showName
          showRating
        />
        {submitted && (
          <p className="text-green-600 text-xs mt-2 font-medium">✓ Review submitted! Thank you!</p>
        )}
      </div>

      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            Comments
          </h2>
          {topLevel.length > 0 && (
            <span className="bg-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {topLevel.length}
            </span>
          )}
          {avgRating && (
            <div className="flex items-center gap-1.5 ml-2">
              <Stars count={Math.round(avgRating)} size={14} />
              <span className="text-sm font-semibold text-accent">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 text-sm text-secondary">
          <span className="text-xs">↑↓</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs font-semibold text-gray-600 bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="newest">Most recent</option>
            <option value="top">Top rated</option>
          </select>
        </div>
      </div>

      {/* ── Reviews list ── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-secondary text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div>
          <div className="divide-y divide-gray-100">
            {visible.map(r => (
              <ReviewCard key={r.id} review={r} allReviews={reviews}
                restaurantId={restaurantId} depth={0} onReplyPosted={fetchReviews} />
            ))}
          </div>

          {topLevel.length > INITIAL_SHOW && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {showAll ? '▲ Show less' : `▼ Show all ${topLevel.length} reviews`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}