export default function Hero({ restaurant }) {
  return (
    <section className="relative h-screen flex items-center bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1015/2000/1200')] bg-cover bg-center brightness-75"></div>
      
      <div className="relative z-10 max-w-screen-2xl mx-auto px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 h-10 rounded-full text-amber-400 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            OPEN TODAY • {restaurant.openingHours}
          </div>

          <h1 className="text-7xl md:text-8xl font-bold leading-none tracking-tighter text-white" 
              style={{ fontFamily: 'Playfair Display, serif' }}>
            {restaurant.name.toUpperCase()}
          </h1>
          <p className="text-4xl text-amber-300 mt-3">{restaurant.tagline}</p>

          <p className="mt-8 text-xl text-white/80 max-w-md">
            {restaurant.description}
          </p>

          <div className="flex gap-4 mt-12">
            <a href="/menu" className="bg-white text-black px-10 py-5 rounded-3xl text-lg font-semibold hover:bg-amber-300 flex items-center gap-3">
              Explore Menu
            </a>
            <a href="/order" className="border-2 border-white px-10 py-5 rounded-3xl text-lg font-semibold hover:bg-white/10">
              Order Online
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}