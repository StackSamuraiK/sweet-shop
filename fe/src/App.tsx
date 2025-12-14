import { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import BuySweets from './components/BuySweets';
import RestockSweets from './components/RestockSweets';

interface User {
  email: string;
  role: 'user' | 'admin';
}

interface Sweet {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

function App() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [sweets, setSweets] = useState<Sweet[]>([
    { id: 1, name: 'Chocolate Bar', price: 2.99, stock: 50, image: '🍫' },
    { id: 2, name: 'Lollipop', price: 0.99, stock: 100, image: '🍭' },
    { id: 3, name: 'Gummy Bears', price: 3.49, stock: 75, image: '🐻' },
    { id: 4, name: 'Cotton Candy', price: 4.99, stock: 30, image: '🍬' },
    { id: 5, name: 'Candy Cane', price: 1.49, stock: 60, image: '🍬' },
    { id: 6, name: 'Jelly Beans', price: 2.79, stock: 90, image: '🫘' },
  ]);

  const handleRegister = (email: string, password: string, role: 'user' | 'admin') => {
    setUser({ email, role });
  };

  const handleLogin = (email: string, password: string) => {
    setUser({ email, role: 'user' });
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const handleBuy = (sweetId: number, quantity: number) => {
    setSweets((prev) =>
      prev.map((sweet) =>
        sweet.id === sweetId ? { ...sweet, stock: sweet.stock - quantity } : sweet
      )
    );
  };

  const handleRestock = (sweetId: number, quantity: number) => {
    setSweets((prev) =>
      prev.map((sweet) =>
        sweet.id === sweetId ? { ...sweet, stock: sweet.stock + quantity } : sweet
      )
    );
  };

  const handleAddSweet = (name: string, price: number, stock: number, image: string) => {
    const newSweet: Sweet = {
      id: Math.max(...sweets.map((s) => s.id)) + 1,
      name,
      price,
      stock,
      image,
    };
    setSweets((prev) => [...prev, newSweet]);
  };

  if (!user) {
    if (view === 'register') {
      return <Register onRegister={handleRegister} onSwitchToLogin={() => setView('login')} />;
    }
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
  }

  if (user.role === 'admin') {
    return (
      <RestockSweets
        sweets={sweets}
        onRestock={handleRestock}
        onAddSweet={handleAddSweet}
        onLogout={handleLogout}
      />
    );
  }

  return <BuySweets sweets={sweets} onBuy={handleBuy} onLogout={handleLogout} />;
}

export default App;
