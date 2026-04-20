'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;        
}

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: "YOH Restaurant",
    address: "Thamel, Kathmandu, Nepal",
    phone: "+977 9801234567",
    email: "info@yoh.com",
    logo: null,
  });

  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('restaurantSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      if (parsed.logo) setPreviewLogo(parsed.logo);
    }
  }, []);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewLogo(base64);
      setSettings(prev => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Remove Logo
  const handleRemoveLogo = () => {
    setPreviewLogo(null);
    setSettings(prev => ({ ...prev, logo: null }));
  };

  // Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    localStorage.setItem('restaurantSettings', JSON.stringify(settings));
    
    alert('✅ Settings saved successfully!');
    setIsSaving(false);
  };

  return (
<div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
        <div>
        <h2 className="text-3xl font-bold text-[#513012] cinzel">Global Settings</h2>
        <p className="text-gray-600 mt-1">Manage your restaurant profile and branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#513012] cinzel font-bold">Restaurant Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#513012]/20 rounded-2xl p-8">
              {previewLogo || settings.logo ? (
                <div className="relative">
                  <Image
                    src={previewLogo || settings.logo!}
                    alt="Restaurant Logo"
                    width={180}
                    height={180}
                    className="rounded-xl object-contain border border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No logo uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Default profile.png will be used</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button variant="outline" className="border-[#513012] text-[#513012]">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Logo
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#513012] cinzel font-bold">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 cinzel">
            <div className="space-y-2">
              <Label>Restaurant Name</Label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="YOH Restaurant"
              />
            </div>

            <div className="space-y-2">
              <Label>Address / Location</Label>
              <Textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                placeholder="Thamel, Kathmandu, Nepal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+977 9801234567"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="info@yoh.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#513012] hover:bg-[#513012]/90 px-10 py-6 cinzel text-lg"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
          <Save className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}