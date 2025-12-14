import { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Save, X, LogOut } from 'lucide-react';

interface Sweet {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface RestockSweetsProps {
  onLogout: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function RestockSweets({ onLogout }: RestockSweetsProps) {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [restockAmount, setRestockAmount] = useState<{ [key: number]: number }>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSweet, setNewSweet] = useState({ 
    name: '', 
    price: '', 
    quantity: '', 
    category: '',
    image: null as File | null 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/sweet/bulk`, {
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

  const handleRestock = async (sweetId: number) => {
    const amount = restockAmount[sweetId] || 0;
    if (amount <= 0) {
      setError('Please enter a valid restock amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/sweet/${sweetId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Restock failed');
      }

      setSuccess(`Successfully restocked ${amount} units!`);
      setRestockAmount((prev) => ({ ...prev, [sweetId]: 0 }));
      setEditingId(null);
      await fetchSweets();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Restock failed');
    }
  };

  const handleAddSweet = async () => {
    if (!newSweet.name || !newSweet.price || !newSweet.quantity || !newSweet.category || !newSweet.image) {
      setError('Please fill in all fields and select an image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newSweet.name);
      formData.append('price', newSweet.price);
      formData.append('quantity', newSweet.quantity);
      formData.append('category', newSweet.category);
      formData.append('image', newSweet.image);

      const response = await fetch(`${API_BASE_URL}/api/sweet/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add sweet');
      }

      setSuccess('Sweet added successfully!');
      setNewSweet({ name: '', price: '', quantity: '', category: '', image: null });
      setShowAddForm(false);
      await fetchSweets();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add sweet');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-orange-500">Loading inventory...</div>
      </div>
    );
  }

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
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right">×</button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

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
                type="text"
                placeholder="Category"
                value={newSweet.category}
                onChange={(e) => setNewSweet({ ...newSweet, category: e.target.value })}
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
                value={newSweet.quantity}
                onChange={(e) => setNewSweet({ ...newSweet, quantity: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewSweet({ ...newSweet, image: e.target.files?.[0] || null })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent md:col-span-2"
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

        {sweets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No sweets in inventory. Add your first sweet!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-orange-500">${sweet.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Stock:</span>
                      <span className={`font-semibold ${sweet.quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
                        {sweet.quantity}
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
        )}
      </div>
    </div>
  );
}