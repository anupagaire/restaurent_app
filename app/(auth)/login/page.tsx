"use client";

import { useState,useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation";

const Base_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPw, setShowPw]     = useState(false);
  const { login } = useAuth();
const router = useRouter();
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  // ── Already logged in
  useEffect(() => {
    if (isLoading) return; 
    if (!isAuthenticated) return; 

    const role = currentUser?.role?.toLowerCase();
    if (role === 'super_admin') {
      router.replace('/super-admin');
    } else if (role === 'customer') {
      router.replace('/customer');
    } else {
      router.replace('/restaurant-admin');
    }
  }, [isAuthenticated, isLoading, currentUser, router]);
   if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${Base_URL}/api/v1/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail || data?.message || "Invalid email or password");
        return;
      }

      const access  = data?.access  ?? data?.data?.access;
      const refresh = data?.refresh ?? data?.data?.refresh;
      if (!access) { setError("Token missing from response"); return; }

      localStorage.setItem("access_token",  access);
      localStorage.setItem("refresh_token", refresh);
      document.cookie = `access_token=${access}; path=/; max-age=86400; SameSite=Lax`;

      const meRes = await apiFetch("/api/v1/user/me/");
      const meRaw = await meRes.json();
      if (!meRes.ok) { setError("Failed to fetch user profile"); return; }

      const me = meRaw.data ?? meRaw;
      localStorage.setItem("user", JSON.stringify(me));
      if (me?.restaurant) {
        localStorage.setItem("restaurant_id", String(me.restaurant));
      }

      const hasRestaurant = !!me?.restaurant;
      const roleNames: string[] = (me?.roles ?? []).map((r: any) =>
        (r?.name ?? r?.role ?? '').toLowerCase()
      );

      let primaryRole: string;

      if (!hasRestaurant) {
        const isCustomer   = roleNames.some(r =>
          r.includes('customer') || r.includes('public') || r.includes('customergroup')
        );
        const isSuperAdmin = roleNames.some(r => r.includes('super'));
        if (isCustomer)        primaryRole = 'customer';
        else if (isSuperAdmin) primaryRole = 'super_admin';
        else                   primaryRole = 'super_admin';
      } else {
        const isCustomer = roleNames.some(r =>
          r.includes('customer') || r.includes('customergroup')
        );
        if (isCustomer) {
          primaryRole = 'customer';
        } else {
          const isAdmin = roleNames.some(r =>
            r.includes('admin') && !r.includes('super')
          );
          primaryRole = isAdmin ? 'admin' : 'staff';
        }
      }

      // ── Step 5: Set role cookie ────────────────────────────────────────────
      document.cookie = `role=${primaryRole}; path=/; max-age=86400; SameSite=Lax`;

      // ── Step 6: Customer qr_menu_auth ──────────────────────────────────────
      if (primaryRole === 'customer') {
        localStorage.setItem(
          "qr_menu_auth",
          JSON.stringify({ access, refresh, email: me.email }),
        );
      }

      // ── Step 7: AuthContext login ──────────────────────────────────────────
      const isAdmin = primaryRole === 'admin';
      const isStaff = primaryRole === 'staff';

      login({
        id:    me.id,
        name:  `${me.first_name || ""} ${me.last_name || ""}`.trim() || me.email,
        email: me.email,
        role:  primaryRole,
        permissions: {
          viewOrders:     isAdmin || isStaff,
          manageOrders:   isAdmin || isStaff,
          addMenuItems:   isAdmin || isStaff,
          editMenuItems:  isAdmin || isStaff,
          menuSettings:   isAdmin,
          globalSettings: isAdmin,
          manageStaff:    isAdmin,
        },
      });

      // ── Step 8: Redirect ───────────────────────────────────────────────────
      await new Promise(resolve => setTimeout(resolve, 100));

      if (primaryRole === 'super_admin') {
        window.location.href = "/super-admin";
      } else if (primaryRole === 'customer') {
        window.location.href = "/customer";
      } else {
        // admin or staff
        window.location.href = "/restaurant-admin";
      }

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-secondary">Welcome Back</h2>
          <p className="text-secondary text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password with eye toggle */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              className="w-full border border-gray-200 p-3 pr-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-gray-600 transition-colors"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm text-gray-500 mt-2">
  Don't have an account?{" "}
  <a
    href="/register"
    className="text-secondary font-semibold hover:underline"
  >
    Register
  </a>
</p>
      </form>
    </div>
  );
}