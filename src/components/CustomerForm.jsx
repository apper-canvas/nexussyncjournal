import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

// Mock data for customers - Would come from an API in a real application
const MOCK_CUSTOMERS = [
  { id: 1, name: "Acme Corporation", industry: "Manufacturing", status: "active", email: "contact@acmecorp.com", phone: "+1 (555) 123-4567", location: "New York, USA", lastContact: "2023-04-15", contacts: 3, revenue: 1500000 },
  { id: 2, name: "TechFlow Solutions", industry: "Technology", status: "active", email: "info@techflow.io", phone: "+1 (555) 987-6543", location: "San Francisco, USA", lastContact: "2023-04-12", contacts: 5, revenue: 750000 },
  { id: 3, name: "Green Energy Labs", industry: "Energy", status: "lead", email: "contact@greenenergy.com", phone: "+1 (555) 234-5678", location: "Austin, USA", lastContact: "2023-04-10", contacts: 2, revenue: 0 },
  { id: 4, name: "QuickServe Retail", industry: "Retail", status: "inactive", email: "support@quickserve.com", phone: "+1 (555) 876-5432", location: "Chicago, USA", lastContact: "2023-03-28", contacts: 1, revenue: 350000 },
];

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    status: 'lead',
    email: '',
    phone: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  // Icons
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const SaveIcon = getIcon('Save');
  const PlusIcon = getIcon('Plus');
  const UserIcon = getIcon('User');
  const BriefcaseIcon = getIcon('Briefcase');
  const TagIcon = getIcon('Tag');
  const MailIcon = getIcon('Mail');
  const PhoneIcon = getIcon('Phone');
  const MapPinIcon = getIcon('MapPin');

  // Load customer data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In a real app, this would be an API call
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const customer = MOCK_CUSTOMERS.find(c => c.id === parseInt(id));
        if (customer) {
          setFormData({
            name: customer.name,
            industry: customer.industry,
            status: customer.status,
            email: customer.email || '',
            phone: customer.phone || '',
            location: customer.location || '',
          });
          setLoading(false);
        } else {
          toast.error('Customer not found');
          navigate('/customers');
        }
      }, 500);
    }
  }, [id, isEditMode, navigate]);

  // Handle field changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (isEditMode) {
        toast.success(`Customer "${formData.name}" has been updated`);
      } else {
        toast.success(`Customer "${formData.name}" has been added`);
      }
      setLoading(false);
      navigate('/customers');
    }, 600);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-800 rounded-lg shadow-card p-4 md:p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/customers')}
              className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
              aria-label="Back to customers"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h1>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    className={`input pl-10 w-full ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={formData.name}
                    onChange={handleFieldChange}
                    placeholder="Enter company name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BriefcaseIcon className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    name="industry"
                    className={`input pl-10 w-full ${errors.industry ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={formData.industry}
                    onChange={handleFieldChange}
                    placeholder="Enter industry"
                  />
                </div>
                {errors.industry && <p className="mt-1 text-sm text-red-500">{errors.industry}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-surface-400" />
                  </div>
                  <select
                    name="status"
                    className={`input pl-10 w-full ${errors.status ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={formData.status}
                    onChange={handleFieldChange}
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className={`input pl-10 w-full ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleFieldChange}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    className="input pl-10 w-full"
                    value={formData.phone}
                    onChange={handleFieldChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    className="input pl-10 w-full"
                    value={formData.location}
                    onChange={handleFieldChange}
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/customers')}
                className="btn bg-surface-100 text-surface-800 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-100 dark:hover:bg-surface-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary inline-flex items-center"
                disabled={loading}
              >
                {isEditMode ? (
                  <>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Update Customer
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Customer
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default CustomerForm;