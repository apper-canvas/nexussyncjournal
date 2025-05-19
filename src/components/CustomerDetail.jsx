import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { useCollaboration } from '../context/CollaborationContext';
import CollaborationIndicator from './CollaborationIndicator';

const CustomerDetail = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...customer });
  const [highlightedFields, setHighlightedFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const fieldUpdateTimers = useRef({});
  const { currentUser, activeUsers, currentEdits, updateField, viewRecord, simulateRemoteEdit } = useCollaboration();
  const [localEditingFields, setLocalEditingFields] = useState({});
  const fieldChangeTimeout = useRef(null);

  // Icons
  const CloseIcon = getIcon('X');
  const EditIcon = getIcon('Edit');
  const SaveIcon = getIcon('Save');
  const StarIcon = getIcon('Star');
  const StarFilledIcon = getIcon('StarFilled');
  const UserIcon = getIcon('User');
  const BuildingIcon = getIcon('Building');
  const GlobeIcon = getIcon('Globe');
  const PhoneIcon = getIcon('Phone');
  const MailIcon = getIcon('Mail');
  const ClipboardIcon = getIcon('Clipboard');
  const AlertIcon = getIcon('AlertCircle');
  const CheckCircleIcon = getIcon('CheckCircle');
  
  // Watch for changes to currentEdits to update form data
  useEffect(() => {
    if (!customer?.id) return;
    
    const customerEdits = currentEdits[customer.id] || {};
    let hasChanges = false;
    let newFormData = { ...formData };
    
    // Update form data with edits from other users
    Object.entries(customerEdits).forEach(([fieldName, edit]) => {
      if (edit.userId !== currentUser.id && formData[fieldName] !== edit.value) {
        newFormData[fieldName] = edit.value;
        setHighlightedFields(prev => ({ ...prev, [fieldName]: Date.now() }));
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setFormData(newFormData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEdits, customer?.id, currentUser.id]);
  
  
  // Notify the collaboration system that we're viewing this customer
  useEffect(() => {
    if (customer?.id) {
      viewRecord(customer.id, 'customer');
    }
  }, [customer?.id, viewRecord]);
  
  // Get edits for this customer
  const customerEdits = currentEdits[customer?.id] || {};
  
  // Get other users viewing/editing this customer
  const otherUsers = activeUsers[customer?.id] || {};
  
  // Clean up highlighted fields after animation
  useEffect(() => {
    Object.entries(highlightedFields).forEach(([field, timestamp]) => {
      const timeoutId = setTimeout(() => {
        setHighlightedFields(prev => {
          const newHighlighted = { ...prev };
          delete newHighlighted[field];
          return newHighlighted;
        });
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    });
  }, [highlightedFields]);
  
  // Debounced field update
  const debouncedFieldUpdate = useCallback((field, value) => {
    // Clear any existing timeout for this field
    if (fieldUpdateTimers.current[field]) {
      clearTimeout(fieldUpdateTimers.current[field]);
    }
    
    // Set local state immediately for responsive UI
    setLocalEditingFields(prev => ({ ...prev, [field]: value }));
    
    // Set a timeout to update the collaboration state
    fieldUpdateTimers.current[field] = setTimeout(() => {
      // Send the update through collaboration context
      updateField(customer.id, field, value);
      
      // Clear the local editing state for this field
      setLocalEditingFields(prev => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
      });
    }, 500); // 500ms debounce
  }, [customer.id, updateField]);
  
  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Use the debounced update
    debouncedFieldUpdate(field, value);
  };

  // Reset editing state when clicking outside a field
  const handleBlur = () => {
    setTimeout(() => {
      setEditingField(null);
    }, 200);
  };
  
  // Toggle following this customer
  const handleToggleFollow = () => {
    const newStatus = !formData.followed;
    setFormData(prev => ({ ...prev, followed: newStatus }));
    toast.success(newStatus ? 'You are now following this customer' : 'You are no longer following this customer');
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as complete
    Object.keys(formData).forEach(field => updateField(customer.id, field, formData[field], true));
    
    setIsEditing(false);
    toast.success('Customer details updated successfully');
  };
  
  // Check if a field is being edited by another user
  const isFieldBeingEditedByOther = (fieldName) => {
    return customerEdits[fieldName] && customerEdits[fieldName].userId !== currentUser.id;
  };
  
  // Get the user who is editing a field
  const getEditingUser = (fieldName) => {
    return customerEdits[fieldName]?.user || null;
  };

  // Example function to simulate another user making an edit
  const handleSimulateEdit = () => {
    // Pick a random mock user that isn't the current user
    const otherUserIds = Object.keys(MOCK_USERS).filter(id => id !== currentUser.id);
    const randomUserId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];
    // Simulate them editing the name field
    simulateRemoteEdit(randomUserId, customer.id, 'name', formData.name + ' Inc.');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-surface-800 rounded-lg shadow-card p-6 max-w-4xl w-full mx-auto"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <div className="bg-primary/10 rounded-lg p-2 mr-3">
            <BuildingIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center">
              {formData.name}
              <button 
                onClick={handleToggleFollow} 
                className="ml-2 text-yellow-400 hover:text-yellow-500"
                aria-label={formData.followed ? "Unfollow" : "Follow"}
              >
                {formData.followed ? <StarFilledIcon className="h-5 w-5" /> : <StarIcon className="h-5 w-5" />}
              </button>
            </h2>
            <p className="text-surface-500 dark:text-surface-400">{formData.industry}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <CollaborationIndicator recordId={customer.id} />

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline inline-flex items-center whitespace-nowrap"
            >
              <EditIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSubmit}
                className="btn btn-primary inline-flex items-center whitespace-nowrap"
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                Save
              </button>
              
              {/* This is just for demo/testing purposes */}
              <button
                onClick={handleSimulateEdit}
                className="btn btn-outline inline-flex items-center bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200"
                title="For demo purposes: simulate another user editing"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-primary" />
            Company Information
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className={`input w-full transition-all duration-300 
                    ${isFieldBeingEditedByOther('name') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''} 
                    ${highlightedFields['name'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                    ${localEditingFields['name'] ? 'border-primary' : ''}
                  `}
                  value={
                    // Prioritize in this order: 
                    // 1. Local editing value (for responsiveness)
                    // 2. Form data value (from state)
                    localEditingFields['name'] !== undefined 
                      ? localEditingFields['name'] 
                      : formData.name
                  }
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  readOnly={!isEditing}
                  onFocus={() => setEditingField('name')}
                  onBlur={handleBlur}
                />
                {isFieldBeingEditedByOther('name') && (
                  <div className="absolute right-3 top-9 flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                    <AlertIcon className="w-4 h-4 mr-1" />
                    Editing by {getEditingUser('name')?.name}
                  </div>
                )}
              </div>
              
              {/* Industry Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Industry
                </label>
                <input
                  className={`input w-full transition-all duration-300
                    ${isFieldBeingEditedByOther('industry') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                    ${highlightedFields['industry'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                    ${localEditingFields['industry'] ? 'border-primary' : ''}
                  `}
                  value={
                    // Prioritize in this order: 
                    // 1. Local editing value (for responsiveness)
                    // 2. Form data value (from state)
                    localEditingFields['industry'] !== undefined 
                      ? localEditingFields['industry'] 
                      : formData.industry
                  }
                  onChange={(e) => handleFieldChange('industry', e.target.value)}
                  readOnly={!isEditing}
                  onFocus={() => setEditingField('industry')}
                  onBlur={handleBlur}
                />
                {isFieldBeingEditedByOther('industry') && (
                  <div className="absolute right-3 top-9 flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                    <AlertIcon className="w-4 h-4 mr-1" />
                    Editing by {getEditingUser('industry')?.name}
                  </div>
                )}

              {/* Website Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  className={`input w-full transition-all duration-300
                    ${isFieldBeingEditedByOther('website') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                    ${highlightedFields['website'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                    ${localEditingFields['website'] ? 'border-primary' : ''}
                  `}
                  value={
                    localEditingFields['website'] !== undefined 
                      ? localEditingFields['website'] 
                      : formData.website || ''
                  }
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  readOnly={!isEditing}
                  onFocus={() => setEditingField('website')}
                  onBlur={handleBlur}
                  placeholder="https://example.com"
                />
                {isFieldBeingEditedByOther('website') && (
                  <div className="absolute right-3 top-9 flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                    <AlertIcon className="w-4 h-4 mr-1" />
                    Editing by {getEditingUser('website')?.name}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Email
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
                    <MailIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    className={`input w-full rounded-l-none transition-all duration-300
                      ${isFieldBeingEditedByOther('email') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${highlightedFields['email'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                      ${localEditingFields['email'] ? 'border-primary' : ''}
                    `}
                    value={
                      localEditingFields['email'] !== undefined 
                        ? localEditingFields['email'] 
                        : formData.email || ''
                    }
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    readOnly={!isEditing}
                    onFocus={() => setEditingField('email')}
                    onBlur={handleBlur}
                    placeholder="contact@example.com"
                  />
                </div>
                {isFieldBeingEditedByOther('email') && (
                  <div className="absolute right-3 top-9 flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                    <AlertIcon className="w-4 h-4 mr-1" />
                    Editing by {getEditingUser('email')?.name}
                  </div>
                )}
              </div>
              </div>
              
              {/* Add more fields here as needed */}
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerDetail;