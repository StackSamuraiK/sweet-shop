import { useState } from 'react';
import { ShoppingCart, Plus, Minus, LogOut } from 'lucide-react';

interface Sweet {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface BuySweetsProps {
  sweets: Sweet[];
  onBuy: (sweetId: number, quantity: number) => void;
  onLogout: () => void;
}

export default function BuySweets({ sweets, onBuy, onLogout }: BuySweetsProps) {
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  const updateCart = (sweetId: number, delta: number) => {
    setCart((prev) => {
      const currentQuantity = prev[sweetId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      const sweet = sweets.find((s) => s.id === sweetId);

      if (sweet && newQuantity > sweet.stock) return prev;

      if (newQuantity === 0) {
        const { [sweetId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [sweetId]: newQuantity };
    });
  };

  const handleCheckout = () => {
    Object.entries(cart).forEach(([sweetId, quantity]) => {
      onBuy(Number(sweetId), quantity);
    });
    setCart({});
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [sweetId, qty]) => {
    const sweet = sweets.find((s) => s.id === Number(sweetId));
    return sum + (sweet ? sweet.price * qty : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sweet Shop</h1>
              <p className="text-sm text-gray-600">Customer Portal</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sweets.map((sweet) => (
            <div
              key={sweet.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                <span className="text-6xl">{sweet.image}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{sweet.name}</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-orange-500">${sweet.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-600">Stock: {sweet.stock}</span>
                </div>

                {sweet.stock > 0 ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateCart(sweet.id, -1)}
                      disabled={!cart[sweet.id]}
                      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">
                      {cart[sweet.id] || 0}
                    </span>
                    <button
                      onClick={() => updateCart(sweet.id, 1)}
                      disabled={cart[sweet.id] >= sweet.stock}
                      className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2 bg-red-100 text-red-600 rounded-lg font-medium">
                    Out of Stock
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{totalItems} items in cart</p>
                  <p className="text-2xl font-bold text-gray-800">${totalPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
