'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type PermissionKey = 'viewOrders' | 'manageOrders' | 'addMenuItems' | 
  'editMenuItems' | 'menuSettings' | 'globalSettings' | 'manageStaff';

export function useRequirePermission(permissionKey: PermissionKey | null) {
  const { currentUser, isLoading } = useAuth();   
  const router = useRouter();

     useEffect(() => {
       if (isLoading) return;   
        if (!currentUser) {
      router.replace('/login');
      return;
    }

    if (permissionKey === null) return;

    // if Admin/Owner give whole access
    const role = currentUser.role?.toLowerCase();
    if (role === 'admin' || role === 'owner') return;

    // if no Permission  redirect
    if (!currentUser.permissions?.[permissionKey]) {
      router.replace('/restaurant-admin/unauthorized');
    }
  }, [currentUser, permissionKey, router]);
}