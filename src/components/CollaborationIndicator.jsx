import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollaboration } from '../context/CollaborationContext';
import { getIcon } from '../utils/iconUtils';

const CollaborationIndicator = ({ recordId, small = false }) => {
  const { activeUsers, connectionStatus } = useCollaboration();
  const [showDetails, setShowDetails] = useState(false);
  const UsersIcon = getIcon('Users');
  const EditIcon = getIcon('Edit2');
  const EyeIcon = getIcon('Eye');
  const WifiIcon = getIcon('Wifi');

  // Get users for this record
  const recordUsers = activeUsers[recordId] || {};
  const userCount = Object.keys(recordUsers).length;
  
  // Don't render if no users are viewing/editing
  if (userCount === 0) return null;
  
  return (
    <div className="relative flex items-center gap-2">
      {!small && (
        <div 
          className={`flex items-center ${
            connectionStatus === 'connected' 
              ? 'text-green-500' 
              : connectionStatus === 'connecting' 
                ? 'text-amber-500'
                : 'text-red-500'
          }`}
          title={`Connection: ${connectionStatus}`}
        >
          <WifiIcon className="h-4 w-4" />
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full ${small ? 'text-xs' : 'text-sm'}`}
        title="View collaborators"
      >
        <UsersIcon className={`${small ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
        <span className="font-medium">
          {userCount}
          {!small && Object.values(recordUsers).some(u => u.action === 'editing') && (
            <span className="ml-1 animate-pulse">•</span>
          )}
        </span>
      </motion.button>
      
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-surface-800 rounded-lg shadow-lg z-10 w-64 overflow-hidden"
          >
            <div className="p-3 border-b border-surface-200 dark:border-surface-700">
              <h3 className="font-medium">Collaborating Now</h3>
            </div>
            <ul className="divide-y divide-surface-200 dark:divide-surface-700 max-h-60 overflow-y-auto">
              {Object.values(recordUsers).map((userData) => (
                <li 
                  key={userData.user.id} 
                  className={`p-3 flex items-center ${
                    userData.action === 'editing' 
                      ? 'bg-primary/5 dark:bg-primary/10' 
                      : ''
                  }`}
                  title={`Last active: ${new Date(userData.lastActive).toLocaleTimeString()}`}
                >
                  <div 
                    className="w-8 h-8 flex items-center justify-center rounded-full mr-3 text-lg"
                    style={{ backgroundColor: userData.user.color + '20', color: userData.user.color }}
                  >
                    {userData.user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{userData.user.name}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center">
                      {userData.action === 'viewing' ? <EyeIcon className="h-3 w-3 mr-1" /> : <EditIcon className="h-3 w-3 mr-1" />}
                      <span className={userData.action === 'editing' ? 'text-primary font-medium' : ''}>
                        {userData.action === 'viewing' ? 'Viewing' : 'Editing'} | {userData.user.role}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationIndicator;