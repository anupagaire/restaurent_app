'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2, AlertCircle, Loader2, Star, MessageSquare,
  Pencil, Trash2, X, ChevronLeft, ChevronRight, ExternalLink,
  MapPin, UtensilsCrossed,
} from 'lucide-react';

interface ReviewUser   { id: number; email: string; first_name: string; last_name: string; }
interface ReviewPhoto  { id: number; object_id: number; photo_url: string | null; }
interface MenuReview   {
  id: number; menu: number; restaurant: number; user: ReviewUser;
  parent: number | null; rating: number; review: string;
  is_published: boolean; photos: ReviewPhoto[]; created_on: string; updated_on: string;
}
interface MenuDetail   { id: number; name: string; price: string; description: string; photos: ReviewPhoto[]; restaurant: number; }
interface RestaurantDetail { id: number; name: string; city: string; address: string; photos: ReviewPhoto[]; }

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${
      type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      {msg}
    </div>
  );
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}>
          <Star className={`w-4 h-4 transition-colors ${n <= (hovered || value) ? 'fill-accent text-accent' : 'fill-gray-200 text-gray-200'}`} />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getFirstPhoto(photos: ReviewPhoto[]): string | null {
  return photos?.find(p => p.photo_url)?.photo_url ?? null;
}

function EditReviewModal({ review, onClose, onSaved }: { review: MenuReview; onClose: () => void; onSaved: (u: MenuReview) => void }) {
  const [rating, setRating] = useState(review.rating);
  const [text,   setText]   = useState(review.review);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError('Please select a rating.'); return; }
    setSaving(true); setError('');
    try {
      const res = await apiFetch(`/api/v1/menu-reviews/${review.id}/`, { method: 'PATCH', body: JSON.stringify({ rating, review: text }) });
      const raw = await res.json();
      if (!res.ok) throw new Error(raw?.detail ?? JSON.stringify(raw));
      onSaved(raw.data ?? raw);
    } catch (err: any) { setError(err.message || 'Failed to update review.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 px-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary">Edit Review</h2>
          <button onClick={onClose} className="text-secondary hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {error && <Alert type="error" msg={error} />}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <Label>Rating <span className="text-red-500">*</span></Label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="space-y-1">
            <Label>Review</Label>
            <Textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience…" className="resize-none" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-secondary hover:bg-secondary">
              {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ reviewId, onClose, onDeleted }: { reviewId: number; onClose: () => void; onDeleted: (id: number) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true); setError('');
    try {
      const res = await apiFetch(`/api/v1/menu-reviews/${reviewId}/`, { method: 'DELETE' });
      if (res.status !== 204 && !res.ok) { const raw = await res.json().catch(() => ({})); throw new Error(raw?.detail ?? 'Failed to delete.'); }
      onDeleted(reviewId);
    } catch (err: any) { setError(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 px-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-secondary">Delete Review?</h2>
        <p className="text-sm text-secondary">This action cannot be undone.</p>
        {error && <Alert type="error" msg={error} />}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
            {deleting ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Deleting…</> : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review, menu, restaurant, onEdit, onDelete,
}: {
  review: MenuReview;
  menu: MenuDetail | null;
  restaurant: RestaurantDetail | null;
  onEdit: (r: MenuReview) => void;
  onDelete: (id: number) => void;
}) {
  const menuPhoto = menu ? getFirstPhoto(menu.photos) : null;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
      <div className="flex gap-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-gray-100 relative overflow-hidden">
          {menuPhoto ? (
            <img 
            src={menuPhoto} alt={menu?.name ?? 'Menu item'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent">
              <UtensilsCrossed className="w-8 h-8 text-accent" />
            </div>
          )}
        </div>
        <div className="flex-1 p-3 space-y-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {menu?.name ?? `Menu #${review.menu}`}
            </h3>
            {menu?.price && (
              <span className="text-xs font-medium text-secondary shrink-0 bg-accent px-1.5 py-0.5 rounded">
                Rs. {parseFloat(menu.price).toLocaleString()}
              </span>
            )}
          </div>
          {restaurant && (
            <div className="flex items-center gap-1 text-xs text-secondary">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{restaurant.name}{restaurant.city ? ` • ${restaurant.city}` : ''}</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-0.5">
            <StarRating value={review.rating} readonly />
            <span className="text-xs text-secondary">{formatDate(review.created_on)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-2 shrink-0">
          <button onClick={() => onEdit(review)} className="p-1.5 rounded-lg text-secondary hover:text-secondary hover:bg-accent transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => onDelete(review.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {review.review ? (
        <div className="px-4 pb-3 pt-0"><p className="text-sm text-gray-700 leading-relaxed">{review.review}</p></div>
      ) : (
        <div className="px-4 pb-3 pt-0"><p className="text-xs text-secondary italic">No written review.</p></div>
      )}

      {review.photos?.filter(p => p.photo_url).length > 0 && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {review.photos.filter(p => p.photo_url).map(p => (
            <img key={p.id} src={p.photo_url!} alt="Review photo" className="w-14 h-14 rounded-lg object-cover border border-gray-100" />
          ))}
        </div>
      )}

      <div className="px-4 pb-3 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-2">
        {!review.is_published && <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent px-2 py-0.5 rounded-full">Pending approval</span>}
        {review.is_published  && <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Published</span>}
        <a href="/restaurants" target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium">
          <ExternalLink className="w-3 h-3" /> View Restaurant
        </a>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CustomerReviewsPage() {
  const [loading,       setLoading]       = useState(true);
  const [reviews,       setReviews]       = useState<MenuReview[]>([]);

  // ← Enriched maps — built once from batch fetch, passed to cards
  const [menuMap,       setMenuMap]       = useState<Record<number, MenuDetail>>({});
  const [restaurantMap, setRestaurantMap] = useState<Record<number, RestaurantDetail>>({});

  const [count,         setCount]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [pageError,     setPageError]     = useState('');
  const [editTarget,    setEditTarget]    = useState<MenuReview | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<number | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState('');

  const PAGE_SIZE  = 10;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPageError('');
      try {
        // Step 1: fetch all reviews
        const stored = localStorage.getItem('user');
        const me     = stored ? JSON.parse(stored) : null;

        const res = await apiFetch(`/api/v1/menu-reviews/?page=${page}&page_size=100`);
        const raw = await res.json();
        if (!res.ok) throw new Error(raw?.detail ?? 'Failed to load reviews');

        let all: MenuReview[] = Array.isArray(raw) ? raw : (raw.results ?? raw.data ?? []);
        if (me?.id) all = all.filter(r => r.user?.id === me.id);

        setReviews(all);
        setCount(all.length);

        // Step 2: collect unique IDs
        const menuIds       = [...new Set(all.map(r => r.menu))];
        const restaurantIds = [...new Set(all.map(r => r.restaurant).filter(Boolean))];

        // Step 3: fetch ALL menus and restaurants in parallel
        // (2 calls total instead of 2×N calls)
        const [menuResults, restResults] = await Promise.all([
          Promise.all(menuIds.map(id =>
            apiFetch(`/api/v1/menu/${id}/`).then(r => r.json()).then(d => d.data ?? d).catch(() => null)
          )),
          Promise.all(restaurantIds.map(id =>
            apiFetch(`/api/v1/restaurant/${id}/`).then(r => r.json()).then(d => d.data ?? d).catch(() => null)
          )),
        ]);

        // Step 4: build lookup maps
        const mMap: Record<number, MenuDetail>         = {};
        const rMap: Record<number, RestaurantDetail>   = {};
        menuResults.forEach(m => { if (m?.id) mMap[m.id] = m; });
        restResults.forEach(r => { if (r?.id) rMap[r.id] = r; });

        setMenuMap(mMap);
        setRestaurantMap(rMap);

      } catch (err: any) {
        setPageError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const handleSaved = (updated: MenuReview) => {
    setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    setEditTarget(null);
    setGlobalSuccess('Review updated successfully!');
    setTimeout(() => setGlobalSuccess(''), 3000);
  };

  const handleDeleted = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setCount(c => c - 1);
    setDeleteTarget(null);
    setGlobalSuccess('Review deleted.');
    setTimeout(() => setGlobalSuccess(''), 3000);
  };

  const paged = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {editTarget    && <EditReviewModal review={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
      {deleteTarget !== null && <DeleteConfirmModal reviewId={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary">My Reviews</h1>
          <p className="text-secondary mt-1 text-sm">
            {count > 0 ? `${count} review${count !== 1 ? 's' : ''} posted` : 'Manage your menu reviews'}
          </p>
        </div>

        {globalSuccess && <Alert type="success" msg={globalSuccess} />}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary text-lg">
              <MessageSquare className="w-5 h-5" /> Posted Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="flex justify-center items-center py-16"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>}
            {!loading && pageError && <Alert type="error" msg={pageError} />}
            {!loading && !pageError && reviews.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <Star className="w-12 h-12 text-gray-200" />
                <p className="text-secondary font-medium">No reviews yet</p>
                <p className="text-secondary text-sm">Your menu reviews will appear here once you post them.</p>
                <a href="/restaurants" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline font-medium mt-1">
                  <ExternalLink className="w-4 h-4" /> Browse Restaurants
                </a>
              </div>
            )}
            {!loading && !pageError && paged.length > 0 && (
              <div className="space-y-3">
                {paged.map(r => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    menu={menuMap[r.menu] ?? null}
                    restaurant={restaurantMap[r.restaurant] ?? null}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t mt-4">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-sm text-secondary">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}