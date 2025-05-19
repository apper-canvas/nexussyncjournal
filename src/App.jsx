import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import { CollaborationProvider } from './context/CollaborationContext';
import ActivityFeed from './components/ActivityFeed';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const location = useLocation();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  const MoonIcon = getIcon('Moon');
  const SunIcon = getIcon('Sun');

  const LogOutIcon = getIcon('LogOut');

  return (
    <AuthProvider>
      <CollaborationProvider>
        <div className="flex flex-col min-h-screen">
          <header className="bg-white dark:bg-surface-800 shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-primary rounded-lg p-1.5">
                  <div className="text-white font-bold text-xl">NS</div>
                </div>
                <h1 className="text-xl font-bold">NexusSync CRM</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <Routes>
                  <Route path="/" element={<ActivityFeed />} />
                </Routes>
                
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
                
                <AuthNavigation />
              </div>
            </div>
          </header>
          
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <Routes location={location}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
          
          <footer className="bg-white dark:bg-surface-800 shadow-inner py-4">
            <div className="container mx-auto px-4 text-center text-surface-500 dark:text-surface-400">
              <p>© {new Date().getFullYear()} NexusSync CRM. All rights reserved.</p>
            </div>
          </footer>
          
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={darkMode ? "dark" : "light"}
          />
        </div>
      </CollaborationProvider>
    </AuthProvider>
  );
}

function AuthNavigation() {
  const { currentUser, logout } = useAuth();
  
  return currentUser ? (
    <button onClick={logout} className="flex items-center p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
      <LogOutIcon className="w-5 h-5" />
    </button>
  ) : null;
}

export default App;