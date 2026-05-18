'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Loader2, User, Lock } from 'lucide-react';

export default function CustomerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    email: '',
    first_name: '',
    last_name: '',
    contact_no: '',
    address: '',
  });

  const [passwords, setPasswords] = useState({
    password1: '',
    confirmPassword: '',
  });

  // Load current user
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/api/v1/user/me/');
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile({
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          contact_no: data.contact_no || '',
          address: data.address || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await apiFetch('/api/v1/user/me/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          contact_no: profile.contact_no,
          address: profile.address,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (passwords.password1.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (passwords.password1 !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch('/api/v1/user/me/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password1: passwords.password1,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }
      setSuccess('Password updated successfully!');
      setPasswords({ password1: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
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
        <p className="text-gray-500 mt-1">Update your email and password</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#513012]">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={profile.first_name}
                  onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={profile.last_name}
                  onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.contact_no}
                onChange={e => setProfile({ ...profile, contact_no: e.target.value })}
                placeholder="+977 98XXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                placeholder="Your address"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#513012] hover:bg-[#513012]/90"
            >
              {saving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#513012]">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password *</Label>
              <Input
                type="password"
                value={passwords.password1}
                onChange={e => setPasswords({ ...passwords, password1: e.target.value })}
                placeholder="Min 8 characters"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password *</Label>
              <Input
                type="password"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#513012] hover:bg-[#513012]/90"
            >
              {saving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}