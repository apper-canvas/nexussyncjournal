import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Create context
const AuthContext = createContext();

// Mock user database - in a real app this would be on the server
const MOCK_USERS = [
  { 
    id: 'user1', 
    name: 'John Smith', 
    email: 'john@example.com', 
    password: 'password123', 
    role: 'Admin', 
    avatar: '👨‍💼', 
    color: '#4361ee' 
  },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Login function
  const login = async (email, password, remember = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user
      const user = MOCK_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (user) {
        // Create a user object without password
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        toast.success(`Welcome back, ${user.name}!`);
        return true;
      } else {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
        return false;
      }
    } catch (err) {
      setError('An error occurred during login');
      toast.error('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('User with this email already exists');
        toast.error('User with this email already exists');
        return false;
      }
      
      // In a real app, this would send data to the server
      toast.success('Registration successful! You can now log in.');
      return true;
    } catch (err) {
      setError('An error occurred during registration');
      toast.error('An error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);