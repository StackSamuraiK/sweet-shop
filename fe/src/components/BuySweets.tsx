import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, LogOut } from 'lucide-react';

interface Sweet {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface BuySweetsProps {
  onLogout: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function BuySweets({ onLogout }: BuySweetsProps) {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/sweet/bulk`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch sweets');
      }

      setSweets(data.response || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load sweets');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCart = (sweetId: number, delta: number) => {
    setCart((prev) => {
      const currentQuantity = prev[sweetId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      const sweet = sweets.find((s) => s.id === sweetId);

      if (sweet && newQuantity > sweet.quantity) return prev;

      if (newQuantity === 0) {
        const { [sweetId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [sweetId]: newQuantity };
    });
  };

  const handleCheckout = async () => {
    setError('');
    setPurchaseSuccess('');

    try {
      const token = localStorage.getItem('token');
      const purchasePromises = Object.entries(cart).map(([sweetId, quantity]) =>
        fetch(`${API_BASE_URL}/api/sweet/${sweetId}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        })
      );

      const responses = await Promise.all(purchasePromises);
      const results = await Promise.all(responses.map(r => r.json()));

      const failedPurchases = results.filter((r, i) => !responses[i].ok);
      
      if (failedPurchases.length > 0) {
        throw new Error(failedPurchases[0].message || 'Some purchases failed');
      }

      setPurchaseSuccess('Purchase successful!');
      setCart({});
      await fetchSweets();

      setTimeout(() => setPurchaseSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    }
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [sweetId, qty]) => {
    const sweet = sweets.find((s) => s.id === Number(sweetId));
    return sum + (sweet ? sweet.price * qty : 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-orange-500">Loading sweets...</div>
      </div>
    );
  }

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
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {purchaseSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {purchaseSuccess}
          </div>
        )}

        {sweets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No sweets available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sweets.map((sweet) => (
              <div
                key={sweet.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                  <img 
                    src={sweet.image} 
                    alt={sweet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext y="50" font-size="60"%3E🍬%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{sweet.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{sweet.category}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-orange-500">${sweet.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-600">Stock: {sweet.quantity}</span>
                  </div>

                  {sweet.quantity > 0 ? (
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
                        disabled={cart[sweet.id] >= sweet.quantity}
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
        )}

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