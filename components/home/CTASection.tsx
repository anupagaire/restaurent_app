import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative bg-[#faf7f0] overflow-hidden py-3">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      {/* Bottom gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      {/* Decorative circles */}
      <div
        aria-hidden="true"
        className="absolute -left-32 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-accent/8 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -left-20 top-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-accent/6 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-accent/8 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-accent/6 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 text-center">

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight mb-6">
          Ready to Enjoy{' '}
          <span className="italic text-secondary">
            Great Food?
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg md:text-xl  font-light leading-relaxed mb-12 max-w-xl mx-auto">
          Scan the QR code on your table and start ordering now
        </p>

        {/* CTA Button */}
        <Link href="/contact">
          <span className="group inline-flex items-center gap-3 cursor-pointer">
            <span className="relative inline-flex items-center gap-3 bg-secondary text-white px-10 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-accent/20">
              Contact Us
              {/* Arrow icon */}
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}