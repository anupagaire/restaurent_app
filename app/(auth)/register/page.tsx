"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const Base_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    email: "",
    contact_no: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${Base_URL}/api/v1/user/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim() || "Guest",
          email: form.email.trim(),
          password1: form.password,
          password2: form.confirm_password,
          contact_no: form.contact_no.trim() || null,
          role: "customer",
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = "Registration failed";
        try {
          const err = JSON.parse(text);
          if (err.email) msg = Array.isArray(err.email) ? err.email[0] : err.email;
          else if (err.password1) msg = Array.isArray(err.password1) ? err.password1[0] : err.password1;
          else if (err.detail) msg = err.detail;
          else msg = JSON.stringify(err).slice(0, 200);
        } catch {}
        setError(msg);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-secondary">Create Account</h2>
          <p className="text-secondary text-sm mt-1">Register as a customer</p>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="first_name"
            className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
            placeholder="John Doe"
            value={form.first_name}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email *</label>
          <input
            name="email"
            type="email"
            className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <input
            name="contact_no"
            type="tel"
            className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
            placeholder="+977XXXXXXXXXX"
            value={form.contact_no}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password *</label>
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              className="w-full border border-gray-200 p-3 pr-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-gray-600 transition-colors"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
          <div className="relative">
            <input
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              className={`w-full border p-3 pr-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all ${
                form.confirm_password && form.password !== form.confirm_password
                  ? "border-red-400 focus:border-red-400"
                  : "border-gray-200 focus:border-secondary"
              }`}
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {form.confirm_password && form.password !== form.confirm_password && (
            <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-secondary font-semibold hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}