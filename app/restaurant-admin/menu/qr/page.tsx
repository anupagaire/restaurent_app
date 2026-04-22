'use client';

/**
 
 * Dependencies to install:
 *   npm install qrcode jspdf html2canvas
 *   npm install --save-dev @types/qrcode
 */

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, QrCode, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ─── Types ──────────────────────────────────────────────── */
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isVeg: boolean;
}

interface Restaurant {
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
}

interface Props {
  menuItems?: MenuItem[];
  categories?: string[];
  restaurant?: Restaurant;
  menuUrl?: string;
}

/* ─── Demo data (remove when wiring real props) ─────────── */
const DEMO_RESTAURANT: Restaurant = {
  name: 'Spice Garden',
  logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SG&backgroundColor=513012&textColor=ffffff',
  address: 'Thamel, Kathmandu',
  phone: '+977-9800000000',
};

const DEMO_MENU: MenuItem[] = [
  { id: 1, name: 'Butter Chicken', description: 'Tender chicken in rich tomato-cream gravy', price: 420, category: 'Main Course', isAvailable: true, isVeg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae784?w=80&h=80&fit=crop' },
  { id: 2, name: 'Paneer Butter Masala', description: 'Cottage cheese in silky tomato gravy', price: 380, category: 'Main Course', isAvailable: true, isVeg: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=80&h=80&fit=crop' },
  { id: 3, name: 'Veg Biryani', description: 'Fragrant basmati with seasonal vegetables', price: 320, category: 'Rice & Biryani', isAvailable: true, isVeg: true },
  { id: 4, name: 'Chicken Biryani', description: 'Slow-cooked dum biryani with whole spices', price: 450, category: 'Rice & Biryani', isAvailable: true, isVeg: false },
  { id: 5, name: 'Garlic Naan', description: 'Soft leavened bread with garlic & butter', price: 80, category: 'Breads', isAvailable: true, isVeg: true },
  { id: 6, name: 'Tandoori Roti', description: 'Whole wheat bread from the clay oven', price: 50, category: 'Breads', isAvailable: true, isVeg: true },
  { id: 7, name: 'Mango Lassi', description: 'Chilled yogurt with Alphonso mango', price: 120, category: 'Beverages', isAvailable: true, isVeg: true },
  { id: 8, name: 'Masala Chai', description: 'Spiced milk tea, brewed strong', price: 60, category: 'Beverages', isAvailable: true, isVeg: true },
  { id: 9, name: 'Gulab Jamun', description: 'Soft milk-solid dumplings in rose syrup', price: 140, category: 'Desserts', isAvailable: true, isVeg: true },
];

const DEMO_CATEGORIES = ['Main Course', 'Rice & Biryani', 'Breads', 'Beverages', 'Desserts'];
const DEMO_URL = 'http://localhost:3000/menu/spice-garden';

/* ─── Component ─────────────────────────────────────────── */
export default function QRMenuPage({
  menuItems = DEMO_MENU,
  categories = DEMO_CATEGORIES,
  restaurant = DEMO_RESTAURANT,
  menuUrl = DEMO_URL,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [qrDone, setQrDone] = useState(false);

  // Only available items
  const availableItems = menuItems.filter((i) => i.isAvailable);

  // Group by category
  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    const items = availableItems.filter((i) => i.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  // Generate QR on mount / menuUrl change
  useEffect(() => {
    QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#513012', light: '#ffffff' },
    }).then(setQrDataUrl);
  }, [menuUrl]);

  /* ── Download QR as PNG ── */
  const downloadQR = async () => {
    if (!qrDataUrl) return;
    setQrLoading(true);
    const link = document.createElement('a');
    link.download = `${restaurant.name.replace(/\s+/g, '-')}-QR.png`;
    link.href = qrDataUrl;
    link.click();
    setQrLoading(false);
    setQrDone(true);
    setTimeout(() => setQrDone(false), 2500);
  };

  /* ── Download Menu as PDF ── */
  const downloadPDF = async () => {
    if (!menuRef.current) return;
    setPdfLoading(true);

    try {
      const canvas = await html2canvas(menuRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fffaf5',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      const pageH = pdf.internal.pageSize.getHeight();

      // Multi-page support
      let yOffset = 0;
      while (yOffset < pdfH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfW, pdfH);
        yOffset += pageH;
      }

      pdf.save(`${restaurant.name.replace(/\s+/g, '-')}-Menu.pdf`);
      setPdfDone(true);
      setTimeout(() => setPdfDone(false), 2500);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] px-4 sm:px-8 py-8 space-y-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#513012]">QR & Menu PDF</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate a scannable QR for table cards and download the latest menu as PDF.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Download QR */}
          <Button
            onClick={downloadQR}
            disabled={qrLoading || !qrDataUrl}
            variant="outline"
            className="border-[#513012] text-[#513012] hover:bg-[#513012]/10 flex items-center gap-2"
          >
            {qrLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : qrDone ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <QrCode className="w-4 h-4" />
            )}
            {qrDone ? 'Downloaded!' : 'Download QR'}
          </Button>

          {/* Download PDF */}
          <Button
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="bg-[#513012] hover:bg-[#513012]/90 text-white flex items-center gap-2"
          >
            {pdfLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : pdfDone ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {pdfLoading ? 'Generating…' : pdfDone ? 'Downloaded!' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* ── Two-column layout: QR card + Menu preview ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── QR Card ── */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-3xl shadow-md border border-[#513012]/10 p-6 flex flex-col items-center gap-4 sticky top-8">
            <h2 className="text-lg font-semibold text-[#513012]">Table QR Code</h2>
            <p className="text-xs text-gray-400 text-center">
              Print and place this on every table. Customers scan to view the menu instantly.
            </p>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Menu QR Code"
                className="w-48 h-48 rounded-xl border border-[#513012]/20"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
              </div>
            )}

            <div className="text-center">
              <p className="text-xs font-medium text-[#513012]">{restaurant.name}</p>
              <p className="text-xs text-gray-400 break-all">{menuUrl}</p>
            </div>

            <Button
              onClick={downloadQR}
              disabled={!qrDataUrl}
              size="sm"
              className="w-full bg-[#513012] hover:bg-[#513012]/90 text-white"
            >
              <Download className="w-3 h-3 mr-2" />
              Save QR as PNG
            </Button>
          </div>
        </div>

        {/* ── Menu Preview (this is what gets PDF'd) ── */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest">
            Menu Preview — this is exactly what will be exported to PDF
          </p>

          {/* The ref wraps everything that goes into the PDF */}
          <div
            ref={menuRef}
            className="bg-white rounded-3xl shadow-md border border-[#513012]/10 overflow-hidden"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {/* ── Restaurant Header ── */}
            <div
              className="relative flex flex-col items-center py-10 px-6 text-white text-center"
              style={{ background: 'linear-gradient(135deg, #513012 0%, #8B4513 60%, #c97d3a 100%)' }}
            >
              {/* Decorative rings */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border-[40px] border-white/5" />
                <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full border-[40px] border-white/5" />
              </div>

              {/* Logo */}
              {restaurant.logoUrl ? (
                <img
                  src={restaurant.logoUrl}
                  alt="logo"
                  crossOrigin="anonymous"
                  className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg mb-4 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-bold mb-4">
                  {restaurant.name[0]}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                {restaurant.name}
              </h1>

              {(restaurant.address || restaurant.phone) && (
                <p className="text-white/70 text-sm mt-2">
                  {[restaurant.address, restaurant.phone].filter(Boolean).join('  •  ')}
                </p>
              )}

              <div className="mt-4 px-6 py-1 rounded-full border border-white/30 text-xs tracking-widest uppercase text-white/80">
                Menu
              </div>
            </div>

            {/* ── Menu Sections ── */}
            <div className="px-6 sm:px-10 py-8 space-y-10">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  {/* Category heading */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-[#513012]/15" />
                    <h2
                      className="text-lg font-semibold tracking-widest uppercase text-[#513012] px-2"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {category}
                    </h2>
                    <div className="h-px flex-1 bg-[#513012]/15" />
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0"
                      >
                        {/* Veg / Non-veg dot */}
                        <div className="mt-1 shrink-0">
                          <div
                            className="w-4 h-4 rounded-sm border-2 flex items-center justify-center"
                            style={{
                              borderColor: item.isVeg ? '#16a34a' : '#dc2626',
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.isVeg ? '#16a34a' : '#dc2626' }}
                            />
                          </div>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800 text-base">
                              {item.name}
                            </span>
                            <span className="font-bold text-[#513012] shrink-0">
                              Rs. {item.price}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-gray-500 text-sm mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Thumbnail */}
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            crossOrigin="anonymous"
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footer inside PDF */}
              <div className="pt-6 border-t border-[#513012]/10 text-center space-y-1">
                <p className="text-xs text-gray-400 tracking-widest uppercase">
                  All prices are inclusive of taxes
                </p>
                <p className="text-xs text-gray-300">{restaurant.name} · {restaurant.address}</p>
              </div>
            </div>
          </div>
          {/* end menuRef */}
        </div>
      </div>
    </div>
  );
}