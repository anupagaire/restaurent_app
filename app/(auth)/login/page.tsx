"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  // ✅ useRouter हटायो — window.location.href use गर्छौं

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        setError(data?.detail || "Login failed");
        return;
      }

      const access = data?.access;
      const refresh = data?.refresh;

      if (!access) {
        setError("Token missing from response");
        return;
      }

      // 💾 SAVE TOKENS
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      document.cookie = `access_token=${access}; path=/; max-age=86400; SameSite=Lax`;

      // 👤 GET USER PROFILE
      const meRes = await apiFetch("/api/v1/user/me/");
      const me = await meRes.json();
      console.log("USER PROFILE:", me);

      if (!meRes.ok) {
        setError("Failed to fetch user profile");
        return;
      }

      // 💾 SAVE USER
      localStorage.setItem("user", JSON.stringify(me));
      if (me?.restaurant) {
        localStorage.setItem("restaurant_id", String(me.restaurant));
      }

      const role = (me?.role || "").toLowerCase();
      const isSuperAdmin = !me?.restaurant; // ✅ restaurant null = super admin
      const isAdmin = !isSuperAdmin && role === 'admin';

      // ✅ ROLE COOKIE SET GARO — middleware le yo padcha
      document.cookie = `role=${isSuperAdmin ? 'super_admin' : role}; path=/; max-age=86400; SameSite=Lax`;

      // Staff permissions
      const allPerms = JSON.parse(localStorage.getItem('staff_permissions') || '{}');
      const savedPerms = allPerms[me.email];

      login({
        id: me.id,
        name: `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.email,
        email: me.email,
        role: isSuperAdmin ? 'super_admin' : (me.role || 'staff'),
        permissions: savedPerms || {
          viewOrders: isAdmin,
          manageOrders: isAdmin,
          addMenuItems: isAdmin,
          editMenuItems: isAdmin,
          menuSettings: isAdmin,
          globalSettings: isAdmin,
          manageStaff: isAdmin,
        }
      });

      // ✅ Cookie set हुन time दियो, अनि full reload गर्यो
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ window.location.href — router.replace होइन
      if (isSuperAdmin) {
        window.location.href = "/super-admin";
      } else {
        window.location.href = "/restaurant-admin";
      }

    } catch (err) {
      console.error(err);
      setError("Network error");
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
          className="w-full bg-[#513012] text-white py-3 rounded-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}