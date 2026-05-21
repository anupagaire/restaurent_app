'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, LogOut, ChevronRight, UtensilsCrossed } from 'lucide-react';

interface Props {
  user: { first_name: string; last_name: string; email: string };
}

const NAV = [
  { href: '/customer/orders',  label: 'My Orders',  icon: ShoppingBag },
  { href: '/customer/profile', label: 'Profile',    icon: User },
];

function getInitials(first: string, last: string, email: string) {
  if (first || last) return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  return email[0]?.toUpperCase() ?? '?';
}

export default function CustomerSidebar({ user }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    // Clear all auth tokens and user data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('restaurant_id');
    localStorage.removeItem('qr_menu_auth'); // also clear menu order session
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;
  const initials = getInitials(user.first_name, user.last_name, user.email || 'U');

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 min-h-screen sticky top-0"
        style={{ background: '#1e0f02', borderRight: '1px solid rgba(184,147,106,0.15)' }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(184,147,106,0.15)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#513012' }}
          >
            <UtensilsCrossed size={16} color="#fdf6ec" />
          </div>
          <span className="font-bold text-sm tracking-wide" style={{ color: '#fdf6ec', fontFamily: 'Georgia, serif' }}>
            My Account
          </span>
        </div>

        {/* User card */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(184,147,106,0.15)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #513012, #b8936a)', color: '#fdf6ec' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#fdf6ec' }}>{fullName}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(184,147,106,0.8)' }}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background: active ? 'rgba(184,147,106,0.15)' : 'transparent',
                  color:      active ? '#fdf6ec' : 'rgba(184,147,106,0.7)',
                  borderLeft: active ? '2px solid #b8936a' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#b8936a' }} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(184,147,106,0.15)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'rgba(184,147,106,0.6)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(184,147,106,0.6)';
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ──────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{
          background: '#1e0f02',
          borderTop: '1px solid rgba(184,147,106,0.2)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors"
              style={{ color: active ? '#fdf6ec' : 'rgba(184,147,106,0.5)' }}
            >
              <Icon size={20} />
              {label}
              {active && (
                <span
                  className="absolute bottom-0 w-8 h-0.5 rounded-full"
                  style={{ background: '#b8936a' }}
                />
              )}
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium"
          style={{ color: 'rgba(184,147,106,0.5)' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </nav>
    </>
  );
}