import Link from 'next/link';
import { FileText, Layout, Info, Mail,Star,HelpCircle } from 'lucide-react';

const contentSections = [
{ title: 'Navbar & Hero', href: '/super-admin/website-content/navbar-hero', icon: Layout, description: 'Edit navbar links, buttons, hero slides' },
{ title: 'How It Works', href: '/super-admin/website-content/how-it-works', icon: HelpCircle, description: 'Edit steps shown on the how it works section' },
  { title: 'Testimonials', href: '/super-admin/website-content/testimonials', icon: Star, description: 'Edit testimonials section and restaurant cards' },
  { title: 'About Sections', href: '/super-admin/website-content/about-sections', icon: Info, description: 'Edit commitment section and why choose us' },
  { title: 'Footer',       href: '/super-admin/website-content/footer',  icon: Layout,   description: 'Edit footer links, contact info, socials' },
  { title: 'About Page',   href: '/super-admin/website-content/aboutpage',   icon: Info,     description: 'Edit about us content' },
];

export default function WebsiteContentPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-[#513012]">Website Content</h1>
      <p className="text-gray-500 mb-8">Manage your public website content from here.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contentSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-start gap-4 p-5 border border-[#513012]/15 rounded-xl hover:border-[#513012]/40 hover:bg-[#513012]/5 transition-all group"
          >
            <div className="w-10 h-10 bg-[#513012]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#513012]/20 transition">
              <section.icon className="w-5 h-5 text-[#513012]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{section.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}