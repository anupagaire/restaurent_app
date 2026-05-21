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
        setError(data?.detail || "Invalid email or password");
        return;
      }

      const access  = data?.access;
      const refresh = data?.refresh;

      if (!access) {
        setError("Token missing from response");
        return;
      }

      // ── Step 2: Store tokens ───────────────────────────────────────────────
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      document.cookie = `access_token=${access}; path=/; max-age=86400; SameSite=Lax`;

      // ── Step 3: Fetch user profile ─────────────────────────────────────────
      const meRes = await apiFetch("/api/v1/user/me/");
      const me    = await meRes.json();

      if (!meRes.ok) {
        setError("Failed to fetch user profile");
        return;
      }

      localStorage.setItem("user", JSON.stringify(me));
      if (me?.restaurant) {
        localStorage.setItem("restaurant_id", String(me.restaurant));
      }

      const role        = (me?.role || "").toLowerCase();
      const isSuperAdmin = !me?.restaurant;
      const isAdmin      = !isSuperAdmin && role === "admin";

      // ── Step 4: Set role cookie ────────────────────────────────────────────
      const cookieRole = isSuperAdmin ? "super_admin" : role;
      document.cookie  = `role=${cookieRole}; path=/; max-age=86400; SameSite=Lax`;

      // ── Step 5: If customer → also save to qr_menu_auth so MenuSection
      //           recognises them as already logged in (no re-register needed)
      if (role === "customer") {
        localStorage.setItem(
          "qr_menu_auth",
          JSON.stringify({ access, refresh, email: me.email }),
        );
      }

      // ── Step 6: AuthContext login ──────────────────────────────────────────
      const allPerms  = JSON.parse(localStorage.getItem("staff_permissions") || "{}");
      const savedPerms = allPerms[me.email];

      login({
        id:    me.id,
        name:  `${me.first_name || ""} ${me.last_name || ""}`.trim() || me.email,
        email: me.email,
        role:  isSuperAdmin ? "super_admin" : (me.role || "staff"),
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

      // ── Step 7: Redirect based on role ────────────────────────────────────
      await new Promise(resolve => setTimeout(resolve, 100)); // let cookie set

      if (role === "customer") {
        window.location.href = "/customer";
      } else if (isSuperAdmin) {
        window.location.href = "/super-admin";
      } else {
        window.location.href = "/restaurant-admin";
      }

    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-[#513012]">
          Login
        </h2>

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
          className="w-full bg-[#513012] text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}