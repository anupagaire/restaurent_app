'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Loader2, User, Lock, Shield } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SimpleRole {
  id: number;
  name: string;
}

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_no: string;
  address: string;
  roles?: SimpleRole[];
  avatar: string | null;
  restaurant: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${
      isSuccess ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {isSuccess
        ? <CheckCircle2 className="w-5 h-5 shrink-0" />
        : <AlertCircle className="w-5 h-5 shrink-0" />}
      {msg}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [profile, setProfile] = useState({
    email: '', first_name: '', last_name: '', contact_no: '', address: '',
  });
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError,   setProfileError]   = useState('');

  // Password form — uses separate endpoint
  const [pw, setPw] = useState({ password1: '', confirm: '' });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError,   setPwError]   = useState('');

  // ── Load user ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await apiFetch('/api/v1/user/me/');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail ?? 'Failed to load profile');
        setUser(data);
        setProfile({
          email:      data.email      ?? '',
          first_name: data.first_name ?? '',
          last_name:  data.last_name  ?? '',
          contact_no: data.contact_no ?? '',
          address:    data.address    ?? '',
        });
      } catch (e: any) {
        setProfileError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Save profile ───────────────────────────────────────────────────────────
  // Only send fields the API accepts on PATCH /user/me/
  // Do NOT send: roles (read-only), avatar (separate upload), restaurant
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await apiFetch('/api/v1/user/me/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:      profile.email,
          first_name: profile.first_name,
          last_name:  profile.last_name,
          contact_no: profile.contact_no || null,
          address:    profile.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail ?? data?.email?.[0] ?? JSON.stringify(data));
      setProfileSuccess('Profile updated successfully!');
      // Update local storage user
      const stored = localStorage.getItem('user');
      if (stored) {
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...data }));
      }
    } catch (e: any) {
      setProfileError(e.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  // Backend uses password1 field — check if /user/me/ PATCH accepts it
  // If your backend has a separate /api/v1/user/change-password/ endpoint use that instead
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (pw.password1.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (pw.password1 !== pw.confirm) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      // Try PATCH /user/me/ with password1 first
      // If backend rejects it, it means there's a separate change-password endpoint
      const res = await apiFetch('/api/v1/user/me/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password1: pw.password1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail ?? data?.password1?.[0] ?? JSON.stringify(data));
      setPwSuccess('Password updated successfully!');
      setPw({ password1: '', confirm: '' });
    } catch (e: any) {
      setPwError(e.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-[#513012]" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#513012]">Account Settings</h1>
        <p className="text-gray-500 mt-1">Update your profile and password</p>
      </div>

      {/* Roles display — read-only info card */}
      {user && (user.roles ?? []).length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: '#f8f4f0', border: '1px solid rgba(184,147,106,0.3)' }}>
          <Shield className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#513012' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#513012' }}>Your Role</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {(user.roles ?? []).map(r => (
                <span key={r.id}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#513012', color: '#fff' }}>
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#513012]">
            <User className="w-5 h-5" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileSuccess && <div className="mb-4"><Alert type="success" msg={profileSuccess} /></div>}
          {profileError   && <div className="mb-4"><Alert type="error"   msg={profileError}   /></div>}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile.first_name}
                  onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                  placeholder="First name" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile.last_name}
                  onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                  placeholder="Last name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" value={profile.email} required
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                placeholder="your@email.com" />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={profile.contact_no}
                onChange={e => setProfile({ ...profile, contact_no: e.target.value })}
                placeholder="+977 98XXXXXXXX" />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                placeholder="Your address" />
            </div>

            <Button type="submit" disabled={profileSaving}
              className="w-full bg-[#513012] hover:bg-[#513012]/90">
              {profileSaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Password Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#513012]">
            <Lock className="w-5 h-5" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pwSuccess && <div className="mb-4"><Alert type="success" msg={pwSuccess} /></div>}
          {pwError   && <div className="mb-4"><Alert type="error"   msg={pwError}   /></div>}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password <span className="text-red-500">*</span></Label>
              <Input type="password" value={pw.password1} required
                onChange={e => setPw({ ...pw, password1: e.target.value })}
                placeholder="Min 8 characters" />
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password <span className="text-red-500">*</span></Label>
              <Input type="password" value={pw.confirm} required
                onChange={e => setPw({ ...pw, confirm: e.target.value })}
                placeholder="Repeat new password" />
              {pw.confirm && pw.confirm !== pw.password1 && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {pw.confirm && pw.confirm === pw.password1 && pw.password1.length >= 8 && (
                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
              )}
            </div>

            <Button type="submit"
              disabled={pwSaving || pw.password1 !== pw.confirm || pw.password1.length < 8}
              className="w-full bg-[#513012] hover:bg-[#513012]/90">
              {pwSaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}