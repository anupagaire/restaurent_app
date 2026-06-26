import RotatingDish from "@/components/home/RotatingDish";
import Link from "next/link";

export default function Teaser() {
  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="relative overflow-hidden rounded-3xl border border-accent bg-gradient-to-br from-accent via-accent-50 to-white p-6 text-center shadow-lg">

        {/* Background decoration */}
        <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-accent-200/30 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent">
            🔥 Trending Comparisons
          </div>

          <h2 className="mt-5 text-3xl font-bold text-secondary">
            <RotatingDish />
          </h2>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Discover which restaurants serve the highest-rated dishes in
            Nepal based on real customer reviews and ratings.
          </p>

          {/* Search-style preview */}
          <div className="mx-auto mt-5 max-w-sm rounded-xl border border-accent bg-white px-4 py-3 shadow-sm">
            <span className="text-secondary">🔍 </span>
            <RotatingDish />
          </div>

          <Link
            href="/menusearch"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6a3e17] hover:shadow-lg"
          >
            Compare Dishes →
          </Link>

          <p className="mt-4 text-xs text-accent">
            🏆 Rankings based on real customer ratings
          </p>
        </div>
      </div>
    </div>
  );
}