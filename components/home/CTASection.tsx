import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="bg-[#513012] text-white py-20">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2                       className="text-4xl md:text-5xl font-serif text-white"
>Ready to Enjoy Great Food?</h2>
        <p className="text-xl text-white/80 mb-10">
          Scan the QR code on your table and start ordering now
        </p>
        <Link href="/contact">
          <button className="bg-white text-[#513012] px-12 py-5 rounded-2xl text-xl font-semibold hover:bg-orange-50 transition-all">
Contact Us          </button>
        </Link>
      </div>
      <div className="border-t border-white/20 mt-7 text-center text-sm text-white"></div>

    </div>
    
  );
}