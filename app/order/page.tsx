'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { menuItems } from '@/data/mockData';

// Define types
interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
}

interface CartItem extends MenuItem {
  cartId: number;
  quantity: number;
}

export default function Order() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, cartId: Date.now(), quantity: 1 }];
      }
    });

    alert(`${item.name} added to cart!`);
  };

  const updateQuantity = (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (cartId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 text-black">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Menu Section */}
            <div className="lg:col-span-7">
              <div className="mb-12">
                <h1 className="text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  Order Online
                </h1>
                <p className="text-xl text-white/70">
                  Delivery in 35-45 minutes • Thamel & nearby areas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map((item: MenuItem) => (
                  <div key={item.id} className="group">
                    <MenuItemCard item={item} />
                   
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-semibold">Your Cart</h2>
                  <div className="bg-amber-500 text-black text-sm font-bold px-4 py-1 rounded-full">
                    {cart.length} items
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="mx-auto w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                      🛒
                    </div>
                    <p className=" text-lg">Your cart is empty</p>
                    <p className="text-sm text-white/40 mt-2">Add some delicious items from the menu</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {cart.map((item) => (
                        <div
                          key={item.cartId}
                          className="flex gap-4 rounded-2xl p-4 group"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-lg">{item.name}</p>
                            <p className="text-amber-500 font-semibold mt-1">
                              Rs. {item.price}
                            </p>
                          </div>

                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-sm"
                            >
                              Remove
                            </button>

                            <div className="flex items-center gap-3 rounded-xl px-3 py-1">
                              <button
                                onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                              >
                                −
                              </button>
                              <span className="font-mono w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/10">
                      <div className="flex justify-between text-2xl font-semibold mb-8">
                        <span>Total</span>
                        <span className="text-amber-500">Rs. {total}</span>
                      </div>

                      <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all py-6 rounded-3xl text-xl font-bold shadow-xl shadow-green-500/30 active:scale-[0.985]">
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

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d97706;
          border-radius: 20px;
        }
      `}</style>
    </>
  );
}