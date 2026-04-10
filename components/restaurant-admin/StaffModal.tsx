'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserCheck } from 'lucide-react';

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'Active' | 'Inactive';
  permissions: {
    viewOrders: boolean;
    manageOrders: boolean;
    addMenuItems: boolean;
    editMenuItems: boolean;
    globalSettings: boolean;
    manageStaff: boolean;
  };
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStaff: Staff | null;
  onSubmit: (data: any) => void;
  availableRoles: string[];
}

export default function StaffModal({
  isOpen,
  onClose,
  editingStaff,
  onSubmit,
  availableRoles,
}: StaffModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Waiter',
    status: 'Active' as 'Active' | 'Inactive',
    password: '',
    permissions: {
      viewOrders: true,
      manageOrders: false,
      addMenuItems: false,
      editMenuItems: false,
      globalSettings: false,
      manageStaff: false,
    },
  });

  // Reset / populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingStaff) {
        setFormData({
          name: editingStaff.name,
          email: editingStaff.email,
          phone: editingStaff.phone,
          role: editingStaff.role,
          status: editingStaff.status,
          password: '', 
          permissions: { ...editingStaff.permissions },
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'Waiter',
          status: 'Active',
          password: '',
          permissions: {
            viewOrders: true,
            manageOrders: false,
            addMenuItems: false,
            editMenuItems: false,
            globalSettings: false,
            manageStaff: false,
          },
        });
      }
    }
  }, [isOpen, editingStaff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email) return;
    if (!editingStaff && !formData.password) {
      alert('Initial password is required when creating new staff');
      return;
    }

    onSubmit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      permissions: formData.permissions,
      ...( !editingStaff && { password: formData.password } ), // only send password on create
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">
            {editingStaff ? 'Edit Staff Member' : 'Create New Staff Member'}
          </DialogTitle>
          <DialogDescription>
            {editingStaff 
              ? 'Update details, role and permissions' 
              : 'Fill details + set initial password. Staff will use this to login.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sujan Karki"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@yourrestaurant.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+977 98XXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Password - only required on create */}
          <div className="space-y-2">
            <Label htmlFor="password">
              {editingStaff ? 'New Password (leave blank to keep current)' : 'Initial Password'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingStaff ? '••••••••' : 'Set strong password'}
              required={!editingStaff}
            />
            {!editingStaff && (
              <p className="text-xs text-gray-500">Staff will use this password to login</p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.status === 'Active'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'Active' : 'Inactive' })
                }
              />
              <span className="text-sm font-medium">{formData.status}</span>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#5D0565]" />
              <Label className="text-base font-semibold text-[#47034E]">Permissions</Label>
            </div>
            <p className="text-xs text-gray-500">Choose what this staff member can access</p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'viewOrders', label: 'View Orders', desc: 'Can see all orders' },
                { key: 'manageOrders', label: 'Manage Orders', desc: 'Update order status' },
                { key: 'addMenuItems', label: 'Add Menu Items', desc: 'Create new dishes' },
                { key: 'editMenuItems', label: 'Edit Menu Items', desc: 'Update prices & details' },
                { key: 'globalSettings', label: 'Global Settings', desc: 'Restaurant profile, taxes, etc.' },
                { key: 'manageStaff', label: 'Manage Staff', desc: 'Add/edit other staff' },
              ].map((perm) => (
                <div key={perm.key} className="flex items-center justify-between border rounded-xl p-4">
                  <div>
                    <p className="font-medium">{perm.label}</p>
                    <p className="text-xs text-gray-500">{perm.desc}</p>
                  </div>
                  <Switch
                    checked={formData.permissions[perm.key as keyof typeof formData.permissions]}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [perm.key]: checked,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#513012] hover:bg-[#513012]/90">
              {editingStaff ? 'Save Changes' : 'Create Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}