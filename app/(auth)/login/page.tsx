"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ── Step 1: Get JWT tokens ─────────────────────────────────────────────
      const res = await fetch(`${API}/api/v1/login/`, {
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

      // ── Step 2: Store tokens ───────────────────────────────────────────────
      localStorage.setItem("access_token",  access);
      localStorage.setItem("refresh_token", refresh);
      document.cookie = `access_token=${access}; path=/; max-age=86400; SameSite=Lax`;

      // ── Step 3: Fetch user profile ─────────────────────────────────────────
      const meRes = await apiFetch("/api/v1/user/me/");
      const meRaw = await meRes.json();
      if (!meRes.ok) { setError("Failed to fetch user profile"); return; }

      const me = meRaw.data ?? meRaw;
      localStorage.setItem("user", JSON.stringify(me));
      if (me?.restaurant) {
        localStorage.setItem("restaurant_id", String(me.restaurant));
      }

      // ── Step 4: Determine role ─────────────────────────────────────────────
      const hasRestaurant = !!me?.restaurant;
      const roleNames: string[] = (me?.roles ?? []).map((r: any) =>
        (r?.name ?? r?.role ?? '').toLowerCase()
      );

      let primaryRole: string;

      if (!hasRestaurant) {
        const isCustomer   = roleNames.some(r => r.includes('customer') || r.includes('public'));
        const isSuperAdmin = roleNames.some(r => r.includes('super'));
        if (isCustomer)        primaryRole = 'customer';
        else if (isSuperAdmin) primaryRole = 'super_admin';
        else                   primaryRole = 'super_admin'; // no restaurant = super admin
      } else {
        const isAdmin = roleNames.some(r => r.includes('admin'));
        primaryRole   = isAdmin ? 'admin' : 'staff';
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
      const allPerms   = JSON.parse(localStorage.getItem("staff_permissions") || "{}");
      const savedPerms = allPerms[me.email];
      const isAdmin    = primaryRole === 'admin';

      login({
        id:    me.id,
        name:  `${me.first_name || ""} ${me.last_name || ""}`.trim() || me.email,
        email: me.email,
        role:  primaryRole,
        permissions: savedPerms || {
          viewOrders:     isAdmin,
          manageOrders:   isAdmin,
          addMenuItems:   isAdmin,
          editMenuItems:  isAdmin,
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
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#513012]">Login</h2>

        <input
          className="w-full border p-3 rounded-lg mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border p-3 rounded-lg mb-6"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#513012] text-white py-3 rounded-lg font-semibold hover:bg-[#3f260f] transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}