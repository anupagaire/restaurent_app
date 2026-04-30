'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Download, QrCode, Loader2, Copy, RefreshCw, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface TokenResponse {
  id: number;
  restaurant: number;
  is_active: boolean;
  expires_at: string | null;
  menu_url: string;
  created_on: string;
}

interface Restaurant {
  id: number;
  name: string;
  photos?: { id: number; photo: string }[];
}

const STORAGE_KEY = 'qr_menu_token_data';

export default function QRGenerator() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchRestaurantId = async (): Promise<number> => {
    const res = await apiFetch('/api/v1/user/me/');
    if (!res.ok) throw new Error(`Failed to fetch user (${res.status})`);
    const user = await res.json();
    if (!user?.restaurant) throw new Error('No restaurant linked to this account.');
    return user.restaurant;
  };

  const fetchRestaurant = async (id: number): Promise<Restaurant> => {
    const res = await apiFetch(`/api/v1/restaurant/${id}/`);
    if (!res.ok) throw new Error(`Failed to fetch restaurant (${res.status})`);
    return res.json();
  };

  // Backend menu_url bata frontend URL banau (token extract garera)
  const toFrontendUrl = (backendMenuUrl: string): string => {
    try {
      const url = new URL(backendMenuUrl);
      const token = url.searchParams.get('token');
      const match = url.pathname.match(/\/qr-menu\/(\d+)/);
      const id = match?.[1];
      if (id && token) {
        return `${window.location.origin}/menu/${id}?token=${token}`;
      }
      // Token chhaina URL ma — raw URL return
      return backendMenuUrl;
    } catch {
      return backendMenuUrl;
    }
  };

  const generateQRCode = async (url: string, logoUrl?: string) => {
    const baseQr = await QRCode.toDataURL(url, {
      width: 520,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#513012', light: '#FFFFFF' },
    });

    if (!logoUrl) {
      setQrDataUrl(baseQr);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { setQrDataUrl(baseQr); return; }

    const size = 520;
    canvas.width = size;
    canvas.height = size;

    const qrImg = new window.Image();
    await new Promise<void>((res, rej) => {
      qrImg.onload = () => res();
      qrImg.onerror = rej;
      qrImg.src = baseQr;
    });
    ctx.drawImage(qrImg, 0, 0, size, size);

    const logoLoaded = await new Promise<boolean>((res) => {
      const testImg = new window.Image();
      testImg.crossOrigin = 'anonymous';
      testImg.onload = () => res(true);
      testImg.onerror = () => res(false);
      testImg.src = logoUrl;
    });

    if (!logoLoaded) { setQrDataUrl(canvas.toDataURL('image/png')); return; }

    const cx = size / 2, cy = size / 2, logoSize = 100;
    ctx.beginPath();
    ctx.arc(cx, cy, logoSize / 2 + 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    const logoImg = new window.Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = logoUrl;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
    ctx.restore();

    setQrDataUrl(canvas.toDataURL('image/png'));
  };

  // POST garo — generate_token le token-wala URL diracha
  const callGenerateToken = async (restaurantId: number): Promise<string> => {
    const res = await apiFetch('/api/v1/menu-tokens/generate_token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant_id: restaurantId }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.detail || `Server error ${res.status}`);
    }
    const data: TokenResponse = await res.json();
    if (!data.menu_url) throw new Error('No menu_url returned.');
    
    // Token URL ma cha ki chhaina check
    const frontendUrl = toFrontendUrl(data.menu_url);
    console.log('✅ Backend menu_url:', data.menu_url);
    console.log('✅ Frontend URL:', frontendUrl);
    
    // LocalStorage ma save garo — refresh ma same raahos
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tokenId: data.id,
      frontendUrl,
      restaurantId,
      savedAt: new Date().toISOString(),
    }));
    
    return frontendUrl;
  };

  // LocalStorage bata saved URL check garo
  const getSavedUrl = (restaurantId: number): string | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Same restaurant ko token cha ki?
      if (parsed.restaurantId !== restaurantId) return null;
      // URL ma token cha ki?
      if (!parsed.frontendUrl.includes('token=')) return null;
      return parsed.frontendUrl;
    } catch {
      return null;
    }
  };

  const initQR = async (r: Restaurant, forceNew = false) => {
    // 1. LocalStorage ma token-wala URL cha?
    if (!forceNew) {
      const savedUrl = getSavedUrl(r.id);
      if (savedUrl) {
        console.log('📦 Using saved URL:', savedUrl);
        setMenuUrl(savedUrl);
        await generateQRCode(savedUrl, r.photos?.[0]?.photo);
        setLoading(false);
        setGenerating(false);
        return;
      }
    }

    // 2. Chhaina bhane naya generate garo
    console.log('🔄 Generating new token...');
    const frontendUrl = await callGenerateToken(r.id);
    setMenuUrl(frontendUrl);
    await generateQRCode(frontendUrl, r.photos?.[0]?.photo);
    setLoading(false);
    setGenerating(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        const restaurantId = await fetchRestaurantId();
        const r = await fetchRestaurant(restaurantId);
        setRestaurant(r);
        await initQR(r, false);
      } catch (err: any) {
        console.error('Init error:', err);
        setError(err.message || 'Failed to load.');
        setLoading(false);
      }
    };
    init();
  }, []);

  // "Generate New Token" button — localStorage clear garera naya banaucha
  const handleGenerateNew = async () => {
    if (!restaurant) return;
    setError('');
    setGenerating(true);
    try {
      localStorage.removeItem(STORAGE_KEY); // Purano clear
      await initQR(restaurant, true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate new token.');
      setGenerating(false);
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${(restaurant?.name || 'restaurant').replace(/\s+/g, '-')}-QR.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyUrl = async () => {
    if (!menuUrl) return;
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-[#513012]">
          <QrCode className="w-6 h-6" />
          Table QR Code Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          {restaurant?.name ? `For ${restaurant.name}` : 'Customers scan to view menu'}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        {loading && (
          <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-12 h-12 animate-spin text-[#513012]" />
            <p className="text-sm text-gray-400">Loading QR code...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg w-full">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Error</p>
              <p className="text-sm mt-0.5">{error}</p>
              <button onClick={handleGenerateNew} className="text-xs underline mt-2">Try again</button>
            </div>
          </div>
        )}

        {!loading && qrDataUrl && (
          <div className="bg-white p-5 rounded-2xl shadow-inner border">
            <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 rounded-xl" />
          </div>
        )}

        {menuUrl && (
          <div className="text-xs text-gray-500 break-all text-center px-4 py-3 bg-gray-50 rounded-lg border w-full font-mono">
            {menuUrl}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3 w-full">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={copyUrl} variant="outline" disabled={!menuUrl}>
                {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy URL'}
              </Button>
              <Button onClick={downloadQR} disabled={!qrDataUrl} className="bg-[#513012] hover:bg-[#513012]/90 text-white">
                <Download className="mr-2 h-4 w-4" /> Download QR
              </Button>
            </div>

            <Button
              onClick={handleGenerateNew}
              disabled={generating}
              variant="ghost"
              className="text-[#513012]"
            >
              {generating
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <RefreshCw className="mr-2 h-4 w-4" />}
              Generate New Token (Invalidate Old)
            </Button>
          </div>
        )}

        <p className="text-xs text-center text-gray-400">
          Print this QR and place on tables. Scan to view menu.
        </p>
      </CardContent>
    </Card>
  );
}