'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Receipt, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '/customer/profile',  label: 'Profile',   icon: User },
  { href: '/customer/orders',   label: 'My Orders', icon: Receipt },
];

export default function CustomerSidebar({ user }: { user: { first_name: string; last_name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  const NavContent = () => (
    <>
      <div className="flex flex-col items-center px-4 pb-5 border-b border-gray-100 mb-3">
        <div className="w-14 h-14 rounded-full bg-[#47034E] flex items-center justify-center text-white font-semibold text-lg mb-2">
          {initials}
        </div>
        <p className="text-sm font-medium text-[#513012]">{user.first_name} {user.last_name}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-full px-2 text-center">{user.email}</p>
      </div>

      <nav className="flex-1 px-0">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-2 transition-all
              ${pathname === href
                ? 'border-[#513012] bg-amber-50 text-[#513012] font-medium'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-5 py-3 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100 mt-2 w-full"
      >
        <LogOut size={15} /> Sign out
      </button>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-100 flex-col py-6 shrink-0 min-h-screen">
        <NavContent />
      </aside>

   
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#47034E] flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <span className="text-sm font-medium text-[#513012]">
            {user.first_name} {user.last_name}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-10 w-64 bg-white flex flex-col py-6 shadow-xl h-full">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}