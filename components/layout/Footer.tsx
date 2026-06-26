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
interface FooterProps {
  data?: FooterData | null;
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
      <Link 
        href="/" 
        className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity group"
      >
        {brand.logo ? (
          <div className="relative w-62 h-42">
  <Image
    src={brand.logo}
    alt={brand.name}
    fill
    sizes="158px"
    className="object-contain transition-transform group-hover:scale-105"
  />
</div>
        ) : null}
        
        <h2 className="text-3xl font-bold text-accent group-hover:text-primary transition-colors">
          {brand.name}
        </h2>
      </Link>

    

<div
  className="text-primary/70 text-sm leading-relaxed"
  dangerouslySetInnerHTML={{ __html: brand.description }}
/>
<p className="text-primary/70 text-sm mt-1">{brand.tagline}</p>
    </div>
  );
}

function LinksColumn({ column }: { column: Column }) {
  const items = column.items as LinkItem[];
  return (
    <div>
      <h3 className="font-semibold mb-4 text-lg text-accent">{column.title}</h3>
      <div className="space-y-3 text-primary/70">
        {items.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className="block hover:text-accent transition-colors"
          >
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
      <h3 className="font-semibold mb-4 text-lg text-accent">{column.title}</h3>
      <div className="space-y-4 text-primary/70">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 w-5 h-5 shrink-0 text-accent" />
          <div>
            {contact.addressLine1}
            <br />
            {contact.addressLine2}
          </div>
        </div>
       
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 shrink-0 text-accent" />
          <a href={`tel:${contact.phone}`} className="hover:text-accent transition-colors">
            {contact.phone}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 shrink-0 text-accent" />
          <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors">
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
    <footer className="bg-primary/10 text-black" >
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

        <div className="border-t border-accent/20 mt-12 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm ">
          <span>© {new Date().getFullYear()} Yummy Nepal. All rights reserved.</span>
          {data.socials.length > 0 && (
            <div className="flex items-center gap-4">
              {data.socials.map((s) => (
                <a 
                  key={s.href} 
                  href={s.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={s.name} 
                  className="w-9 h-9 rounded-full bg-secondary/30 flex items-center justify-center hover:bg-accent hover:text-primary transition-all"
                >
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