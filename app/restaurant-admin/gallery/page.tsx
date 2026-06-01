'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Photo {
  id: number;
  object_id: number;
  purpose: string;
  alt: string;
  photo_url: string;
}

export default function GalleryAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
    setRestaurantId(localStorage.getItem('restaurant_id'));
  }, []);

  useEffect(() => {
    if (!token || !restaurantId) return;
    fetchPhotos();
  }, [token, restaurantId]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/photo/?type=restaurant&object_id=${restaurantId}&purpose=gallery&page_size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      const list: Photo[] = Array.isArray(data) ? data : data.results ?? [];
      // filter to only this restaurant's gallery photos
      setPhotos(list.filter(p => String(p.object_id) === restaurantId && p.purpose === 'gallery'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !restaurantId) return;
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('type', 'restaurant');
      formData.append('object_id', restaurantId);
      formData.append('purpose', 'gallery');
      formData.append('alt', altText || 'Gallery photo');
      formData.append('photo', selectedFile);

      const res = await fetch(`${BASE_URL}/api/v1/photo/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      setMessage('✓ Photo uploaded!');
      setSelectedFile(null);
      setPreview(null);
      setAltText('');
      if (fileRef.current) fileRef.current.value = '';
      await fetchPhotos();
    } catch (err: any) {
      setMessage(`✗ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this photo?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/photo/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPhotos(prev => prev.filter(p => p.id !== id));
        setMessage('✓ Deleted.');
      } else {
        setMessage('✗ Failed to delete.');
      }
    } catch {
      setMessage('✗ Network error.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[#513012]">Restaurant Gallery</h1>

      {/* ── UPLOAD ── */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-lg">Upload New Photo</h2>

        {/* File picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#513012]/40 hover:bg-[#513012]/5 transition"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400">Click to select a photo</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Alt text */}
        <div>
          <label className="block text-sm font-medium mb-1">Alt Text (optional)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
            placeholder="e.g. Restaurant interior"
            value={altText}
            onChange={e => setAltText(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 bg-[#513012] text-white px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
          {message && (
            <span className={`text-sm font-medium ${message.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </span>
          )}
        </div>
      </section>

      {/* ── GALLERY GRID ── */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Gallery Photos ({photos.length})</h2>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : photos.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center gap-3 text-gray-400">
            <ImageIcon className="w-10 h-10" />
            <p className="text-sm">No gallery photos yet. Upload one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={photo.photo_url}
                  alt={photo.alt || 'Gallery'}
                  className="w-full h-36 object-cover"
                />
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {/* Alt label */}
                {photo.alt && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                    <p className="text-white text-xs truncate">{photo.alt}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}