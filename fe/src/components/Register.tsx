import { useState } from 'react';
import { UserPlus, Store } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: (token: string, user: any, role: 'user' | 'admin') => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Register({ onSwitchToLogin, onRegisterSuccess }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (role === 'admin' && !shopName) {
      setError('Please enter your shop name');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = role === 'admin' ? '/api/shop/register' : '/api/auth/register';
      
      const body = role === 'admin' 
        ? { email, password, name: shopName, role: 'Admin' }
        : { email, password, role: 'User' };

      console.log('Registering with:', { endpoint, body }); // Debug log

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Response:', data); // Debug log

      if (!response.ok) {
        // Show detailed error if available
        const errorMsg = data.msg || data.message || data.error?.issues?.[0]?.message || 'Registration failed';
        throw new Error(errorMsg);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);
      
      if (role === 'admin' && data.shop) {
        localStorage.setItem('shopData', JSON.stringify(data.shop));
        onRegisterSuccess(data.token, data.shop, 'admin');
      } else if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
        onRegisterSuccess(data.token, data.user, 'user');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-orange-500 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
        <p className="text-center text-gray-600 mb-8">Join our sweet community</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={() => setRole(role === 'user' ? 'admin' : 'user')}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
              role === 'admin'
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-orange-500'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="font-medium">
              {role === 'admin' ? 'Opening a Shop' : 'Want to Open a Shop?'}
            </span>
          </button>

          {role === 'admin' && (
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="My Sweet Shop"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-orange-500 hover:text-orange-600 font-medium"
            disabled={isLoading}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}