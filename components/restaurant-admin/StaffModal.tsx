'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_no: string;
  address: string;
  roles: Role[];
  restaurant: number;
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStaff: Staff | null;
  onSubmit: (data: any) => void;
  submitting: boolean;
  roles: Role[];
}

export default function StaffModal({
  isOpen, onClose, editingStaff, onSubmit, submitting, roles,
}: StaffModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_no: '',
    password1: '',
    role_id: null as number | null,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingStaff) {
      setFormData({
        first_name: editingStaff.first_name || '',
        last_name:  editingStaff.last_name  || '',
        email:      editingStaff.email      || '',
        contact_no: editingStaff.contact_no || '',
        password1:  '',
        role_id:    editingStaff.roles?.[0]?.id ?? null,
      });
    } else {
      setFormData({
        first_name: '', last_name: '', email: '',
        contact_no: '', password1: '', role_id: null,
      });
    }
  }, [isOpen, editingStaff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.email) return;
    if (!editingStaff && !formData.password1) {
      alert('Password is required for new staff');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </DialogTitle>
          <DialogDescription>
            {editingStaff
              ? 'Update staff details and role.'
              : 'Create a new staff account and assign a role.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input required value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input required type="email" value={formData.email}
              disabled={!!editingStaff}
              onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input placeholder="+977 98XXXXXXXX" value={formData.contact_no}
              onChange={e => setFormData({ ...formData, contact_no: e.target.value })} />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label>
              {editingStaff ? 'New Password (blank = no change)' : 'Password'}
              {!editingStaff && <span className="text-red-500"> *</span>}
            </Label>
            <Input type="password" value={formData.password1}
              placeholder={editingStaff ? 'Leave blank to keep current' : 'Min 8 characters'}
              required={!editingStaff}
              onChange={e => setFormData({ ...formData, password1: e.target.value })} />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role <span className="text-red-500">*</span></Label>
            {roles.length === 0 ? (
              <p className="text-sm text-gray-400">Loading roles...</p>
            ) : (
              <div className="space-y-2">
                {roles.map(role => (
                  <label key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                      formData.role_id === role.id
                        ? 'border-[#513012] bg-[#513012]/5'
                        : 'border-gray-200 hover:border-[#513012]/40'
                    }`}>
                    <input type="radio" name="role" value={role.id}
                      checked={formData.role_id === role.id}
                      onChange={() => setFormData({ ...formData, role_id: role.id })}
                      className="accent-[#513012]" />
                    <p className="font-semibold text-sm text-gray-800">{role.name}</p>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.role_id}
              className="bg-[#513012] hover:bg-[#3f260f]">
              {submitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                : editingStaff ? '✓ Save Changes' : '✓ Create Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}