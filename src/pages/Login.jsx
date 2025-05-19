import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/iconUtils';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const MailIcon = getIcon('Mail');
  const LockIcon = getIcon('Lock');
  const EyeIcon = getIcon('Eye');
  const EyeOffIcon = getIcon('EyeOff');
  
  const [showPassword, setShowPassword] = useState(false);
  
  const validate = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const success = await login(email, password, remember);
    if (success) {
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-136px)] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-lg p-3">
              <div className="text-white font-bold text-2xl">NS</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Welcome back!</h2>
          <p className="text-surface-600 dark:text-surface-400">Sign in to continue to NexusSync CRM</p>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-surface-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input pl-10 w-full ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-surface-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input pl-10 pr-10 w-full ${errors.password ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <EyeOffIcon className="h-5 w-5 text-surface-400" /> : <EyeIcon className="h-5 w-5 text-surface-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary w-full flex justify-center items-center">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-surface-300 rounded" />
              <label htmlFor="remember" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">Remember me</label>
            </div>
            <div className="text-sm">
              <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
                Need an account?
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;