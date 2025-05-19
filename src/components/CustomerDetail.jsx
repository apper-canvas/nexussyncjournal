import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { useCollaboration } from '../context/CollaborationContext';
import CollaborationIndicator from './CollaborationIndicator';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';

// Mock data for customers - same as in CustomerList to ensure consistency
const MOCK_CUSTOMERS = [
  { id: 1, name: "Acme Corporation", industry: "Manufacturing", status: "active", email: "contact@acmecorp.com", phone: "+1 (555) 123-4567", location: "New York, USA", lastContact: "2023-04-15", contacts: 3, revenue: 1500000, website: "https://acmecorp.example.com", notes: "Key account with multiple locations", followed: true, tags: ["key-account", "manufacturing"] },
  { id: 2, name: "TechFlow Solutions", industry: "Technology", status: "active", email: "info@techflow.io", phone: "+1 (555) 987-6543", location: "San Francisco, USA", lastContact: "2023-04-12", contacts: 5, revenue: 750000, website: "https://techflow.io", notes: "Growing startup, expanding team", followed: false, tags: ["startup", "tech"] },
  { id: 3, name: "Green Energy Labs", industry: "Energy", status: "lead", email: "contact@greenenergy.com", phone: "+1 (555) 234-5678", location: "Austin, USA", lastContact: "2023-04-10", contacts: 2, revenue: 0, website: "https://greenenergylabs.com", notes: "Interested in our enterprise solution", followed: false, tags: ["lead", "energy"] },
  { id: 4, name: "QuickServe Retail", industry: "Retail", status: "inactive", email: "support@quickserve.com", phone: "+1 (555) 876-5432", location: "Chicago, USA", lastContact: "2023-03-28", contacts: 1, revenue: 350000, website: "https://quickserve.retail", notes: "Account needs follow-up", followed: false, tags: ["retail"] },
  { id: 5, name: "Harmony Healthcare", industry: "Healthcare", status: "active", email: "info@harmonyhc.org", phone: "+1 (555) 345-6789", location: "Boston, USA", lastContact: "2023-04-14", contacts: 4, revenue: 2100000, website: "https://harmony-healthcare.org", notes: "Major healthcare provider", followed: true, tags: ["healthcare", "key-account"] },
  { id: 6, name: "Rapid Logistics", industry: "Transportation", status: "active", email: "sales@rapidlogistics.com", phone: "+1 (555) 456-7890", location: "Miami, USA", lastContact: "2023-04-08", contacts: 3, revenue: 890000, website: "https://rapidlogistics.com", notes: "Shipping partner, high volume", followed: false, tags: ["logistics"] },
  { id: 7, name: "FoodDelight Catering", industry: "Food Service", status: "lead", email: "info@fooddelight.com", phone: "+1 (555) 567-8901", location: "Denver, USA", lastContact: "2023-04-05", contacts: 2, revenue: 0, website: "https://fooddelight.com", notes: "Catering for corporate events", followed: false, tags: ["food-service", "lead"] },
  { id: 8, name: "CoreTech Systems", industry: "Technology", status: "inactive", email: "support@coretech.com", phone: "+1 (555) 678-9012", location: "Seattle, USA", lastContact: "2023-03-20", contacts: 1, revenue: 420000, website: "https://coretech-systems.com", notes: "Former client, might renew", followed: false, tags: ["tech"] },
  { id: 9, name: "Bloom Gardens", industry: "Agriculture", status: "active", email: "hello@bloomgardens.com", phone: "+1 (555) 789-0123", location: "Portland, USA", lastContact: "2023-04-11", contacts: 2, revenue: 300000, website: "https://bloomgardens.com", notes: "Seasonal business, peaks in spring", followed: false, tags: ["agriculture", "seasonal"] },
  { id: 10, name: "Spark Education", industry: "Education", status: "lead", email: "admissions@sparkedu.org", phone: "+1 (555) 890-1234", location: "Atlanta, USA", lastContact: "2023-04-03", contacts: 3, revenue: 0, website: "https://spark-education.org", notes: "Interested in learning platform", followed: true, tags: ["education", "non-profit", "lead"] },
  { id: 11, name: "MetroBank Financial", industry: "Finance", status: "active", email: "info@metrobank.com", phone: "+1 (555) 901-2345", location: "Charlotte, USA", lastContact: "2023-04-07", contacts: 5, revenue: 3500000, website: "https://metrobank.com", notes: "Long-term financial partner", followed: true, tags: ["finance", "key-account"] },
  { id: 12, name: "Quantum Research", industry: "Research", status: "inactive", email: "research@quantum.org", phone: "+1 (555) 012-3456", location: "Washington D.C., USA", lastContact: "2023-03-15", contacts: 2, revenue: 180000, website: "https://quantum-research.org", notes: "Academic research institution", followed: false, tags: ["research", "non-profit"] },
];

// Mock activity data
const MOCK_ACTIVITIES = [
  { id: 'act1', customerId: 1, type: 'call', date: '2023-04-15', title: 'Sales call', description: 'Discussed upcoming product launch', user: 'Alex Williams' },
  { id: 'act2', customerId: 1, type: 'email', date: '2023-04-12', title: 'Follow-up email', description: 'Sent pricing information', user: 'Sam Lee' },
  { id: 'act3', customerId: 1, type: 'meeting', date: '2023-04-01', title: 'Quarterly review', description: 'Reviewed Q1 performance', user: 'Jordan Taylor' },
  { id: 'act4', customerId: 1, type: 'note', date: '2023-03-25', title: 'Customer feedback', description: 'Client is interested in premium support plan', user: 'Alex Williams' },
  { id: 'act5', customerId: 2, type: 'call', date: '2023-04-12', title: 'Introduction call', description: 'Introduced new account manager', user: 'Sam Lee' },
  { id: 'act6', customerId: 3, type: 'email', date: '2023-04-10', title: 'Initial contact', description: 'Responded to inquiry about services', user: 'Jordan Taylor' },
];

// Mock contacts data
const MOCK_CONTACTS = [
  { id: 'con1', customerId: 1, name: 'John Smith', title: 'CEO', email: 'john@acmecorp.com', phone: '+1 (555) 111-2233', primary: true },
  { id: 'con2', customerId: 1, name: 'Lisa Johnson', title: 'CTO', email: 'lisa@acmecorp.com', phone: '+1 (555) 111-4455', primary: false },
  { id: 'con3', customerId: 1, name: 'Michael Brown', title: 'Procurement Manager', email: 'michael@acmecorp.com', phone: '+1 (555) 111-6677', primary: false },
];

// Mock users for collaboration feature
const MOCK_USERS = {
  'user1': { id: 'user1', name: 'Alex Williams', avatar: 'AW', color: 'bg-blue-500' },
  'user2': { id: 'user2', name: 'Sam Lee', avatar: 'SL', color: 'bg-green-500' },
  'user3': { id: 'user3', name: 'Jordan Taylor', avatar: 'JT', color: 'bg-purple-500' },
};

const CustomerDetail = () => {
  const { id } = useParams();
  const customerId = parseInt(id);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({});
  const [highlightedFields, setHighlightedFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newActivity, setNewActivity] = useState({ type: 'note', title: '', description: '' });
  const [newNote, setNewNote] = useState('');
  const fieldUpdateTimers = useRef({});
  const navigate = useNavigate();
  
  const { currentUser = { id: 'user1', name: 'Current User' }, activeUsers = {}, currentEdits = {}, updateField = () => {}, viewRecord = () => {}, simulateRemoteEdit = () => {} } = useCollaboration();
  const [localEditingFields, setLocalEditingFields] = useState({});
  const fieldChangeTimeout = useRef(null);

  // Icons
  const CloseIcon = getIcon('X');
  const ArrowLeftIcon = getIcon('ArrowLeft'); 
  const EditIcon = getIcon('Edit');
  const SaveIcon = getIcon('Save');
  const StarIcon = getIcon('Star');
  const StarFilledIcon = getIcon('StarFilled');
  const UserIcon = getIcon('User');
  const UsersIcon = getIcon('Users');
  const BuildingIcon = getIcon('Building');
  const GlobeIcon = getIcon('Globe');
  const PhoneIcon = getIcon('Phone');
  const MailIcon = getIcon('Mail');
  const ClipboardIcon = getIcon('Clipboard');
  const TagIcon = getIcon('Tag');
  const DollarSignIcon = getIcon('DollarSign');
  const CalendarIcon = getIcon('Calendar');
  const TrashIcon = getIcon('Trash');
  const PlusIcon = getIcon('Plus');
  const PhoneCallIcon = getIcon('PhoneCall');
  const MessageCircleIcon = getIcon('MessageCircle');
  const AlertIcon = getIcon('AlertCircle');
  const CheckCircleIcon = getIcon('CheckCircle');

  // Fetch customer data on mount
  useEffect(() => {
    // Simulating API fetch
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a fetch call to your API
        const customerData = MOCK_CUSTOMERS.find(c => c.id === customerId);
        
        if (!customerData) {
          toast.error('Customer not found');
          navigate('/customers');
          return;
        }

        setCustomer(customerData);
        setFormData(customerData);
        
        // Get activities for this customer
        const customerActivities = MOCK_ACTIVITIES.filter(a => a.customerId === customerId);
        setActivities(customerActivities);
        
        // Get contacts for this customer
        const customerContacts = MOCK_CONTACTS.filter(c => c.customerId === customerId);
        setContacts(customerContacts);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast.error('Error loading customer data');
        setLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId, navigate]);
  
  // Watch for changes to currentEdits to update form data
  useEffect(() => {
    if (!customerId) return;
    
    const customerEdits = currentEdits[customerId] || {};
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
  }, [currentEdits, customerId, currentUser.id, formData]);
  
  
  // Notify the collaboration system that we're viewing this customer
  useEffect(() => {
    if (customerId) {
      viewRecord(customerId, 'customer');
    }
  }, [customerId, viewRecord]);
  
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
      updateField(customerId, field, value);
      
      // Clear the local editing state for this field
      setLocalEditingFields(prev => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
      });
    }, 500); // 500ms debounce
  }, [customerId, updateField]);
  
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

    // In a real app, you would make an API call to update the customer
    setCustomer({...formData});
    
    // Update mock customer data
    const updatedCustomers = MOCK_CUSTOMERS.map(c => 
      c.id === customerId ? {...formData} : c
    );
    
    // This is just for the mock data - in a real app you'd update your backend
    MOCK_CUSTOMERS.splice(0, MOCK_CUSTOMERS.length, ...updatedCustomers);

    // Mark all fields as complete
    Object.keys(formData).forEach(field => {
      if (typeof formData[field] !== 'object') {
        updateField(customerId, field, formData[field], true);
      }
    });
    
    
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
  
  // Handle adding a new activity
  const handleAddActivity = () => {
    if (!newActivity.title.trim()) {
      toast.error('Activity title is required');
      return;
    }
    
    const activity = {
      id: nanoid(),
      customerId,
      ...newActivity,
      date: new Date().toISOString().split('T')[0],
      user: currentUser.name
    };
    
    setActivities([activity, ...activities]);
    setNewActivity({ type: 'note', title: '', description: '' });
    toast.success('Activity added successfully');
  };
  
  // Handle adding a note
  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Note content is required');
      return;
    }
    
    const note = {
      id: nanoid(),
      customerId,
      type: 'note',
      title: 'Note',
      description: newNote,
      date: new Date().toISOString().split('T')[0],
      user: currentUser.name
    };
    
    setActivities([note, ...activities]);
    setNewNote('');
    toast.success('Note added successfully');
  };
  
  // Activity icon mapping
  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return <PhoneCallIcon className="h-4 w-4" />;
      case 'email':
        return <MailIcon className="h-4 w-4" />;
      case 'meeting':
        return <UsersIcon className="h-4 w-4" />;
      case 'note':
        return <ClipboardIcon className="h-4 w-4" />;
      default:
        return <MessageCircleIcon className="h-4 w-4" />;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/customers');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Back to Customers</span>
          </button>
        </div>
        <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-1/4 mb-3"></div>
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded w-full mb-4"></div>
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded w-full mb-4"></div>
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded w-full mb-4"></div>
            </div>
            <div>
              <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-1/4 mb-3"></div>
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded w-full mb-4"></div>
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded w-full mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6 text-center">
          <AlertIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Customer Not Found</h2>
          <p className="mb-4">The customer you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/customers')}
            className="btn btn-primary"
          >
            Return to Customer List
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          <span>Back to Customers</span>
        </button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-surface-800 rounded-lg shadow-card p-6 max-w-6xl mx-auto"
      >
        {/* Customer header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${
              customer.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              customer.status === 'lead' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              <BuildingIcon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{customer.name}</h1>
                <button 
                  onClick={handleToggleFollow} 
                  className="ml-2 text-yellow-400 hover:text-yellow-500 focus:outline-none"
                  aria-label={formData.followed ? "Unfollow" : "Follow"}
                  title={formData.followed ? "Unfollow" : "Follow"}
                >
                  {formData.followed ? 
                    <StarFilledIcon className="h-5 w-5" /> : 
                    <StarIcon className="h-5 w-5" />
                  }
                </button>
              </div>
              <div className="flex items-center mt-1 text-surface-600 dark:text-surface-400">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mr-2 ${
                  customer.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                  customer.status === 'lead' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {customer.status}
                </span>
                <span>{customer.industry}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 self-end md:self-auto">
            <CollaborationIndicator recordId={customerId} />
            
            {!isEditing ? (
              <Link
                to={`/customers/form/${customerId}`}
                className="btn btn-outline inline-flex items-center whitespace-nowrap"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn btn-primary inline-flex items-center whitespace-nowrap"
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                Save
              </button>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface-50 dark:bg-surface-800/70 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Annual Revenue</p>
                <h3 className="text-xl font-semibold mt-1">{formatCurrency(customer.revenue)}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSignIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-surface-50 dark:bg-surface-800/70 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Last Contact</p>
                <h3 className="text-xl font-semibold mt-1">{new Date(customer.lastContact).toLocaleDateString()}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-surface-50 dark:bg-surface-800/70 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Contacts</p>
                <h3 className="text-xl font-semibold mt-1">{contacts.length}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-surface-50 dark:bg-surface-800/70 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Activities</p>
                <h3 className="text-xl font-semibold mt-1">{activities.length}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-surface-200 dark:border-surface-700">
          <div className="flex overflow-x-auto space-x-4">
            {['overview', 'contacts', 'activities', 'notes'].map((tab) => (
              <button
                key={tab}
                className={`flex items-center whitespace-nowrap py-3 px-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary dark:text-primary-light font-medium'
                    : 'border-transparent hover:text-primary hover:border-surface-300 dark:hover:border-surface-600'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && <UserIcon className="h-4 w-4 mr-2" />}
                {tab === 'contacts' && <UsersIcon className="h-4 w-4 mr-2" />}
                {tab === 'activities' && <ClipboardIcon className="h-4 w-4 mr-2" />}
                {tab === 'notes' && <MessageCircleIcon className="h-4 w-4 mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <BuildingIcon className="w-5 h-5 mr-2 text-primary" />
                      Company Information
                    </h3>
                    
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
                            Editing by {getEditingUser('name')?.name || 'another user'}
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
                          className={`input w-full transition-all duration-300
                            ${isFieldBeingEditedByOther('industry') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                            ${highlightedFields['industry'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                            ${localEditingFields['industry'] ? 'border-primary' : ''}
                          `}
                          value={
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
                            Editing by {getEditingUser('industry')?.name || 'another user'}
                          </div>
                        )}
                      </div>

                      {/* Website Field */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Website
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
                            <GlobeIcon className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            className={`input w-full rounded-l-none transition-all duration-300
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
                        </div>
                        {isFieldBeingEditedByOther('website') && (
                          <div className="absolute right-3 top-9 flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                            <AlertIcon className="w-4 h-4 mr-1" />
                            Editing by {getEditingUser('website')?.name || 'another user'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-primary" />
                      Contact Information
                    </h3>
                    
                    <div className="space-y-4">
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
                      </div>
                      
                      {/* Phone Field */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Phone
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
                            <PhoneIcon className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            className={`input w-full rounded-l-none transition-all duration-300
                              ${isFieldBeingEditedByOther('phone') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                              ${highlightedFields['phone'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                              ${localEditingFields['phone'] ? 'border-primary' : ''}
                            `}
                            value={
                              localEditingFields['phone'] !== undefined 
                                ? localEditingFields['phone'] 
                                : formData.phone || ''
                            }
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            readOnly={!isEditing}
                            onFocus={() => setEditingField('phone')}
                            onBlur={handleBlur}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                      
                      {/* Location Field */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Location
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
                            <GlobeIcon className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            className={`input w-full rounded-l-none transition-all duration-300
                              ${isFieldBeingEditedByOther('location') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                              ${highlightedFields['location'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                              ${localEditingFields['location'] ? 'border-primary' : ''}
                            `}
                            value={
                              localEditingFields['location'] !== undefined 
                                ? localEditingFields['location'] 
                                : formData.location || ''
                            }
                            onChange={(e) => handleFieldChange('location', e.target.value)}
                            readOnly={!isEditing}
                            onFocus={() => setEditingField('location')}
                            onBlur={handleBlur}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                      
                      {/* Notes Field */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Notes
                        </label>
                        <textarea
                          className={`input w-full transition-all duration-300 min-h-[100px]
                            ${isFieldBeingEditedByOther('notes') ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                            ${highlightedFields['notes'] ? 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse' : ''}
                            ${localEditingFields['notes'] ? 'border-primary' : ''}
                          `}
                          value={
                            localEditingFields['notes'] !== undefined 
                              ? localEditingFields['notes'] 
                              : formData.notes || ''
                          }
                          onChange={(e) => handleFieldChange('notes', e.target.value)}
                          readOnly={!isEditing}
                          onFocus={() => setEditingField('notes')}
                          onBlur={handleBlur}
                          placeholder="Add notes about this customer"
                        />
                      </div>
                      
                      {/* Tags */}
                      {formData.tags && formData.tags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Tags
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-200"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <UsersIcon className="w-5 h-5 mr-2 text-primary" />
                    Contacts
                  </h3>
                  
                  <button 
                    className="btn btn-sm btn-primary inline-flex items-center"
                    onClick={() => toast.info('Add contact functionality would be implemented here')}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Contact
                  </button>
                </div>
                
                {contacts.length === 0 ? (
                  <div className="text-center py-8 bg-surface-50 dark:bg-surface-800/50 rounded-lg border border-surface-200 dark:border-surface-700">
                    <UsersIcon className="h-10 w-10 mx-auto text-surface-400" />
                    <p className="mt-2 text-surface-600 dark:text-surface-400">No contacts added yet</p>
                    <button 
                      className="mt-3 btn btn-sm btn-primary inline-flex items-center"
                      onClick={() => toast.info('Add contact functionality would be implemented here')}
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Contact
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="bg-primary/10 rounded-full p-2 mr-3">
                              <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium">{contact.name}</h4>
                                {contact.primary && (
                                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-surface-500 dark:text-surface-400">{contact.title}</p>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center text-sm">
                                  <MailIcon className="h-4 w-4 mr-2 text-surface-400" />
                                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                    {contact.email}
                                  </a>
                                </div>
                                <div className="flex items-center text-sm">
                                  <PhoneIcon className="h-4 w-4 mr-2 text-surface-400" />
                                  <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                                    {contact.phone}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button 
                              className="p-1.5 text-surface-500 hover:text-primary rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                              title="Edit contact"
                              onClick={() => toast.info(`Edit ${contact.name}`)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1.5 text-surface-500 hover:text-red-500 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                              title="Delete contact"
                              onClick={() => toast.info(`Delete ${contact.name}`)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'activities' && (
              <motion.div
                key="activities"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <ClipboardIcon className="w-5 h-5 mr-2 text-primary" />
                    Add New Activity
                  </h3>
                  
                  <div className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Type
                        </label>
                        <select 
                          className="input w-full"
                          value={newActivity.type}
                          onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                        >
                          <option value="note">Note</option>
                          <option value="call">Call</option>
                          <option value="email">Email</option>
                          <option value="meeting">Meeting</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Title
                        </label>
                        <input 
                          type="text"
                          className="input w-full"
                          value={newActivity.title}
                          onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                          placeholder="Activity title"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Description
                      </label>
                      <textarea 
                        className="input w-full min-h-[80px]"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                        placeholder="Activity details..."
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        className="btn btn-primary inline-flex items-center"
                        onClick={handleAddActivity}
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Activity
                      </button>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-4">Activity History</h3>
                
                {activities.length === 0 ? (
                  <div className="text-center py-8 bg-surface-50 dark:bg-surface-800/50 rounded-lg border border-surface-200 dark:border-surface-700">
                    <ClipboardIcon className="h-10 w-10 mx-auto text-surface-400" />
                    <p className="mt-2 text-surface-600 dark:text-surface-400">No activities recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <div 
                        key={activity.id} 
                        className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            activity.type === 'call' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            activity.type === 'email' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            activity.type === 'meeting' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                            'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{activity.title}</h4>
                                <p className="text-sm text-surface-500 dark:text-surface-400">
                                  {activity.user} · {new Date(activity.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="mt-2 text-surface-600 dark:text-surface-300">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MessageCircleIcon className="w-5 h-5 mr-2 text-primary" />
                    Add Note
                  </h3>
                  
                  <div className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                    <textarea 
                      className="input w-full min-h-[120px] mb-4"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write a note about this customer..."
                    />
                    
                    <div className="flex justify-end">
                      <button 
                        className="btn btn-primary inline-flex items-center"
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                      >
                        <SendIcon className="w-4 h-4 mr-2" />
                        Add Note
                      </button>
                    </div>
              </div>
                </div>
                
                <h3 className="text-lg font-medium mb-4">Notes History</h3>
                
                {activities.filter(a => a.type === 'note').length === 0 ? (
                  <div className="text-center py-8 bg-surface-50 dark:bg-surface-800/50 rounded-lg border border-surface-200 dark:border-surface-700">
                    <MessageCircleIcon className="h-10 w-10 mx-auto text-surface-400" />
                    <p className="mt-2 text-surface-600 dark:text-surface-400">No notes added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities
                      .filter(a => a.type === 'note')
                      .map(note => (
                        <div 
                          key={note.id} 
                          className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
                        >
                          <div className="flex items-start">
                            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-full mr-3">
                              <MessageCircleIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex justify-between items-start">
                                <p className="text-sm text-surface-500 dark:text-surface-400">
                                  {note.user} · {new Date(note.date).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="mt-2 text-surface-600 dark:text-surface-300">
                                {note.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
      </div>
      </motion.div>
    </div>
};

export default CustomerDetail;