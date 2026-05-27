'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useRequirePermission } from '@/hooks/usePermission';
import { Download, QrCode, RefreshCw, AlertTriangle, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import SubscriptionGuard from '@/components/restaurant-admin/SubscriptionGuard';

interface MenuToken {
  id: number;
  restaurant: number;
  raw_token?: string;
  menu_url?: string;
  photos: { id: number; photo_url: string }[];
  is_active: boolean;
  expires_at: string | null;
  created_on: string;
}

function GenerateConfirmDialog({
  tokenCount,
  onConfirm,
  onCancel,
}: {
  tokenCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(30,15,2,0.6)', backdropFilter: 'blur(3px)' }}
        onClick={onCancel}
      />

      <div
        className="fixed z-50 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
        style={{
          background: '#fffdf8',
          border: '1px solid rgba(184,147,106,0.3)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4"
          style={{ color: '#9a7458', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: '#fff3cd' }}
          >
            <AlertTriangle size={28} style={{ color: '#b8860b' }} />
          </div>
        </div>

        <h2
          className="text-center font-bold text-xl mb-2"
          style={{ color: '#513012', fontFamily: 'Georgia, serif' }}
        >
          Generate New QR Code?
        </h2>

        <div className="flex items-center gap-2 my-3">
          <div className="h-px flex-1" style={{ background: 'rgba(184,147,106,0.3)' }} />
          <span style={{ color: '#b8936a', fontSize: 12 }}>⚠️</span>
          <div className="h-px flex-1" style={{ background: 'rgba(184,147,106,0.3)' }} />
        </div>

        <div
          className="rounded-xl p-4 mb-5 text-sm text-center space-y-2"
          style={{ background: '#fef9ec', border: '1px solid rgba(184,147,106,0.25)', color: '#7a5c3a' }}
        >
          {tokenCount > 0 ? (
            <>
              <p>
                You already have{' '}
                <strong style={{ color: '#513012' }}>{tokenCount} QR code{tokenCount > 1 ? 's' : ''}</strong>{' '}
                .
              </p>
              <p>
                So if you generate QR {' '}
                <strong style={{ color: '#c0392b' }}>you must print QR again at </strong>{' '}
                all table.
              </p>
            </>
          ) : (
            <p>
              This will generate new QR.
            </p>
          )}
        </div>

        {/* Reminder box */}
        <div
          className="rounded-xl p-3 mb-5 text-xs"
          style={{ background: '#fdf0f0', border: '1px solid rgba(192,57,43,0.2)', color: '#922b21' }}
        >
          <p className="font-bold mb-1">📋 Remember:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Replace QR at all table if you click generate</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold text-sm"
            style={{
              background: 'transparent',
              border: '1.5px solid rgba(184,147,106,0.5)',
              color: '#9a7458',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{
              background: '#513012',
              color: '#fdf6ec',
              border: 'none',
              cursor: 'pointer',
            }}
          >
           Ok, Generate!
          </button>
        </div>
      </div>
    </>
  );
}
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
export default function QRMenuPage() {
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [tokens, setTokens] = useState<MenuToken[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useRequirePermission('menuSettings');

  const fetchRestaurantId = async () => {
  try {
    const res = await apiFetch('/api/v1/user/me/');
    const raw = await res.json();
    const user = raw.data ?? raw; // ← fix
    if (user?.restaurant) setRestaurantId(user.restaurant);
  } catch (err) {
    console.error('Failed to fetch user:', err);
  }
};

 const fetchTokens = async () => {
  try {
    const res = await apiFetch('/api/v1/menu-tokens/my_tokens/');
    if (!res.ok) {
      setTokens([]);
      return; // silent fail
    }
    const data = await res.json();
    const list: MenuToken[] = Array.isArray(data) ? data : data.results ?? [];
    setTokens(list);
  } catch (err) {
    setTokens([]);
  } finally {
    setLoading(false); // ← always
  }
};

  useEffect(() => { fetchRestaurantId(); }, []);
useEffect(() => { 
  if (restaurantId !== null) {
    fetchTokens();
  } else {
    // restaurantId null bhaye pani loading false gara
    setLoading(false);
  }
}, [restaurantId]);
  const getMenuUrl = (tokenItem: MenuToken): string => {
    if (tokenItem.menu_url?.includes('/menu/')) return tokenItem.menu_url;
    if (tokenItem.raw_token) return `${window.location.origin}/menu/${restaurantId}?token=${tokenItem.raw_token}`;
    const saved = localStorage.getItem(`qr_token_url_${tokenItem.id}`);
    if (saved) return saved;
    console.warn(`Token #${tokenItem.id}: no raw_token found, falling back to ID`);
    return `${window.location.origin}/menu/${restaurantId}?token=${tokenItem.id}`;
  };

  // Called when user clicks "Generate QR Code" button
  const handleGenerateClick = () => {
    setShowConfirm(true);
  };

  // Called when user confirms in dialog
  const handleConfirmedGenerate = async () => {
    setShowConfirm(false);
    if (!restaurantId) return;
    setGenerating(true);
    try {
      const res = await apiFetch('/api/v1/menu-tokens/generate_token/', {
        method: 'POST',
        body: JSON.stringify({ restaurant_id: restaurantId }),
      });
      if (!res.ok) throw new Error('Generation failed');

      const newToken: MenuToken = await res.json();
      console.log('✅ Generated token:', newToken);

      const frontendMenuUrl = `${window.location.origin}/menu/${restaurantId}?token=${newToken.raw_token}`;
      console.log('✅ Frontend QR URL:', frontendMenuUrl);

      localStorage.setItem(`qr_token_url_${newToken.id}`, frontendMenuUrl);

      const tokenWithFrontendUrl = { ...newToken, menu_url: frontendMenuUrl };
      await saveQRImageForToken(tokenWithFrontendUrl);
      await fetchTokens();
    } catch (err) {
      console.error(err);
      alert('Failed to generate QR token. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const saveQRImageForToken = async (token: MenuToken): Promise<void> => {
    return new Promise((resolve) => {
      const menuUrl = token.menu_url!;
      const CANVAS_SIZE = 400;

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      const { createRoot } = require('react-dom/client');
      const root = createRoot(tempDiv);
      root.render(
        <QRCode
          id={`qr-temp-${token.id}`}
          value={menuUrl}
          size={CANVAS_SIZE}
          bgColor="#ffffff"
          fgColor="#1e0f02"
        />
      );

      setTimeout(() => {
        const svgNode = tempDiv.querySelector('svg');
        if (!svgNode) {
          root.unmount();
          document.body.removeChild(tempDiv);
          resolve();
          return;
        }

        const svgData = new XMLSerializer().serializeToString(svgNode);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const ctx = canvas.getContext('2d')!;

        const img = new Image();
        img.onload = async () => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
          ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
          URL.revokeObjectURL(svgUrl);
          root.unmount();
          document.body.removeChild(tempDiv);

          canvas.toBlob(async (blob) => {
            if (!blob) { resolve(); return; }
            try {
              const formData = new FormData();
              formData.append('object_id', String(token.id));
              formData.append('type', 'qr');
              formData.append('photo', blob, `qr-${token.id}.png`);
              formData.append('id', String(token.id));

              const photoRes = await apiFetch('/api/v1/photo/', {
                method: 'POST',
                body: formData,
              });

              if (!photoRes.ok) {
                console.warn('QR photo save failed:', await photoRes.text());
              } else {
                console.log('✅ QR image saved:', await photoRes.json());
              }
            } catch (e) {
              console.warn('QR photo upload error:', e);
            }
            resolve();
          }, 'image/png');
        };
        img.onerror = () => {
          root.unmount();
          document.body.removeChild(tempDiv);
          resolve();
        };
        img.src = svgUrl;
      }, 100);
    });
  };

  const downloadQR = (token: MenuToken) => {
    const menuUrl = getMenuUrl(token);
    const svgEl = document.getElementById(`qr-svg-${token.id}`) as SVGSVGElement | null;
    if (!svgEl) return;

    const CANVAS_W = 600;
    const CANVAS_H = 720;
    const QR_SIZE = 400;
    const QR_X = (CANVAS_W - QR_SIZE) / 2;
    const QR_Y = 130;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#fffdf8';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#513012';
      ctx.fillRect(0, 0, CANVAS_W, 8);
      ctx.fillRect(0, CANVAS_H - 8, CANVAS_W, 8);
      ctx.fillStyle = '#513012';
      ctx.font = 'bold 34px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(restaurantName || 'Restaurant Menu', CANVAS_W / 2, 65);
      ctx.fillStyle = '#b8936a';
      ctx.font = '16px Georgia, serif';
      ctx.fillText('Scan QR Code to View Our Menu', CANVAS_W / 2, 95);
      ctx.strokeStyle = '#d4b896';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 112);
      ctx.lineTo(CANVAS_W - 60, 112);
      ctx.stroke();
      const padding = 16;
      roundRect(ctx, QR_X - padding, QR_Y - padding, QR_SIZE + padding * 2, QR_SIZE + padding * 2, 16);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(81,48,18,0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.drawImage(img, QR_X, QR_Y, QR_SIZE, QR_SIZE);
      ctx.fillStyle = '#9a7458';
      ctx.font = '13px Lato, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`QR Token #${token.id}`, CANVAS_W / 2, QR_Y + QR_SIZE + 36);
      ctx.strokeStyle = '#d4b896';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, CANVAS_H - 60);
      ctx.lineTo(CANVAS_W - 60, CANVAS_H - 60);
      ctx.stroke();
      ctx.fillStyle = '#c9a87a';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText('Scan to view our menu', CANVAS_W / 2, CANVAS_H - 38);
      const link = document.createElement('a');
      link.download = `QR-Token-${token.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      {/* ── Confirmation Dialog ── */}
      {showConfirm && (
        <GenerateConfirmDialog
          tokenCount={tokens.length}
          onConfirm={handleConfirmedGenerate}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="px-4 sm:px-6 py-8 space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            QR Menu Codes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate QR codes for your tables. Customers scan to view your menu instantly.
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: '#513012' }}>Generate New QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-gray-600 flex-1">
              Each QR code links directly to your restaurant menu via a secure token. Print and place on tables.
            </p>
            <Button
              onClick={handleGenerateClick}
              disabled={generating || !restaurantId}
              size="lg"
              className="whitespace-nowrap"
              style={{ background: '#513012', color: 'white' }}
            >
              {generating ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><QrCode className="mr-2 h-5 w-5" /> Generate QR Code</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#513012' }}>
              Your QR Codes {!loading && `(${tokens.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 animate-spin"
                  style={{ borderColor: '#b8936a', borderTopColor: 'transparent' }} />
              </div>
            )}

            {!loading && tokens.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <QrCode className="mx-auto mb-3 h-12 w-12 opacity-30" />
                <p>No QR codes yet. Generate your first one above.</p>
              </div>
            )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {tokens.map((token) => {
    const menuUrl = getMenuUrl(token);

    return (
      <SubscriptionGuard key={token.id}>
        <div
          className="rounded-2xl overflow-hidden border flex flex-col"
          style={{
            borderColor: 'rgba(184,147,106,0.3)',
            background: '#fffdf8',
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: '#513012' }}
          >
            <span
              className="text-white font-semibold text-sm"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Token #{token.id}
            </span>

            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                token.is_active
                  ? 'bg-green-400 text-green-900'
                  : 'bg-red-300 text-red-900'
              }`}
            >
              {token.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex justify-center items-center p-6 bg-white">
            <div
              className="p-3 rounded-xl"
              style={{
                border: '2px solid rgba(184,147,106,0.25)',
                background: 'white',
              }}
            >
              <QRCode
                id={`qr-svg-${token.id}`}
                value={menuUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#1e0f02"
              />
            </div>
          </div>

          <div className="px-4 pb-2">
            <p className="text-xs text-center text-gray-400 italic">
              Secure QR — scan to open menu
            </p>

            <p
              className="text-xs text-center mt-1"
              style={{ color: '#c0a080' }}
            >
              Created {formatDate(token.created_on)}
            </p>
          </div>

          <div className="px-4 pb-4 pt-2">
            <Button
              onClick={() => downloadQR(token)}
              className="w-full"
              variant="outline"
              style={{
                borderColor: '#513012',
                color: '#513012',
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download for Printing
            </Button>
          </div>
        </div>
      </SubscriptionGuard>
    );
  })}</div>
     
</CardContent>
        </Card>
      </div>
    </>
  );
}