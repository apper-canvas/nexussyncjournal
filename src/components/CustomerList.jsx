import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

// Mock data for customers
const MOCK_CUSTOMERS = [
  { id: 1, name: "Acme Corporation", industry: "Manufacturing", status: "active", email: "contact@acmecorp.com", phone: "+1 (555) 123-4567", location: "New York, USA", lastContact: "2023-04-15", contacts: 3, revenue: 1500000 },
  { id: 2, name: "TechFlow Solutions", industry: "Technology", status: "active", email: "info@techflow.io", phone: "+1 (555) 987-6543", location: "San Francisco, USA", lastContact: "2023-04-12", contacts: 5, revenue: 750000 },
  { id: 3, name: "Green Energy Labs", industry: "Energy", status: "lead", email: "contact@greenenergy.com", phone: "+1 (555) 234-5678", location: "Austin, USA", lastContact: "2023-04-10", contacts: 2, revenue: 0 },
  { id: 4, name: "QuickServe Retail", industry: "Retail", status: "inactive", email: "support@quickserve.com", phone: "+1 (555) 876-5432", location: "Chicago, USA", lastContact: "2023-03-28", contacts: 1, revenue: 350000 },
  { id: 5, name: "Harmony Healthcare", industry: "Healthcare", status: "active", email: "info@harmonyhc.org", phone: "+1 (555) 345-6789", location: "Boston, USA", lastContact: "2023-04-14", contacts: 4, revenue: 2100000 },
  { id: 6, name: "Rapid Logistics", industry: "Transportation", status: "active", email: "sales@rapidlogistics.com", phone: "+1 (555) 456-7890", location: "Miami, USA", lastContact: "2023-04-08", contacts: 3, revenue: 890000 },
  { id: 7, name: "FoodDelight Catering", industry: "Food Service", status: "lead", email: "info@fooddelight.com", phone: "+1 (555) 567-8901", location: "Denver, USA", lastContact: "2023-04-05", contacts: 2, revenue: 0 },
  { id: 8, name: "CoreTech Systems", industry: "Technology", status: "inactive", email: "support@coretech.com", phone: "+1 (555) 678-9012", location: "Seattle, USA", lastContact: "2023-03-20", contacts: 1, revenue: 420000 },
  { id: 9, name: "Bloom Gardens", industry: "Agriculture", status: "active", email: "hello@bloomgardens.com", phone: "+1 (555) 789-0123", location: "Portland, USA", lastContact: "2023-04-11", contacts: 2, revenue: 300000 },
  { id: 10, name: "Spark Education", industry: "Education", status: "lead", email: "admissions@sparkedu.org", phone: "+1 (555) 890-1234", location: "Atlanta, USA", lastContact: "2023-04-03", contacts: 3, revenue: 0 },
  { id: 11, name: "MetroBank Financial", industry: "Finance", status: "active", email: "info@metrobank.com", phone: "+1 (555) 901-2345", location: "Charlotte, USA", lastContact: "2023-04-07", contacts: 5, revenue: 3500000 },
  { id: 12, name: "Quantum Research", industry: "Research", status: "inactive", email: "research@quantum.org", phone: "+1 (555) 012-3456", location: "Washington D.C., USA", lastContact: "2023-03-15", contacts: 2, revenue: 180000 },
];

const StatusFilter = ({ statusFilters, setStatusFilters }) => {
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "lead", label: "Lead" },
    { value: "inactive", label: "Inactive" },
  ];

  const handleStatusToggle = (status) => {
    if (statusFilters.includes(status)) {
      setStatusFilters(statusFilters.filter(s => s !== status));
    } else {
      setStatusFilters([...statusFilters, status]);
    }
  };

  const handleSelectAllStatuses = () => {
    if (statusFilters.length === statusOptions.length) {
      setStatusFilters([]);
    } else {
      setStatusFilters(statusOptions.map(option => option.value));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Status:</span>
      <button
        onClick={handleSelectAllStatuses}
        className={`px-2.5 py-1 text-xs font-medium rounded-md ${
          statusFilters.length === statusOptions.length || statusFilters.length === 0
            ? 'bg-primary text-white'
            : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
        }`}
      >
        {statusFilters.length === statusOptions.length ? 'Clear All' : 'All'}
      </button>
      {statusOptions.map(status => (
        <button
          key={status.value}
          onClick={() => handleStatusToggle(status.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md ${
            statusFilters.includes(status.value)
              ? getStatusBgColor(status.value)
              : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
          }`}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};

const getStatusBgColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    case 'lead':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
    case 'inactive':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    default:
      return 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300';
  }
};

const CustomerList = () => {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState(['active', 'lead', 'inactive']);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    status: 'lead',
    email: '',
    phone: '',
    location: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  // Icons
  const PlusIcon = getIcon('Plus');
  const SearchIcon = getIcon('Search');
  const XIcon = getIcon('X');
  const CheckIcon = getIcon('Check');
  const EyeIcon = getIcon('Eye');
  const EditIcon = getIcon('Edit');
  const TrashIcon = getIcon('Trash');
  const SortAscIcon = getIcon('ChevronUp');
  const SortDescIcon = getIcon('ChevronDown');
  const AlertCircleIcon = getIcon('AlertCircle');
  const CheckCircleIcon = getIcon('CheckCircle');

  // Filter customers based on search term and status filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilters.includes(customer.status);
    
    return matchesSearch && matchesStatus;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const currentCustomers = sortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle field change in form
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add/edit customer
  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode && selectedCustomer) {
      // Update existing customer
      const updatedCustomers = customers.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...customer, ...formData, lastContact: new Date().toISOString().split('T')[0] }
          : customer
      );
      setCustomers(updatedCustomers);
      toast.success(`Customer "${formData.name}" has been updated`);
    } else {
      // Add new customer
      const newCustomer = {
        ...formData,
        id: customers.length + 1,
        lastContact: new Date().toISOString().split('T')[0],
        contacts: 0,
        revenue: 0
      };
      setCustomers([...customers, newCustomer]);
      toast.success(`Customer "${formData.name}" has been added`);
    }
    
    // Reset form
    setShowAddForm(false);
    setFormData({
      name: '',
      industry: '',
      status: 'lead',
      email: '',
      phone: '',
      location: '',
    });
    setSelectedCustomer(null);
    setIsEditMode(false);
  };

  // Handle edit button click
  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      industry: customer.industry,
      status: customer.status,
      email: customer.email || '',
      phone: customer.phone || '',
      location: customer.location || '',
    });
    setIsEditMode(true);
    setShowAddForm(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (confirmDelete) {
      setCustomers(customers.filter(customer => customer.id !== confirmDelete.id));
      toast.success(`Customer "${confirmDelete.name}" has been deleted`);
      setConfirmDelete(null);
    }
  };

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    // In a real app, this would navigate to the customer detail page
    // For now, we'll show a toast notification
    toast.info(`Viewing customer details for "${customer.name}"`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-surface-800 rounded-lg shadow-card p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <XIcon className="h-5 w-5 text-surface-400 hover:text-surface-600" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => {
                setShowAddForm(true);
                setIsEditMode(false);
                setFormData({
                  name: '',
                  industry: '',
                  status: 'lead',
                  email: '',
                  phone: '',
                  location: '',
                });
              }}
              className="btn btn-primary inline-flex items-center self-start sm:self-auto"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <StatusFilter 
            statusFilters={statusFilters} 
            setStatusFilters={setStatusFilters} 
          />
        </div>
        
        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 border border-surface-200 dark:border-surface-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setIsEditMode(false);
                    setSelectedCustomer(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCustomerSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="input w-full"
                      value={formData.name}
                      onChange={handleFieldChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="industry"
                      className="input w-full"
                      value={formData.industry}
                      onChange={handleFieldChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      className="input w-full"
                      value={formData.status}
                      onChange={handleFieldChange}
                      required
                    >
                      <option value="lead">Lead</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="input w-full"
                      value={formData.email}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="input w-full"
                      value={formData.phone}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="input w-full"
                      value={formData.location}
                      onChange={handleFieldChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setIsEditMode(false);
                      setSelectedCustomer(null);
                    }}
                    className="btn bg-surface-100 text-surface-800 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-100 dark:hover:bg-surface-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary inline-flex items-center"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Update Customer' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-900/20"
            >
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Confirm Deletion</h2>
              <p className="mb-4 text-red-700 dark:text-red-300">
                Are you sure you want to delete customer "{confirmDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="btn bg-surface-100 text-surface-800 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-100 dark:hover:bg-surface-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 inline-flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Customer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {currentCustomers.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircleIcon className="w-12 h-12 mx-auto text-surface-400" />
            <h3 className="mt-4 text-lg font-medium">No customers found</h3>
            <p className="mt-2 text-surface-500 dark:text-surface-400">
              {searchTerm || statusFilters.length < 3 
                ? "Try adjusting your search or filters." 
                : "Start by adding your first customer."}
            </p>
            {(!searchTerm && statusFilters.length === 3) && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 btn btn-primary inline-flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                <thead className="bg-surface-50 dark:bg-surface-800">
                  <tr>
                    <th 
                      onClick={() => handleSort('name')}
                      className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      <div className="flex items-center">
                        Name
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'ascending' 
                            ? <SortAscIcon className="w-4 h-4 ml-1" />
                            : <SortDescIcon className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('industry')}
                      className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      <div className="flex items-center">
                        Industry
                        {sortConfig.key === 'industry' && (
                          sortConfig.direction === 'ascending' 
                            ? <SortAscIcon className="w-4 h-4 ml-1" />
                            : <SortDescIcon className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'ascending' 
                            ? <SortAscIcon className="w-4 h-4 ml-1" />
                            : <SortDescIcon className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('location')}
                      className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 hidden md:table-cell"
                    >
                      <div className="flex items-center">
                        Location
                        {sortConfig.key === 'location' && (
                          sortConfig.direction === 'ascending' 
                            ? <SortAscIcon className="w-4 h-4 ml-1" />
                            : <SortDescIcon className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('lastContact')}
                      className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 hidden md:table-cell"
                    >
                      <div className="flex items-center">
                        Last Contact
                        {sortConfig.key === 'lastContact' && (
                          sortConfig.direction === 'ascending' 
                            ? <SortAscIcon className="w-4 h-4 ml-1" />
                            : <SortDescIcon className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                  {currentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-surface-500 dark:text-surface-400">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.industry}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBgColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">{customer.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        {new Date(customer.lastContact).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </button>
                        <button 
                          onClick={() => handleEditClick(customer)}
                          className="text-primary hover:text-primary-dark dark:hover:text-primary-light"
                          title="Edit customer"
                        >
                          <EditIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(customer)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          title="Delete customer"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-4">
                <div className="text-sm text-surface-500 dark:text-surface-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === i + 1
                          ? 'bg-primary text-white'
                          : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerList;