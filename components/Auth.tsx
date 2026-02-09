import React, { useState } from 'react';
import { loginUser } from '../services/storage';
import { ShieldCheck, HardHat } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password && (isLogin || company)) {
      // Simulate API call
      await loginUser(username, company || 'My Spray Foam Co');
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-brand-600 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SprayFoam Pro</h1>
          <p className="text-brand-100 text-sm">Contractor Management System</p>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2">
            <button
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${isLogin ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400'}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${!isLogin ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400'}`}
              onClick={() => setIsLogin(false)}
            >
              Register Company
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="e.g. Acme Insulation"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              {isLogin ? 'Access Dashboard' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to the Terms of Service.
            <br />Stored locally for demo purposes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;