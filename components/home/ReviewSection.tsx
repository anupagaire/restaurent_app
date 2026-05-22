'use client';

import { useState, useEffect, useCallback } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_DEPTH = 3;

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
interface Props {
  restaurantId: number;
}

// ── Parse name from review text ──────────────────────────────
// Reviews posted with name are stored as: "[Name] actual review"
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
  const { text } = parseReview(review.review);
  return text;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= count ? '#E2C765' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}

async function uploadPhoto(reviewId: number, file: File) {
  const formData = new FormData();
  formData.append('type', 'review');
  formData.append('object_id', String(reviewId));
  formData.append('photo', file);
  const res = await fetch(`${BASE_URL}/api/v1/photo/`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Photo upload failed');
  return res.json();
}

// ── Review Card ──────────────────────────────────────────────
function ReviewCard({
  review, allReviews, restaurantId, depth, onReplyPosted,showReplies = true,
}: {
  review: Review;
  allReviews: Review[];
  restaurantId: number;
  depth: number;
  onReplyPosted: () => void;showReplies?: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyPhotos, setReplyPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

const directReplies = allReviews.filter(r => Number(r.parent) === Number(review.id));
  const handleReply = async () => {
    if (!replyText.trim()) { setReplyError('Please write something.'); return; }
    setReplyError('');
    setSubmitting(true);
    try {
      const namePrefix = replyName.trim() ? `[${replyName.trim()}] ` : '[Anonymous] ';
      const res = await fetch(`${BASE_URL}/api/v1/restaurant-reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant: restaurantId,
          parent: review.id,
          review: `${namePrefix}${replyText.trim()}`,
          is_published: true,
        }),
      });

   
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.log('REPLY ERROR:', JSON.stringify(err));
        const msg = err?.errors
          ? Object.values(err.errors).flat().join(', ')
          : err?.detail || 'Failed to post reply.';
              setReplyError(msg);
             return;
}
console.log('REPLY SUCCESS:', await res.json()); 

      const created = await res.json();
      for (const file of replyPhotos) await uploadPhoto(created.id, file);

      setReplyName('');
      setReplyText('');
      setReplyPhotos([]);
      setReplyOpen(false);
      onReplyPosted();
    } catch {
      setReplyError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const indentLeft = Math.min(depth * 20, 60);

  return (
    <div style={{ marginLeft: indentLeft, marginBottom: 12 }}>
      <div style={{
        background: depth === 0 ? '#fff' : '#FBF8F5',
        border: '1px solid #eee',
        borderLeft: depth > 0 ? '3px solid #513012' : '1px solid #eee',
        borderRadius: 12,
        padding: '14px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: depth === 0 ? 38 : 30, height: depth === 0 ? 38 : 30,
            borderRadius: '50%', background: '#F3E9DE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: depth === 0 ? 13 : 11, fontWeight: 600, color: '#513012', flexShrink: 0,
          }}>
            {getInitials(review)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: 0 }}>{getDisplayName(review)}</p>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{formatDate(review.created_on)}</p>
          </div>
          {depth === 0 && <Stars count={review.rating} size={14} />}
        </div>

        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>{getReviewText(review)}</p>

        {review.photos?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {review.photos.map(p => (
              <img
                key={p.id}
                src={p.photo_url.startsWith('http') ? p.photo_url : `${BASE_URL}${p.photo_url}`}
                alt="review"
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
              />
            ))}
          </div>
        )}

        {depth < MAX_DEPTH && (
          <button
            onClick={() => { setReplyOpen(!replyOpen); setReplyText(''); setReplyError(''); }}
            style={{ marginTop: 10, background: 'none', border: 'none', color: '#513012', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0 }}
          >
            {replyOpen ? '✕ Cancel' : '↩ Reply'}
          </button>
        )}

        {replyOpen && (
          <div style={{ marginTop: 10 }}>
            {/* Name field for reply */}
            <input
              type="text"
              value={replyName}
              onChange={e => setReplyName(e.target.value)}
              placeholder="Your name (optional)"
              style={{ width: '100%', padding: '7px 12px', borderRadius: 8, border: '1px solid #eee', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#333', marginBottom: 8 }}
            />
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #eee', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none', color: '#333' }}
            />
            <label style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#888', cursor: 'pointer' }}>
              📎 Add photos (optional)
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => setReplyPhotos(Array.from(e.target.files ?? []))} />
            </label>
            {replyPhotos.length > 0 && (
              <p style={{ fontSize: 12, color: '#513012', marginTop: 4 }}>{replyPhotos.length} photo(s) selected</p>
            )}
            {replyError && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 4 }}>{replyError}</p>}
            <button
              onClick={handleReply}
              disabled={submitting}
              style={{ marginTop: 8, padding: '7px 18px', background: '#513012', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Posting...' : 'Post reply'}
            </button>
          </div>
        )}
      </div>

      {directReplies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {directReplies.map(reply => (
            <ReviewCard
              key={reply.id}
              review={reply}
              allReviews={allReviews}
              restaurantId={restaurantId}
              depth={depth + 1}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Section ─────────────────────────────────────────────
export default function ReviewSection({ restaurantId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

 const fetchReviews = useCallback(async () => {
  try {
    setLoading(true);

    // Step 1: top-level reviews fetch gara
    const res = await fetch(
      `${BASE_URL}/api/v1/restaurant-reviews/?restaurant=${restaurantId}&page_size=200`,
      { cache: 'no-store' }
    );
    if (!res.ok) return;
    const data = await res.json();
    const topLevelReviews = data.results ?? [];

    // Step 2: har review ko detail fetch gara — replies nested aaucha
    const detailed = await Promise.all(
      topLevelReviews.map(async (r: Review) => {
        const detailRes = await fetch(
          `${BASE_URL}/api/v1/restaurant-reviews/${r.id}/`,
          { cache: 'no-store' }
        );
        if (!detailRes.ok) return r;
        return detailRes.json();
      })
    );

    // Step 3: flatten — top-level + nested replies sabai ek array ma
    const allReviews: Review[] = [];
    detailed.forEach((r: Review & { replies?: Review[] }) => {
      allReviews.push(r);
      if (r.replies?.length) {
        r.replies.forEach((reply) => allReviews.push(reply));
      }
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
    ? (topLevel.reduce((s, r) => s + r.rating, 0) / topLevel.length).toFixed(1)
    : null;
const visibleTopLevel = showAll ? topLevel : topLevel.slice(0, 5);
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating.'); return; }
    if (!reviewText.trim()) { setError('Please write a review.'); return; }
    setError('');
    setSubmitting(true);

    try {
      // Embed name into review text since backend user_id is required
      const namePrefix = guestName.trim() ? `[${guestName.trim()}] ` : '[Anonymous] ';
      const res = await fetch(`${BASE_URL}/api/v1/restaurant-reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant: restaurantId,
          rating,
          review: `${namePrefix}${reviewText.trim()}`,
          is_published: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(JSON.stringify(err));
        return;
      }

      const created = await res.json();
      for (const file of photos) await uploadPhoto(created.id, file);

      setSubmitted(true);
      setGuestName('');
      setRating(0);
      setReviewText('');
      setPhotos([]);
      setPhotoPreviews([]);
      fetchReviews();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#513012', marginBottom: 20 }}>
        Reviews {topLevel.length > 0 && `(${topLevel.length})`}
      </h2>

      {avgRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#FBF8F5', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
          <span style={{ fontSize: 48, fontWeight: 700, color: '#513012', lineHeight: 1 }}>{avgRating}</span>
          <div>
            <Stars count={Math.round(Number(avgRating))} size={20} />
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              Based on {topLevel.length} review{topLevel.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
        <h3 className="text-lg font-bold mb-2">Write a review</h3>

        <p className="text-sm mb-2 text-gray-400" >Your name (optional)</p>
        <input
          type="text"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          placeholder="e.g. Ramesh Shrestha"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #eee', fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#333', marginBottom: 16 }}
        />

        <p className="text-sm mb-2 text-gray-400">Your rating *</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, color: i <= (hovered || rating) ? '#E2C765' : '#ddd', padding: 0, lineHeight: 1 }}
            >★</button>
          ))}
        </div>

        <p className="text-sm mb-2 text-gray-400">Your review *</p>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #eee', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', color: '#333' }}
        />

        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 13, color: '#888', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px dashed #ccc', borderRadius: 8, padding: '8px 14px' }}>
            📷 Add photos (optional)
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
          </label>
          {photoPreviews.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {photoPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                  <button
                    onClick={() => {
                      setPhotos(p => p.filter((_, j) => j !== i));
                      setPhotoPreviews(p => p.filter((_, j) => j !== i));
                    }}
                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#513012', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p style={{ color: '#e53e3e', fontSize: 13, marginTop: 10 }}>{error}</p>}
        {submitted && (
          <p style={{ color: '#38a169', fontSize: 13, marginTop: 10 }}>
            ✓ Review submitted! Thank you{guestName ? `, ${guestName}` : ''}!
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ marginTop: 16, padding: '10px 28px', background: '#513012', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>
      </div>
{loading ? (
        <p style={{ color: '#aaa', fontSize: 14 }}>Loading reviews...</p>
      ) : topLevel.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 14 }}>No reviews yet. Be the first!</p>
      ) : (
        <div>
          {visibleTopLevel.map(r => (
  <ReviewCard
    key={r.id}
    review={r}
    allReviews={reviews}
    restaurantId={restaurantId}
    depth={0}
    onReplyPosted={fetchReviews}
    showReplies={false} 
  />
))}
{topLevel.length > 5 && (
  <button
    onClick={() => setShowAll(true)}
    style={{
      marginTop: 12,
      background: 'none',
      border: 'none',
      color: '#513012',
      cursor: 'pointer',
      fontWeight: 600
    }}
  >
    View all reviews →
  </button>
)}
        </div>
      )}
      
    </div>
  );
}