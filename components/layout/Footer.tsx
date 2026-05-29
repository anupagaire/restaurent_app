import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';

interface Brand {
  logo: string;
  name: string;
  tagline: string;
  description: string;
}

interface LinkItem {
  href: string;
  label: string;
}

interface ContactItems {
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
}

interface Column {
  type: 'links' | 'contact';
  title: string;
  items: LinkItem[] | ContactItems;
}

interface Social {
  href: string;
  icon: string;
  name: string;
}

interface FooterData {
  brand: Brand;
  columns: Column[];
  socials: Social[];
}
interface FooterProps {
  data: FooterData | null;
}
function SocialIcon({ icon }: { icon: string }) {
  const cls = 'w-4 h-4';
  switch (icon.toLowerCase()) {
    case 'facebook':  return <Facebook className={cls} />;
    case 'instagram': return <Instagram className={cls} />;
    case 'twitter':   return <Twitter className={cls} />;
    default:          return null;
  }
}

function BrandSection({ brand }: { brand: Brand }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {brand.logo ? (
          <div className="relative w-20 h-20">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              sizes="(max-width: 768px) 112px, 160px"
              className="object-contain"
            />
          </div>
        ) : null}
        <h2 className="text-3xl font-bold">{brand.name}</h2>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">
        {brand.description}
        <br />
        {brand.tagline}
      </p>
    </div>
  );
}

function LinksColumn({ column }: { column: Column }) {
  const items = column.items as LinkItem[];
  return (
    <div>
      <h3 className="font-semibold mb-4 text-lg">{column.title}</h3>
      <div className="space-y-3 text-gray-300">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block hover:text-white transition">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ContactColumn({ column }: { column: Column }) {
  const contact = column.items as ContactItems;
  return (
    <div>
      <h3 className="font-semibold mb-4 text-lg">{column.title}</h3>
      <div className="space-y-4 text-gray-300">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 w-5 h-5 shrink-0" />
          <div>
            {contact.addressLine1}
            <br />
            {contact.addressLine2}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 shrink-0" />
          <a href={`tel:${contact.phone}`} className="hover:text-white">
            {contact.phone}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 shrink-0" />
          <a href={`mailto:${contact.email}`} className="hover:text-white">
            {contact.email}
          </a>
        </div>
      </div>
    </div>
  );
}
export default function Footer({ data }: FooterProps) {
  if (!data) return null;

  return (
    <footer className="bg-[#513012] text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <BrandSection brand={data.brand} />
          {data.columns.map((col) =>
            col.type === 'contact' ? (
              <ContactColumn key={col.title} column={col} />
            ) : (
              <LinksColumn key={col.title} column={col} />
            )
          )}
        </div>

        <div className="border-t border-white/20 mt-12 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white">
          <span>© {new Date().getFullYear()} Food Nepal. All rights reserved.</span>
          {data.socials.length > 0 && (
            <div className="flex items-center gap-4">
              {data.socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="hover:text-gray-300 transition">
                  <SocialIcon icon={s.icon} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}