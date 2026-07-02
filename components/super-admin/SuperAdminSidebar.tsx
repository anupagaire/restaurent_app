

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
LayoutDashboard,
Users,
LogOut,
Settings,
Contact,
ClipboardList,
CreditCard,
Globe,
FileText,
Tag,
X,
ChevronDown,
ChevronRight,
} from 'lucide-react';

const menuSections = [
{
title: 'Main',
items: [
{ title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
{ title: 'Users', href: '/super-admin/users', icon: Users },
{ title: 'Applications', href: '/super-admin/restaurant-applications', icon: ClipboardList },
],
},
{
title: 'Subscriptions',
items: [
{ title: 'Subscriptions', href: '/super-admin/payments', icon: CreditCard },
{ title: 'Invoices', href: '/super-admin/subscriptions/invoices', icon: FileText },
{ title: 'Plans', href: '/super-admin/subscriptions/plans', icon: CreditCard },
{ title: 'Promo Codes', href: '/super-admin/subscriptions/promo', icon: Tag },
],
},
{
title: 'Website',
items: [
{ title: 'Custom Domains', href: '/super-admin/custom-domains', icon: Globe },
{ title: 'Website Content', href: '/super-admin/website-content', icon: Globe },
{ title: 'Contact', href: '/super-admin/contact', icon: Contact },
],
},
{
title: 'System',
items: [
  { title: 'Advertisement', href: '/super-admin/advertisements', icon: Settings },

{ title: 'Settings', href: '/super-admin/settings', icon: Settings },
],
},
];

interface SuperAdminSidebarProps {
isOpen: boolean;
onClose: () => void;
}

export default function SuperAdminSidebar({
isOpen,
onClose,
}: SuperAdminSidebarProps) {
const pathname = usePathname();

const [openSections, setOpenSections] = useState({
Main: true,
Subscriptions: true,
Website: false,
System: false,
});

const toggleSection = (section: keyof typeof openSections) => {
setOpenSections((prev) => ({
...prev,
[section]: !prev[section],
}));
};

const isActive = (href: string) => {
if (href === '/super-admin') {
return pathname === '/super-admin';
}
return pathname.startsWith(href);
};

const handleLogout = () => {
localStorage.clear();
sessionStorage.clear();


document.cookie = 'access_token=; path=/; max-age=0';
document.cookie = 'refresh_token=; path=/; max-age=0';
document.cookie = 'role=; path=/; max-age=0';

window.location.href = '/login';


};

return (
<>
{isOpen && ( <div
       className="fixed inset-0 bg-primary/60 z-40 md:hidden"
       onClick={onClose}
     />
)}

  <div
    className={`
      fixed md:static inset-y-0 left-0 z-50
      w-[280px] md:w-72
      bg-white border-r border-primary/10
      flex flex-col overflow-y-auto
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}
  >
    {/* Header */}
    <div className="p-6 border-b border-primary/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">F</span>
        </div>

        <div>
          <p className="text-xs text-primary -mt-1">
            Super Admin Panel
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="md:hidden p-2 text-primary hover:bg-primary/10 rounded-lg"
      >
        <X className="w-6 h-6" />
      </button>
    </div>

    {/* Menu */}
    <nav className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-3">
        {menuSections.map((section) => (
          <div
            key={section.title}
            className="border border-primary/10 rounded-xl overflow-hidden"
          >
            <button
              onClick={() =>
                toggleSection(section.title as keyof typeof openSections)
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span className="text-sm font-semibold text-primary">
                {section.title}
              </span>

              {openSections[
                section.title as keyof typeof openSections
              ] ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </button>

            {openSections[
              section.title as keyof typeof openSections
            ] && (
              <ul className="p-2 space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                          ${
                            active
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </nav>

    {/* Logout */}
    <div className="p-4 border-t border-primary/10 mt-auto">
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3.5 w-full text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  </div>
</>


);
}
