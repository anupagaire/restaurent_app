'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserCheck } from 'lucide-react';

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  role: string;
  restaurant: number;
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStaff: Staff | null;
  onSubmit: (data: any) => void;
  submitting: boolean;
  availableRoles: string[];
}

const DEFAULT_PERMISSIONS = {
  viewOrders: false,
  manageOrders: false,
  addMenuItems: false,
  editMenuItems: false,
  menuSettings: false,
  globalSettings: false,
  manageStaff: false,
};

export default function StaffModal({
  isOpen, onClose, editingStaff, onSubmit, submitting, availableRoles,
}: StaffModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_no: '',
    address: '',
    role: 'staff',
    password1: '',
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingStaff) {
        // Existing staff ko saved permissions load garo
        const allPerms = JSON.parse(localStorage.getItem('staff_permissions') || '{}');
        const savedPerms = allPerms[editingStaff.email] || DEFAULT_PERMISSIONS;

        setFormData({
          first_name: editingStaff.first_name || '',
          last_name: editingStaff.last_name || '',
          email: editingStaff.email || '',
          contact_no: editingStaff.contact_no || '',
          address: '',
          role: editingStaff.role || 'staff',
          password1: '',
          permissions: { ...savedPerms },
        });
      } else {
        setFormData({
          first_name: '', last_name: '', email: '',
          contact_no: '', address: '', role: 'staff', password1: '',
          permissions: { ...DEFAULT_PERMISSIONS },
        });
      }
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

  const permissionItems = [
    { key: 'viewOrders', label: 'View Orders', desc: 'Can see all orders' },
    { key: 'manageOrders', label: 'Manage Orders', desc: 'Update order status' },
    { key: 'addMenuItems', label: 'Add Menu Items', desc: 'Create new dishes' },
    { key: 'editMenuItems', label: 'Edit Menu Items', desc: 'Update prices & details' },
    { key: 'menuSettings', label: 'Menu Settings', desc: 'Manage menu categories' },
    { key: 'globalSettings', label: 'Settings', desc: 'Restaurant settings' },
    { key: 'manageStaff', label: 'Manage Staff', desc: 'Add/edit other staff' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </DialogTitle>
          <DialogDescription>
            {editingStaff
              ? 'Update staff details and permissions'
              : 'Create a new staff account with specific permissions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="First name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="staff@restaurant.com"
              required
              disabled={!!editingStaff}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.contact_no}
                onChange={e => setFormData({ ...formData, contact_no: e.target.value })}
                placeholder="+977 98XXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={value => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{editingStaff ? 'New Password (blank = no change)' : 'Password *'}</Label>
            <Input
              type="password"
              value={formData.password1}
              onChange={e => setFormData({ ...formData, password1: e.target.value })}
              placeholder={editingStaff ? '••••••••' : 'Min 8 characters'}
              required={!editingStaff}
            />
          </div>

          {/* ✅ PERMISSIONS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b">
              <UserCheck className="w-5 h-5 text-[#513012]" />
              <Label className="text-base font-semibold text-[#513012]">Permissions</Label>
            </div>
            <p className="text-xs text-gray-500">Choose what this staff member can access in the dashboard</p>

            <div className="grid grid-cols-1 gap-2">
              {permissionItems.map((perm) => (
                <div key={perm.key} className="flex items-center justify-between border rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{perm.label}</p>
                    <p className="text-xs text-gray-500">{perm.desc}</p>
                  </div>
                  <Switch
                    checked={formData.permissions[perm.key as keyof typeof formData.permissions]}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, [perm.key]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-[#513012] hover:bg-[#513012]/90">
              {submitting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              {editingStaff ? 'Save Changes' : 'Create Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}