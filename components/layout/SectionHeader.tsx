'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  // Content
  title: string;
  highlight?: string;
  subtitle?: string;
  badge?: string;
  linkText?: string;
  linkHref?: string;
  
  // Animation & Layout
  withAnimation?: boolean;
  withDivider?: boolean;
  
  // Custom Classes
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  badgeClassName?: string;
  linkClassName?: string;
  dividerClassName?: string;
  
  // Custom Colors (optional overrides)
  titleColor?: string;
  highlightColor?: string;
  subtitleColor?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  linkBgColor?: string;
  linkTextColor?: string;
  linkHoverBgColor?: string;
  linkHoverTextColor?: string;
  dividerColor?: string;
}

export default function SectionHeader({
  // Content
  title,
  highlight,
  subtitle,
  badge,
  linkText,
  linkHref,
  
  // Animation & Layout
  withAnimation = true,
  withDivider = true,
  
  // Custom Classes
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  badgeClassName = '',
  linkClassName = '',
  dividerClassName = '',
  
  // Custom Colors (defaults to theme colors)
  titleColor = 'text-[#271302]',
  highlightColor = 'text-accent',
  subtitleColor = 'text-[#271302]/60',
  badgeBgColor = 'bg-accent/30',
  badgeTextColor = 'text-primary',
  linkBgColor = 'bg-transparent',
  linkTextColor = 'text-primary',
  linkHoverBgColor = 'hover:bg-secondary',
  linkHoverTextColor = 'hover:text-white',
  dividerColor = 'bg-primary/10',
}: SectionHeaderProps) {
  
  const content = (
    <div className={`mb-14 md:mb-18 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        
        {/* Left Side: Badge + Title + Subtitle */}
        <div>
          {badge && (
            <span className={`inline-block ${badgeBgColor} ${badgeTextColor} text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 ${badgeClassName}`}>
              {badge}
            </span>
          )}

          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light ${titleColor} leading-tight tracking-tight ${titleClassName}`}>
            {title}{' '}
            {highlight && (
              <span className={`italic ${highlightColor}`}>
                {highlight}
              </span>
            )}
          </h2>
          
          {subtitle && (
            <p className={`mt-3 text-sm ${subtitleColor} max-w-lg ${subtitleClassName}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side: Link/Button */}
        {linkText && linkHref && (
          <Link
            href={linkHref}
            className={`inline-flex items-center gap-2 text-sm font-semibold border border-secondary/30 rounded-xl px-4 py-2 transition-all ${linkBgColor} ${linkTextColor} ${linkHoverBgColor} ${linkHoverTextColor} ${linkClassName}`}
          >
            {linkText}
            <svg 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={1.5} 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>
      
      {/* Bottom Divider */}
      {withDivider && (
        <div className={`mt-8 w-full h-px ${dividerColor} ${dividerClassName}`} />
      )}
    </div>
  );

  // Wrap in Framer Motion if animation is enabled
  if (withAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}