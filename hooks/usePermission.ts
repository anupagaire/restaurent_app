'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type PermissionKey = 'viewOrders' | 'manageOrders' | 'addMenuItems' | 
  'editMenuItems' | 'menuSettings' | 'globalSettings' | 'manageStaff';

export function useRequirePermission(permissionKey: PermissionKey | null) {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    // permissionKey null bhane sabai access paaucha (Dashboard)
    if (permissionKey === null) return;

    // Admin/Owner bhaye sabai access
    const role = currentUser.role?.toLowerCase();
    if (role === 'admin' || role === 'owner') return;

    // Permission chhaina bhane redirect
    if (!currentUser.permissions?.[permissionKey]) {
      router.replace('/restaurant-admin/unauthorized');
    }
  }, [currentUser, permissionKey, router]);
}