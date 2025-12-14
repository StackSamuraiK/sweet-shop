import { useState } from 'react';
import { Store, Plus, Edit2, Save, X, LogOut } from 'lucide-react';

interface Sweet {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface RestockSweetsProps {
  sweets: Sweet[];
  onRestock: (sweetId: number, quantity: number) => void;
  onAddSweet: (name: string, price: number, stock: number, image: string) => void;
  onLogout: () => void;
}

export default function RestockSweets({ sweets, onRestock, onAddSweet, onLogout }: RestockSweetsProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [restockAmount, setRestockAmount] = useState<{ [key: number]: number }>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSweet, setNewSweet] = useState({ name: '', price: '', stock: '', image: '' });

  const handleRestock = (sweetId: number) => {
    const amount = restockAmount[sweetId] || 0;
    if (amount > 0) {
      onRestock(sweetId, amount);
      setRestockAmount((prev) => ({ ...prev, [sweetId]: 0 }));
      setEditingId(null);
    }
  };

  const handleAddSweet = () => {
    if (newSweet.name && newSweet.price && newSweet.stock && newSweet.image) {
      onAddSweet(
        newSweet.name,
        parseFloat(newSweet.price),
        parseInt(newSweet.stock),
        newSweet.image
      );
      setNewSweet({ name: '', price: '', stock: '', image: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sweet Shop</h1>
              <p className="text-sm text-gray-600">Admin Portal</p>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showAddForm ? 'Cancel' : 'Add New Sweet'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Sweet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Sweet Name"
                value={newSweet.name}
                onChange={(e) => setNewSweet({ ...newSweet, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Price"
                value={newSweet.price}
                onChange={(e) => setNewSweet({ ...newSweet, price: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Initial Stock"
                value={newSweet.stock}
                onChange={(e) => setNewSweet({ ...newSweet, stock: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Emoji (e.g., 🍬)"
                value={newSweet.image}
                onChange={(e) => setNewSweet({ ...newSweet, image: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddSweet}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Add Sweet
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-orange-500">${sweet.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className={`font-semibold ${sweet.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                      {sweet.stock}
                    </span>
                  </div>
                </div>

                {editingId === sweet.id ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Restock amount"
                      value={restockAmount[sweet.id] || ''}
                      onChange={(e) =>
                        setRestockAmount((prev) => ({
                          ...prev,
                          [sweet.id]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestock(sweet.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setRestockAmount((prev) => ({ ...prev, [sweet.id]: 0 }));
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingId(sweet.id)}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Restock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
