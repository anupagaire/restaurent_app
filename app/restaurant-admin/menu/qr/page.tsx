// app/restaurant-admin/menu/qr/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';       
import { Plus, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface TableQR {
  tableNumber: number;
  qrCode: string;        // base64 image
  menuLink: string;
}

export default function MenuQRPage() {
  const [tables, setTables] = useState<TableQR[]>([]);
  const [newTableNumber, setNewTableNumber] = useState<number>(1);
  const restaurantId = "rest123"; // In real app, get from auth/context

  const generateQR = async (tableNumber: number) => {
    const menuUrl = `https://yourdomain.com/menu?table=${tableNumber}&rest=${restaurantId}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#513012',
          light: '#ffffff'
        }
      });

      const newQR: TableQR = {
        tableNumber,
        qrCode: qrDataUrl,
        menuLink: menuUrl,
      };

      setTables([...tables, newQR]);
      setNewTableNumber(Math.max(...tables.map(t => t.tableNumber), 0) + 1);
    } catch (error) {
      alert('Failed to generate QR code');
    }
  };

  const downloadQR = (tableNumber: number, qrCode: string) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `Table-${tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteQR = (tableNumber: number) => {
    if (confirm(`Delete QR for Table ${tableNumber}?`)) {
      setTables(tables.filter(t => t.tableNumber !== tableNumber));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#513012]">Table QR Codes</h1>
          <p className="text-gray-600 mt-1">Generate QR codes for tables so customers can scan and view menu</p>
        </div>
      </div>

      {/* Generate New QR Section */}
      <Card className="border-[#513012]/10">
        <CardHeader>
          <CardTitle className="text-[#513012]">Generate New Table QR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                type="number"
                min="1"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(parseInt(e.target.value))}
                className="border-[#513012]/20"
              />
            </div>
            <Button 
              onClick={() => generateQR(newTableNumber)}
              className="bg-[#513012] hover:bg-[#3f260f]"
            >
              <Plus className="mr-2 h-5 w-5" />
              Generate QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List of Generated QRs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.tableNumber} className="border-[#513012]/10 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Table {table.tableNumber}</CardTitle>
                <Badge variant="outline" className="text-[#513012]">
                  QR Ready
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center space-y-6">
              {/* QR Code Display */}
              <div className="p-4 bg-white border-8 border-white shadow-md rounded-xl">
                <img 
                  src={table.qrCode} 
                  alt={`Table ${table.tableNumber} QR`} 
                  className="w-52 h-52"
                />
              </div>

              <div className="text-center text-sm text-gray-500">
                Scan to view menu
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <Button 
                  onClick={() => downloadQR(table.tableNumber, table.qrCode)}
                  className="flex-1 bg-[#513012] hover:bg-[#3f260f]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => deleteQR(table.tableNumber)}
                  className="flex-1 text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>

              <div className="text-xs text-gray-400 break-all text-center px-2">
                {table.menuLink}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card>
          <CardContent className="text-center py-16 text-gray-500">
            <QrCode className="mx-auto h-16 w-16 mb-4 text-gray-300" />
            <p>No QR codes generated yet.</p>
            <p className="text-sm mt-1">Create QR codes for your tables above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}