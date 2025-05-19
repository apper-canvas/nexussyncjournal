import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import { useCollaboration } from '../context/CollaborationContext';

const ActivityFeed = () => {
  const { notifications } = useCollaboration();
  const [showFeed, setShowFeed] = useState(false);
  
  // Icons
  const BellIcon = getIcon('Bell');
  const XIcon = getIcon('X');
  const EditIcon = getIcon('Edit');
  const PlusIcon = getIcon('Plus');
  const TrashIcon = getIcon('Trash');
  const UserPlusIcon = getIcon('UserPlus');
  
  // Format timestamp to relative time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return date.toLocaleDateString();
  };
  
  // Get icon based on action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'edited': return EditIcon;
      case 'created': return PlusIcon;
      case 'deleted': return TrashIcon;
      case 'assigned': return UserPlusIcon;
      default: return EditIcon;
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowFeed(!showFeed)}
        className="relative p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
        aria-label="Activity Feed"
      >
        <BellIcon className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {showFeed && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-lg shadow-lg z-20 overflow-hidden"
          >
            <div className="p-3 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
              <h3 className="font-medium">Recent Activity</h3>
              <button onClick={() => setShowFeed(false)} className="text-surface-500 hover:text-surface-700">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-surface-500">No recent activity</div>
              ) : (
                <ul className="divide-y divide-surface-200 dark:divide-surface-700">
                  {notifications.map((notification) => {
                    const ActionIcon = getActionIcon(notification.action);
                    return (
                      <li key={notification.id} className="p-3 hover:bg-surface-50 dark:hover:bg-surface-700/50">
                        <div className="flex items-start">
                          <div 
                            className="w-8 h-8 flex items-center justify-center rounded-full mr-3 text-lg flex-shrink-0"
                            style={{ backgroundColor: notification.user.color + '20', color: notification.user.color }}
                          >
                            {notification.user.avatar}
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{notification.user.name}</span>
                              <span className="text-surface-600 dark:text-surface-400"> {notification.action} </span>
                              <span className="font-medium">
                                {notification.fieldName ? `the ${notification.fieldName} field` : 'a record'}
                              </span>
                            </p>
                            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityFeed;