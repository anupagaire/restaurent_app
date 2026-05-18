'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Lock, Receipt, Bookmark, Star, LogOut } from 'lucide-react';

const links = [
  { href: '/customer/profile',   label: 'Profile',      icon: User },
  { href: '/customer/password',  label: 'Password',     icon: Lock },
  { href: '/customer/orders',    label: 'My Orders',    icon: Receipt },
  { href: '/customer/bookmarks', label: 'Saved Places', icon: Bookmark },
  { href: '/customer/reviews',   label: 'My Reviews',   icon: Star },
];

export default function CustomerSidebar({ user }: { user: { first_name: string; last_name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 shrink-0">
      {/* Avatar */}
      <div className="flex flex-col items-center px-4 pb-5 border-b border-gray-100 mb-3">
        <div className="w-14 h-14 rounded-full bg-[#47034E] flex items-center justify-center text-white font-semibold text-lg mb-2">
          {initials}
        </div>
        <p className="text-sm font-medium text-[#513012]">{user.first_name} {user.last_name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-0">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 px-5 mb-1">Account</p>
        {links.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-2 transition-all
              ${pathname === href
                ? 'border-[#513012] bg-amber-50 text-[#513012] font-medium'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <Icon size={15} /> {label}
          </Link>
        ))}

        <p className="text-[10px] uppercase tracking-widest text-gray-400 px-5 mt-4 mb-1">Activity</p>
        {links.slice(2).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-2 transition-all
              ${pathname === href
                ? 'border-[#513012] bg-amber-50 text-[#513012] font-medium'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <Icon size={15} /> {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout}
        className="flex items-center gap-2.5 px-5 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-2">
        <LogOut size={15} /> Sign out
      </button>
    </aside>
  );
}