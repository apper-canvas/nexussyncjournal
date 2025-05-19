import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { useCollaboration } from '../context/CollaborationContext';
import CollaborationIndicator from './CollaborationIndicator';

const CustomerDetail = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...customer });
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const { currentUser, activeUsers, currentEdits, updateField, viewRecord } = useCollaboration();
  
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
  
  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setEditingField(field);
    
    // Notify others that this field is being edited
    updateField(customer.id, field, value);
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
    
    setIsEditing(false);
    onSave(formData);
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
          <div>
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
              className="btn btn-outline inline-flex items-center"
            >
              <EditIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary inline-flex items-center"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              Save
            </button>
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
                  className={`input w-full ${isFieldBeingEditedByOther('name') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                  value={formData.name}
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
                  type="text"
                  className={`input w-full ${isFieldBeingEditedByOther('industry') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                  value={formData.industry}
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