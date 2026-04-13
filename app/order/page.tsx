
'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { menuItems } from '@/data/mockData';

export default function Order() {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
    alert(`${item.name} added to cart!`);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Menu Section */}
            <div className="lg:col-span-7">
              <h1 className="text-5xl font-bold mb-3">Order Online</h1>
              <p className="text-white/70 mb-10">Delivery in 35-45 minutes • Thamel & nearby areas</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                  <div key={item.id}>
                    <MenuItemCard item={item} />
                    <button 
                      onClick={() => addToCart(item)}
                      className="mt-3 w-full bg-amber-500 hover:bg-amber-600 py-4 rounded-2xl font-semibold"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-3xl p-8 border border-white/10">
                <h2 className="text-3xl font-semibold mb-6">Your Cart ({cart.length})</h2>
                
                {cart.length === 0 ? (
                  <p className=" py-12 text-center">Your cart is empty</p>
                ) : (
                  <>
                    {cart.map((item, index) => (
                      <div key={item.cartId} className="flex justify-between py-4 border-b border-white/10">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-white/60">1x</p>
                        </div>
                        <p className="font-semibold">Rs. {item.price}</p>
                      </div>
                    ))}
                    
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex justify-between text-xl font-semibold">
                        <span>Total</span>
                        <span>Rs. {total}</span>
                      </div>
                      <button className="mt-8 w-full bg-green-500 hover:bg-green-600 py-5 rounded-3xl text-lg font-bold">
                        PROCEED TO CHECKOUT
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}