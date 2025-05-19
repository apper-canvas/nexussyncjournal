import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

// Create context
const CollaborationContext = createContext();

// Mock user data - in a real app this would come from authentication
const MOCK_USERS = {
  'user1': { id: 'user1', name: 'John Smith', role: 'Admin', avatar: '👨‍💼', color: '#4361ee' },
  'user2': { id: 'user2', name: 'Emily Johnson', role: 'Sales', avatar: '👩‍💼', color: '#f72585' },
  'user3': { id: 'user3', name: 'Michael Wong', role: 'Support', avatar: '👨‍💻', color: '#7209b7' },
};

export const CollaborationProvider = ({ children }) => {
  // Generate a unique session ID for this user
  const [sessionId] = useState(() => nanoid(8));
  // Current user - in a real app this would come from auth
  const [currentUser] = useState(MOCK_USERS.user1);
  // Socket instance
  const [socket, setSocket] = useState(null);
  // Tracks which record the user is currently viewing
  const [activeRecord, setActiveRecord] = useState(null);
  // Tracks users viewing the same records
  const [activeUsers, setActiveUsers] = useState({});
  // Tracks user edits in real-time
  const [currentEdits, setCurrentEdits] = useState({});
  // Tracks recent activity notifications
  const [notifications, setNotifications] = useState([]);
  // Tracks records the user is following
  const [followedRecords, setFollowedRecords] = useState([]);
  // Tracks socket connection status
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Handler for user presence updates
  const handleUserPresence = useCallback((data) => {
    setActiveUsers(prev => ({
      ...prev,
      [data.recordId]: {
        ...(prev[data.recordId] || {}),
        [data.userId]: {
          user: MOCK_USERS[data.userId] || { 
            id: data.userId, 
            name: 'Unknown User', 
            avatar: '👤',
            color: '#64748b'
          },
          action: data.action,
          lastActive: new Date().toISOString()
        }
      }
    }));
  }, []);
  
  // Define handler for edit updates
  const handleEditUpdate = useCallback((data) => {
    setCurrentEdits(prev => ({
      ...prev, 
      [data.recordId]: { 
        ...(prev[data.recordId] || {}), 
        [data.fieldName]: {
          userId: data.userId,
          user: MOCK_USERS[data.userId] || { name: 'Unknown User' },
          value: data.value,
          timestamp: new Date().toISOString()
        }
      }
    }));
    
    // Add notification if this is a record the user follows
    if (followedRecords.includes(data.recordId) && data.userId !== currentUser.id) {
      const notification = {
        id: nanoid(),
        userId: data.userId,
        user: MOCK_USERS[data.userId] || { name: 'Unknown User' },
        recordId: data.recordId,
        action: 'edited',
        fieldName: data.fieldName,
        timestamp: new Date().toISOString()
      };
      
      setNotifications(prev => [notification, ...prev].slice(0, 20));
      toast.info(`${notification.user.name} edited ${data.fieldName} of record #${data.recordId}`);
    }
  }, [followedRecords, currentUser.id]);

  // Function to simulate remote edits (for demo purposes)
  const simulateRemoteEdit = useCallback((userId, recordId, fieldName, value) => {
    const editData = {
      recordId,
      userId,
      fieldName,
      value
    };
    
    handleEditUpdate(editData);
    
    // Also update the activeUsers to show they're editing
    setActiveUsers(prev => ({
      ...prev,
      [recordId]: {
        ...(prev[recordId] || {}),
        [userId]: {
          user: MOCK_USERS[userId],
          action: 'editing',
          lastActive: new Date().toISOString()
        }
      }
    }));
  }, [handleEditUpdate]);
  
  // Initialize socket connection
  useEffect(() => {
    // In a real application, this would connect to your actual server
    const socketInstance = io('https://nexussync-collaboration.example.com', {
      // For development with no server, we disable actual connection attempts
      autoConnect: false,
      transports: ['websocket']
    });
    
    setSocket(socketInstance);
    
    // Mock the socket connection behavior for demo purposes
    setTimeout(() => {
      setConnectionStatus('connected');
      toast.info(`Connected to real-time collaboration server`);
      simulateInitialCollaborators();
    }, 1000);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  // Simulate other users joining for demo purposes
  const simulateInitialCollaborators = useCallback(() => {
    const mockUsers = Object.values(MOCK_USERS).filter(user => user.id !== currentUser.id);
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    // Simulate user2 joining after 2 seconds
    setTimeout(() => {
      handleUserPresence({
        recordId: '1',  // Assuming customer id 1 is being viewed
        userId: randomUser.id,
        action: 'viewing'
      });
      
      // Simulate an edit after 5 seconds
      setTimeout(() => {
        simulateRemoteEdit(randomUser.id, '1', 'industry', 'Technology Services');
      }, 5000);
      
    }, 2000);
  }, [currentUser.id, handleUserPresence]);
  
  // Helper to register socket event handlers and mock their behavior
  useEffect(() => {
    if (!socket) return;
    
    // Mock socket event registrations
    // In a real app, these would be actual socket.on() handlers
    socket.on('user_presence', handleUserPresence);
    socket.on('edit_update', handleEditUpdate);
    
    return () => {
      socket.off('user_presence', handleUserPresence);
      socket.off('edit_update', handleEditUpdate);
    };
  }, [socket, handleUserPresence, handleEditUpdate]);
  
  // Function to view a record
  const viewRecord = useCallback((recordId, recordType) => {
    setActiveRecord({ id: recordId, type: recordType });
    
    // Simulate sending a presence event to the server
    if (socket) {
      // In a real app, this would be a socket.emit() call
      // Mock receiving presence data from other users
      setTimeout(() => {
        handleUserPresence({
          recordId,
          userId: 'user2',
          action: 'viewing'
        });
      }, 2000);
    }
  }, [socket, handleUserPresence]);
  
  // Function to update a field in real-time
  const updateField = useCallback((recordId, fieldName, value, isComplete = false) => {
    if (socket) {
      // In a real app, this would be a socket.emit() call
      // For our demo, we'll simulate the response
      handleEditUpdate({
        recordId,
        userId: currentUser.id,
        fieldName,
        value
      });
      
      // Update activeUsers to show current user is editing
      setActiveUsers(prev => ({
        ...prev,
        [recordId]: {
          ...(prev[recordId] || {}),
          [currentUser.id]: {
            user: currentUser,
            action: isComplete ? 'viewing' : 'editing',
            lastActive: new Date().toISOString()
          }
        }
      }));
      
      // Simulate other users receiving the update
      if (isComplete) {
        // This would be handled by the server broadcasting to other clients
        // For demo purposes, we're handling it locally
      }
    }
  }, [socket, currentUser, handleEditUpdate]);
  
  return (
    <CollaborationContext.Provider value={{ 
      currentUser, sessionId, activeRecord, activeUsers, currentEdits, notifications, 
      followedRecords, setFollowedRecords, viewRecord, updateField, connectionStatus, simulateRemoteEdit 
    }}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);