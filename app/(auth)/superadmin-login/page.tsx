"use client";

import { useRouter } from "next/navigation";

export default function SuperAdminLogin() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/super-admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      
      <div className=" p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <h2 className="text-3xl font-bold text-[#513012] text-center mb-6">
          Super Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg   outline-none focus:ring-2 focus:ring-[#a9745b]"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-lg  outline-none focus:ring-2 focus:ring-[#a9745b]"
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-[#a9745b] hover:bg-[#c08a6d] text-white font-semibold py-3 rounded-lg transition"
        >
          Login
        </button>

      </div>
    </div>
  );
}