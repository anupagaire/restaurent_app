export default function MenuItemCard({ item }) {
  return (
    <div className="group  rounded-3xl overflow-hidden border border-white/5 hover:border-amber-400/30 menu-card">
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.isPopular && (
          <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full">
            POPULAR
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-semibold">{item.name}</h3>
            <p className="text-white/70 text-sm mt-1 line-clamp-2">{item.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-400">Rs. {item.price}</p>
          </div>
        </div>

        <button className="mt-6 w-full bg-white/ hover:bg-amber-500 hover:text-black py-4 rounded-2xl font-semibold text-sm tracking-widest">
          ADD TO CART
        </button>
      </div>
    </div>
  );
}