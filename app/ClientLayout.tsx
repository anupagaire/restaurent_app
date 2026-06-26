'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientLayout({
  children,
  navbarProps,
  footerData,
}: {
  children: React.ReactNode;
  navbarProps: any;
  footerData: any;
}) {
  const pathname = usePathname();

  const shouldHideLayout = 
    pathname.startsWith('/restaurant-admin') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/customer') ||
    // Hide only on individual restaurant pages (slug), but show on /restaurants list
    /^\/restaurants\/[^/]+$/.test(pathname)||
  /^\/restaurants\/[^/]+\/.*$/.test(pathname); 
const isHomePage = pathname === '/';

  return (
    <AuthProvider>
        {!shouldHideLayout && <Navbar {...navbarProps} darkBg={!isHomePage} />}
      {/* {!shouldHideLayout && <Navbar {...navbarProps} />} */}
      {children}
      {  <Footer  data={footerData} />}
   
    </AuthProvider>
  );
}