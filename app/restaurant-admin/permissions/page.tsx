'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useRequirePermission } from '@/hooks/usePermission';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Check } from 'lucide-react';

interface Permission {
  id: number;
  codename: string;
  name: string;
  app: string;
  model: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

// Human-readable permission groups relevant for staff
const PERMISSION_GROUPS = [
  {
    label: '📋 Orders',
    model: 'order',
    perms: ['view_order', 'change_order', 'add_order', 'delete_order'],
  },
  {
    label: '🍽️ Menu Items',
    model: 'menuitem',
    perms: ['view_menuitem', 'add_menuitem', 'change_menuitem', 'delete_menuitem'],
  },
  {
    label: '📂 Categories',
    model: 'category',
    perms: ['view_category', 'add_category', 'change_category', 'delete_category'],
  },
  {
    label: '🔑 QR Tokens',
    model: 'menutoken',
    perms: ['view_menutoken', 'add_menutoken', 'change_menutoken', 'delete_menutoken'],
  },
  {
    label: '🏪 Restaurant',
    model: 'restaurant',
    perms: ['view_restaurant', 'change_restaurant'],
  },
  {
    label: '👥 Users',
    model: 'user',
    perms: ['view_user', 'add_user', 'change_user', 'delete_user'],
  },
];

const PERM_LABELS: Record<string, string> = {
  view_order:       'View Orders',
  change_order:     'Update Orders',
  add_order:        'Create Orders',
  delete_order:     'Delete Orders',
  view_menuitem:    'View Menu Items',
  add_menuitem:     'Add Menu Items',
  change_menuitem:  'Edit Menu Items',
  delete_menuitem:  'Delete Menu Items',
  view_category:    'View Categories',
  add_category:     'Add Categories',
  change_category:  'Edit Categories',
  delete_category:  'Delete Categories',
  view_menutoken:   'View QR Tokens',
  add_menutoken:    'Generate QR',
  change_menutoken: 'Edit QR Tokens',
  delete_menutoken: 'Delete QR Tokens',
  view_restaurant:  'View Restaurant',
  change_restaurant:'Edit Restaurant',
  view_user:        'View Staff',
  add_user:         'Add Staff',
  change_user:      'Edit Staff',
  delete_user:      'Delete Staff',
};

export default function PermissionsPage() {
  const [staffRoles, setStaffRoles]     = useState<Role[]>([]);
  const [allPerms, setAllPerms]         = useState<Permission[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [changes, setChanges]           = useState<Record<number, Set<number>>>({});

  useRequirePermission('globalSettings');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch roles
      const rolesRes  = await apiFetch('/api/v1/roles/?page_size=50');
      const rolesData = await rolesRes.json();
      const rolesList = rolesData.data ?? rolesData.results ?? [];

      // Fetch each role detail
      const detailed = await Promise.all(
        rolesList.map(async (r: any) => {
          const rRes  = await apiFetch(`/api/v1/roles/${r.id}/`);
          const rData = await rRes.json();
          const role  = rData.data ?? rData;
          return { id: role.id, name: role.name, permissions: role.permissions ?? [] };
        })
      );

      // Only show staff-related roles (not super admin, not customer)
      const staffOnly = detailed.filter((r: Role) =>
        !r.name.toLowerCase().includes('super') &&
        !r.name.toLowerCase().includes('customer') &&
        !r.name.toLowerCase().includes('admin') // hide admin too — only staff roles
      );

      setStaffRoles(staffOnly);

      // Init selected role
      if (staffOnly.length > 0 && !selectedRole) {
        setSelectedRole(staffOnly[0].id);
      }

      // Init changes
      const init: Record<number, Set<number>> = {};
      detailed.forEach((r: Role) => {
        init[r.id] = new Set(r.permissions.map((p: Permission) => p.id));
      });
      setChanges(init);

      // Fetch all permissions
      const permsRes  = await apiFetch('/api/v1/permissions/?page_size=500');
      const permsData = await permsRes.json();
      setAllPerms(permsData.results ?? permsData.data ?? []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const togglePerm = (roleId: number, permId: number) => {
    setChanges(prev => {
      const set = new Set(prev[roleId] ?? []);
      if (set.has(permId)) set.delete(permId);
      else set.add(permId);
      return { ...prev, [roleId]: set };
    });
  };

  const saveRole = async (roleId: number) => {
    setSaving(roleId);
    try {
      const permIds = Array.from(changes[roleId] ?? []);
      const res  = await apiFetch(`/api/v1/roles/${roleId}/assign-permissions/`, {
        method: 'POST',
        body:   JSON.stringify({
          permission_ids:       permIds,
          replace:              true,
          allow_system_role_edit: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.errors ?? data));
      await fetchData();
      alert('✅ Permissions saved!');
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  // Get permission id by codename
  const getPermId = (codename: string) =>
    allPerms.find(p => p.codename === codename)?.id ?? null;

  const currentRole  = staffRoles.find(r => r.id === selectedRole);
  const currentPerms = changes[selectedRole ?? 0] ?? new Set();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#513012]">Staff Permissions</h1>
        <p className="text-gray-500 mt-1">Control what staff members can access</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#513012]" />
        </div>
      ) : staffRoles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No staff roles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Role selector */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Roles</p>
            {staffRoles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  selectedRole === role.id
                    ? 'bg-[#513012] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{role.name}</p>
                  <p className={`text-xs ${selectedRole === role.id ? 'text-white/70' : 'text-gray-400'}`}>
                    {(changes[role.id]?.size ?? 0)} permissions
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Permissions panel */}
          {currentRole && (
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-[#513012]">
                  {currentRole.name} Permissions
                </p>
                <Button
                  onClick={() => saveRole(currentRole.id)}
                  disabled={saving === currentRole.id}
                  className="bg-[#513012] hover:bg-[#3f260f]"
                >
                  {saving === currentRole.id
                    ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving…</>
                    : '✓ Save Changes'}
                </Button>
              </div>

              <div className="space-y-4">
                {PERMISSION_GROUPS.map(group => {
                  const groupPerms = group.perms
                    .map(codename => ({ codename, id: getPermId(codename) }))
                    .filter(p => p.id !== null);

                  if (groupPerms.length === 0) return null;

                  const allOn = groupPerms.every(p => currentPerms.has(p.id!));

                  return (
                    <Card key={group.label} className="overflow-hidden">
                      {/* Group header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                        <p className="font-semibold text-sm text-gray-700">{group.label}</p>
                        <button
                          onClick={() => {
                            groupPerms.forEach(p => {
                              const has = currentPerms.has(p.id!);
                              if (allOn && has) togglePerm(currentRole.id, p.id!);
                              if (!allOn && !has) togglePerm(currentRole.id, p.id!);
                            });
                          }}
                          className="text-xs text-[#513012] font-semibold hover:underline"
                        >
                          {allOn ? 'Remove all' : 'Allow all'}
                        </button>
                      </div>

                      {/* Permissions grid */}
                      <CardContent className="p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {groupPerms.map(({ codename, id }) => {
                            const isOn = currentPerms.has(id!);
                            return (
                              <label
                                key={codename}
                                onClick={() => togglePerm(currentRole.id, id!)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                                  isOn
                                    ? 'border-[#513012] bg-[#513012]/5'
                                    : 'border-gray-100 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isOn ? 'bg-[#513012]' : 'border-2 border-gray-300'
                                }`}>
                                  {isOn && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <p className="text-sm font-medium text-gray-800">
                                  {PERM_LABELS[codename] ?? codename}
                                </p>
                              </label>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Save bottom */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => saveRole(currentRole.id)}
                  disabled={saving === currentRole.id}
                  className="bg-[#513012] hover:bg-[#3f260f]"
                >
                  {saving === currentRole.id
                    ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving…</>
                    : '✓ Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}