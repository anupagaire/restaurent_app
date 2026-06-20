'use client';
import Image from "/next/image";
export default function MenuItemCard({ item }) {
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border border-secondary/20 hover:border-primary transition-all duration-500 shadow-lg hover:shadow-2xl">
      
      <div className="relative h-64 overflow-hidden">
        <Image 
          src={item.image || '/images/placeholder-food.jpg'} 
          alt={item.name}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/20 to-transparent" />

        {item.isPopular && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md">
            ★ POPULAR
          </div>
        )}

        <div className="absolute bottom-4 left-4 bg-white text-primary font-bold text-2xl px-5 py-2 rounded-2xl shadow-lg">
          Rs. {item.price}
        </div>
      </div>

      <div className="p-7 bg-white">
        <h3 className="text-2xl font-semibold text-secondary tracking-tight mb-3">
          {item.name}
        </h3>
        
        <p className="text-primary/70 text-[15px] leading-relaxed line-clamp-3 min-h-[66px]">
          {item.description || "Freshly prepared with authentic spices and premium ingredients."}
        </p>

        <button 
          className="mt-8 w-full bg-gradient-to-r from-secondary via-primary to-primary 
                     hover:from-primary hover:via-primary hover:to-secondary
                     text-white py-4 rounded-2xl font-semibold text-lg tracking-wider 
                     transition-all duration-300 active:scale-[0.98] shadow-md hover:shadow-xl"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}