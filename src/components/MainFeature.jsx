import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCollaboration } from '../context/CollaborationContext';
import { getIcon } from '../utils/iconUtils';
import CustomerDetail from './CustomerDetail';

// Mock data for customers
const MOCK_CUSTOMERS = [
  { id: 1, name: "Acme Corporation", industry: "Manufacturing", status: "active", contacts: 3, deals: 2, tickets: 1, lastContact: "2023-04-15" },
  { id: 2, name: "TechFlow Solutions", industry: "Technology", status: "active", contacts: 5, deals: 1, tickets: 0, lastContact: "2023-04-12" },
  { id: 3, name: "Green Energy Labs", industry: "Energy", status: "lead", contacts: 2, deals: 0, tickets: 0, lastContact: "2023-04-10" },
  { id: 4, name: "QuickServe Retail", industry: "Retail", status: "inactive", contacts: 1, deals: 0, tickets: 3, lastContact: "2023-03-28" },
  { id: 5, name: "Harmony Healthcare", industry: "Healthcare", status: "active", contacts: 4, deals: 3, tickets: 2, lastContact: "2023-04-14" },
];

// Mock data for deals/sales
const MOCK_DEALS = [
  { id: 1, customer: "Acme Corporation", title: "Annual software subscription", value: 25000, stage: "proposal", probability: 60, expectedClose: "2023-05-10" },
  { id: 2, name: "TechFlow Solutions", title: "Custom integration project", value: 15000, stage: "negotiation", probability: 80, expectedClose: "2023-05-05" },
  { id: 3, name: "Harmony Healthcare", title: "Support package upgrade", value: 8000, stage: "qualified", probability: 40, expectedClose: "2023-05-20" },
  { id: 4, name: "Green Energy Labs", title: "Pilot program", value: 5000, stage: "lead", probability: 20, expectedClose: "2023-06-15" },
  { id: 5, name: "Acme Corporation", title: "Hardware renewal", value: 12000, stage: "closed_won", probability: 100, expectedClose: "2023-04-01" },
];

// Mock data for tickets
const MOCK_TICKETS = [
  { id: 1, customer: "Acme Corporation", title: "Cannot access reporting module", priority: "high", status: "open", created: "2023-04-10", assignee: "John Doe" },
  { id: 2, customer: "QuickServe Retail", title: "Error when processing returns", priority: "critical", status: "in_progress", created: "2023-04-12", assignee: "Sarah Johnson" },
  { id: 3, customer: "Harmony Healthcare", title: "Need help with custom exports", priority: "medium", status: "open", created: "2023-04-14", assignee: "Unassigned" },
  { id: 4, customer: "QuickServe Retail", title: "User permissions issue", priority: "low", status: "pending", created: "2023-04-08", assignee: "Mike Wilson" },
  { id: 5, customer: "QuickServe Retail", title: "Mobile app crashing", priority: "high", status: "open", created: "2023-04-15", assignee: "John Doe" },
];

// Mock data for tasks
const MOCK_TASKS = [
  { id: 1, title: "Follow up with Acme Corp", relatedTo: "Acme Corporation", dueDate: "2023-04-20", status: "pending", priority: "high" },
  { id: 2, title: "Prepare proposal for TechFlow", relatedTo: "TechFlow Solutions", dueDate: "2023-04-18", status: "in_progress", priority: "high" },
  { id: 3, title: "Review Green Energy contract", relatedTo: "Green Energy Labs", dueDate: "2023-04-25", status: "pending", priority: "medium" },
  { id: 4, title: "Call Harmony Healthcare about renewal", relatedTo: "Harmony Healthcare", dueDate: "2023-04-19", status: "pending", priority: "medium" },
  { id: 5, title: "Resolve QuickServe critical ticket", relatedTo: "QuickServe Retail", dueDate: "2023-04-17", status: "in_progress", priority: "critical" },
];

const customerForm = {
  name: { label: "Company Name", type: "text", required: true },
  industry: { label: "Industry", type: "text", required: true },
  status: { 
    label: "Status", 
    type: "select", 
    required: true,
    options: [
      { value: "lead", label: "Lead" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ]
  },
  website: { label: "Website", type: "text" },
  notes: { label: "Notes", type: "textarea" },
};

const dealForm = {
  title: { label: "Deal Title", type: "text", required: true },
  customer: { label: "Customer", type: "text", required: true },
  value: { label: "Value ($)", type: "number", required: true },
  stage: { 
    label: "Stage", 
    type: "select", 
    required: true,
    options: [
      { value: "lead", label: "Lead" },
      { value: "qualified", label: "Qualified" },
      { value: "proposal", label: "Proposal" },
      { value: "negotiation", label: "Negotiation" },
      { value: "closed_won", label: "Closed (Won)" },
      { value: "closed_lost", label: "Closed (Lost)" }
    ]
  },
  probability: { label: "Probability (%)", type: "number" },
  expectedClose: { label: "Expected Close Date", type: "date" },
};

const ticketForm = {
  title: { label: "Ticket Subject", type: "text", required: true },
  customer: { label: "Customer", type: "text", required: true },
  description: { label: "Description", type: "textarea", required: true },
  priority: { 
    label: "Priority", 
    type: "select", 
    required: true,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" }
    ]
  },
  assignee: { label: "Assignee", type: "text" },
};

const taskForm = {
  title: { label: "Task Title", type: "text", required: true },
  relatedTo: { label: "Related To", type: "text" },
  dueDate: { label: "Due Date", type: "date", required: true },
  priority: { 
    label: "Priority", 
    type: "select", 
    required: true,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" }
    ]
  },
  description: { label: "Description", type: "textarea" },
};

const MainFeature = ({ tabId }) => {
  const [showForm, setShowForm] = useState(false);
  const [currentForm, setCurrentForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const { updateField } = useCollaboration();
  
  // Get required icons
  const PlusIcon = getIcon('Plus');
  const SearchIcon = getIcon('Search');
  const XIcon = getIcon('X');
  const CheckIcon = getIcon('CheckCircle');
  const UserIcon = getIcon('User');
  const BriefcaseIcon = getIcon('Briefcase');
  const TicketIcon = getIcon('Ticket');
  const CalendarIcon = getIcon('Calendar');
  const AlertCircleIcon = getIcon('AlertCircle');
  const ArrowUpIcon = getIcon('ArrowUp');
  const ArrowDownIcon = getIcon('ArrowDown');
  const EditIcon = getIcon('Edit');
  const TrashIcon = getIcon('Trash');
  const EyeIcon = getIcon('Eye');
  
  // Initial data setup
  useEffect(() => {
    setShowForm(false);
    setSelectedItem(null);
    setSearchTerm('');
    
    // Set the appropriate form based on the active tab
    switch(tabId) {
      case 'customers':
        setCurrentForm(customerForm);
        break;
      case 'sales':
        setCurrentForm(dealForm);
        break;
      case 'support':
        setCurrentForm(ticketForm);
        break;
      case 'tasks':
        setCurrentForm(taskForm);
        break;
      default:
        setCurrentForm({});
    }
  }, [tabId]);
  
  // Reset form data when form visibility changes
  useEffect(() => {
    if (!showForm) {
      setFormData({});
    }
  }, [showForm]);
  
  // Get the appropriate data based on the active tab
  const getData = () => {
    switch(tabId) {
      case 'customers':
        return MOCK_CUSTOMERS;
      case 'sales':
        return MOCK_DEALS;
      case 'support':
        return MOCK_TICKETS;
      case 'tasks':
        return MOCK_TASKS;
      default:
        return [];
    }
  };
  
  // Filter data based on search term
  const filteredData = getData().filter(item => {
    const searchFields = Object.values(item);
    return searchFields.some(field => 
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    let isValid = true;
    Object.entries(currentForm).forEach(([key, field]) => {
      if (field.required && !formData[key]) {
        isValid = false;
        toast.error(`${field.label} is required`);
      }
    });
    
    if (!isValid) return;
    
    // Show success message
    toast.success('Item added successfully!');
    setShowForm(false);
    
    // In a real app, we would add the item to the database
    // For this MVP, we're just showing the UI flow
  };
  
  // Handle item action (edit/delete)
  const handleItemAction = (action, item) => {
    if (action === 'edit') {
      setSelectedItem(item);
      setFormData(item);
      setShowForm(true);
      
      // For real-time collaboration, notify others that we're editing this item
      if (tabId === 'customers') {
        updateField(item.id, 'status', item.status);
      }
      
      toast.info('Editing item...');
    } else if (action === 'delete') {
      toast.success('Item deleted successfully!');
      // In a real app, we would delete the item from the database
    } else if (action === 'view' && tabId === 'customers') {
      // For customers, show the detailed view with real-time collaboration
      setSelectedCustomer({
        ...item,
        followed: Math.random() > 0.5 // Randomly set followed status for demo
      });
    }
  };

  // Handle saving customer details
  const handleSaveCustomer = (updatedCustomer) => {
    toast.success(`Customer ${updatedCustomer.name} updated successfully`);
    setSelectedCustomer(null);
  };
  
  // Get appropriate label for the add button
  const getAddButtonLabel = () => {
    switch(tabId) {
      case 'customers':
        return 'Add Customer';
      case 'sales':
        return 'Add Deal';
      case 'support':
        return 'Create Ticket';
      case 'tasks':
        return 'Add Task';
      default:
        return 'Add Item';
    }
  };
  
  // Get title based on active tab
  const getTitle = () => {
    switch(tabId) {
      case 'customers':
        return 'Customer Management';
      case 'sales':
        return 'Sales Pipeline';
      case 'support':
        return 'Support Tickets';
      case 'tasks':
        return 'Task Management';
      default:
        return 'Items';
    }
  };
  
  // Get icon based on active tab
  const getTabIcon = () => {
    switch(tabId) {
      case 'customers':
        return UserIcon;
      case 'sales':
        return BriefcaseIcon;
      case 'support':
        return TicketIcon;
      case 'tasks':
        return CalendarIcon;
      default:
        return CheckIcon;
    }
  };
  
  const TabIcon = getTabIcon();
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let color = '';
    
    if (typeof status === 'string') {
      status = status.toLowerCase();
      
      if (status === 'active' || status === 'closed_won' || status === 'completed') {
        color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      } else if (status === 'inactive' || status === 'closed_lost') {
        color = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      } else if (status === 'lead') {
        color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      } else if (status === 'pending' || status === 'qualified' || status === 'proposal') {
        color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      } else if (status === 'negotiation' || status === 'in_progress') {
        color = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      } else if (status === 'open') {
        color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      } else if (status === 'critical' || status === 'high') {
        color = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      } else if (status === 'medium') {
        color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      } else if (status === 'low') {
        color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      }
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };
  
  // Render data table based on active tab
  const renderDataTable = () => {
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-10 card">
          <AlertCircleIcon className="w-12 h-12 mx-auto text-surface-400" />
          <h3 className="mt-4 text-lg font-medium">No data found</h3>
          <p className="mt-2 text-surface-500 dark:text-surface-400">
            {searchTerm ? "Try adjusting your search terms." : "Start by adding your first item."}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 btn btn-primary inline-flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {getAddButtonLabel()}
          </button>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto pb-2">
        <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
          <thead className="bg-surface-50 dark:bg-surface-800">
            <tr>
              {tabId === 'customers' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Contacts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Last Contact</th>
                </>
              )}
              
              {tabId === 'sales' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Expected Close</th>
                </>
              )}
              
              {tabId === 'support' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Assignee</th>
                </>
              )}
              
              {tabId === 'tasks' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Related To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                </>
              )}
              
              <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                {tabId === 'customers' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.industry}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.contacts}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.lastContact).toLocaleDateString()}</td>
                  </>
                )}
                
                {tabId === 'sales' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.customer || item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${item.value.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.stage)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.expectedClose).toLocaleDateString()}</td>
                  </>
                )}
                
                {tabId === 'support' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.priority)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.assignee}</td>
                  </>
                )}
                
                {tabId === 'tasks' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.relatedTo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.priority)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.status)}</td>
                  </>
                )}
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {tabId === 'customers' && (
                    <button
                      onClick={() => handleItemAction('view', item)}
                      className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleItemAction('edit', item)}
                    className="text-primary hover:text-primary-dark dark:hover:text-primary-light"
                  >
                    <EditIcon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleItemAction('delete', item)}
                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400 ml-2"
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
    );
  };
  
  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg shadow-card p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <div className="mr-3 p-2 rounded-lg bg-primary/10 text-primary">
            <TabIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Search..."
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
              setSelectedItem(null);
              setFormData({});
              setShowForm(true);
            }}
            className="btn btn-primary inline-flex items-center self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {getAddButtonLabel()}
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {selectedCustomer && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <CustomerDetail 
              customer={selectedCustomer} 
              onClose={() => setSelectedCustomer(null)} 
              onSave={handleSaveCustomer} 
            />
          </motion.div>
        )}
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card mb-6 border border-surface-200 dark:border-surface-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedItem ? 'Edit' : 'Add New'} {tabId === 'sales' ? 'Deal' : tabId.slice(0, -1)}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(currentForm).map(([key, field]) => (
                  <div key={key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        className="input w-full"
                        value={formData[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        required={field.required}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        className="input w-full h-24"
                        value={formData[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        className="input w-full"
                        value={formData[key] || ''}
                        onChange={(e) => handleFieldChange(key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn bg-surface-100 text-surface-800 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-100 dark:hover:bg-surface-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {selectedItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderDataTable()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;