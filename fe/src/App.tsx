import { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import BuySweets from './components/BuySweets';
import RestockSweets from './components/RestockSweets';

interface User {
  email: string;
  role: 'user' | 'admin';
  id?: number;
  name?: string;
}

function App() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') as 'user' | 'admin' | null;
      const userData = localStorage.getItem('userData');
      const shopData = localStorage.getItem('shopData');

      if (token && role) {
        if (role === 'admin' && shopData) {
          const shop = JSON.parse(shopData);
          setUser({
            email: shop.email,
            role: 'admin',
            id: shop.id,
            name: shop.name,
          });
        } else if (role === 'user' && userData) {
          const userInfo = JSON.parse(userData);
          setUser({
            email: userInfo.email,
            role: 'user',
            id: userInfo.id,
          });
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleRegisterSuccess = (token: string, userData: any, role: 'user' | 'admin') => {
    if (role === 'admin') {
      setUser({
        email: userData.email,
        role: 'admin',
        id: userData.id,
        name: userData.name,
      });
    } else {
      setUser({
        email: userData.email,
        role: 'user',
        id: userData.id,
      });
    }
  };

  const handleLoginSuccess = (token: string, userData: any, role: 'user' | 'admin') => {
    if (role === 'admin') {
      setUser({
        email: userData.email,
        role: 'admin',
        id: userData.id,
        name: userData.name,
      });
    } else {
      setUser({
        email: userData.email,
        role: 'user',
        id: userData.id,
      });
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    localStorage.removeItem('shopData');
    
    setUser(null);
    setView('login');
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-orange-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not logged in
  if (!user) {
    if (view === 'register') {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setView('login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setView('register')}
      />
    );
  }

  // Show appropriate dashboard based on role
  if (user.role === 'admin') {
    return <RestockSweets onLogout={handleLogout} />;
  }

  return <BuySweets onLogout={handleLogout} />;
}

export default App;