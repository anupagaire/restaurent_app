import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#513012] text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              </div>
              <h2 className="text-3xl font-bold">FoodHub</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bringing the best flavors of Nepal to your table.<br />
              Fresh • Delicious • Authentic
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <div className="space-y-3 text-gray-300">
              <Link href="/menu" className="block hover:text-white transition">Our Menu</Link>
              <Link href="/about" className="block hover:text-white transition">About Us</Link>
              <Link href="/contact" className="block hover:text-white transition">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">For Restaurants</h3>
            <div className="space-y-3 text-gray-300">
              <Link href="/login" className="block hover:text-white transition">Restaurant Login</Link>
              <Link href="/super-admin" className="block hover:text-white transition">Super Admin</Link>
              <Link href="#" className="block hover:text-white transition">Partner With Us</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Get In Touch</h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 w-5 h-5" />
                <div>
                  New Road, Kathmandu<br />
                  Nepal
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <a href="tel:+9779841234567" className="hover:text-white">+977 9841234567</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <a href="mailto:info@foodnepal.com.np" className="hover:text-white">info@foodnepal.com.np</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-4 text-center text-sm text-white">
          © {new Date().getFullYear()} Food Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}