'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';   // ← replaces fetch on mount
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';

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

export default function CustomerProfilePage() {
  const { user, loading, updateUser } = useUser();
  const [profile, setProfile] = useState({
    email: '', first_name: '', last_name: '', contact_no: '', address: '',
  });
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError,   setProfileError]   = useState('');

  const [pw, setPw]           = useState({ password1: '', confirm: '' });
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError,   setPwError]   = useState('');

  // Sync form when context user loads
  useEffect(() => {
    if (user) {
      setProfile({
        email:      user.email      ?? '',
        first_name: user.first_name ?? '',
        last_name:  user.last_name  ?? '',
        contact_no: user.contact_no ?? '',
        address:    user.address    ?? '',
      });
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await apiFetch('/api/v1/user/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          email:      profile.email,
          first_name: profile.first_name,
          last_name:  profile.last_name,
          contact_no: profile.contact_no || null,
          address:    profile.address,
        }),
      });
      const raw  = await res.json();
      if (!res.ok) throw new Error(raw?.detail ?? JSON.stringify(raw));
      const data = raw.data ?? raw;

      // ← Update context so Dashboard/Sidebar name updates instantly, no refetch
      updateUser(data);

      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    if (pw.password1.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (pw.password1 !== pw.confirm) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      const res = await apiFetch('/api/v1/user/me/', {
        method: 'PATCH',
        body: JSON.stringify({ password1: pw.password1 }),
      });
      const raw = await res.json();
      if (!res.ok) throw new Error(raw?.detail ?? raw?.password1?.[0] ?? JSON.stringify(raw));
      setPwSuccess('Password updated successfully!');
      setPw({ password1: '', confirm: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-secondary" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary">My Profile</h1>
        <p className="text-secondary mt-1 text-sm">Manage your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary text-lg">
            <User className="w-5 h-5" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileSuccess && <Alert type="success" msg={profileSuccess} />}
          {profileError   && <Alert type="error"   msg={profileError}   />}
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} placeholder="First name" />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} placeholder="Last name" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" required value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={profile.contact_no} onChange={e => setProfile({ ...profile, contact_no: e.target.value })} placeholder="+977 98XXXXXXXX" />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Your address" />
            </div>
            <Button type="submit" disabled={profileSaving} className="w-full bg-secondary hover:bg-secondary">
              {profileSaving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving…</> : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary text-lg">
            <Lock className="w-5 h-5" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwSuccess && <Alert type="success" msg={pwSuccess} />}
          {pwError   && <Alert type="error"   msg={pwError}   />}
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-1">
              <Label>New Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type={showPw1 ? 'text' : 'password'} required value={pw.password1} placeholder="Min 8 characters"
                  onChange={e => setPw({ ...pw, password1: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowPw1(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-gray-600">
                  {showPw1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Confirm New Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type={showPw2 ? 'text' : 'password'} required value={pw.confirm} placeholder="Repeat new password"
                  onChange={e => setPw({ ...pw, confirm: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowPw2(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-gray-600">
                  {showPw2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pw.confirm && pw.confirm !== pw.password1 && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              {pw.confirm && pw.confirm === pw.password1 && pw.password1.length >= 8 && <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>}
            </div>
            <Button type="submit" disabled={pwSaving || pw.password1 !== pw.confirm || pw.password1.length < 8}
              className="w-full bg-secondary hover:bg-secondary">
              {pwSaving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Updating…</> : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}