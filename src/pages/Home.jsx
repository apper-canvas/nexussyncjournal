import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

const Home = () => {
  const [activeTab, setActiveTab] = useState('customers');
  
  const tabs = [
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'sales', label: 'Sales Pipeline', icon: 'bar-chart-2' },
    { id: 'support', label: 'Support Tickets', icon: 'ticket' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square' },
  ];
  
  // Get tab icons
  const tabIcons = {};
  tabs.forEach(tab => {
    tabIcons[tab.id] = getIcon(tab.icon);
  });

  const navigate = useNavigate();

  // Dashboard stats
  const stats = [
    { title: 'Total Customers', value: 243, change: '+12%', icon: 'users', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { title: 'Open Deals', value: 42, change: '+5%', icon: 'briefcase', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { title: 'Support Tickets', value: 18, change: '-7%', icon: 'ticket', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    { title: 'Conversion Rate', value: '24%', change: '+2%', icon: 'percent', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  ];
  
  const handleQuickAction = (action) => {
    switch(action) {
      case 'add_customer':
        navigate('/customers');
        toast.info('Navigating to customer management');
        return;
      default:
        // Fallback to toast
        break;
    }
    toast.success(`Action initiated: ${action}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to your CRM Dashboard</h1>
        <p className="text-surface-600 dark:text-surface-400">
          Manage your customers, track sales, and handle support tickets in one place.
        </p>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const StatIcon = getIcon(stat.icon);
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card group hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-surface-500 dark:text-surface-400 text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} from last month
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <StatIcon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Customer', icon: 'user-plus', action: 'add_customer' },
            { label: 'Create Deal', icon: 'plus-circle', action: 'create_deal' },
            { label: 'New Ticket', icon: 'ticket-plus', action: 'new_ticket' },
            { label: 'Schedule Meeting', icon: 'calendar-plus', action: 'schedule_meeting' },
          ].map((action) => {
            const ActionIcon = getIcon(action.icon);
            return (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.label)}
                className="flex items-center px-4 py-2 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 
                           rounded-lg transition-colors duration-200"
              >
                <ActionIcon className="h-4 w-4 mr-2 text-primary" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
          {tabs.map((tab) => {
            const TabIcon = tabIcons[tab.id];
            return (
              <button
                key={tab.id}
                className={`flex items-center py-3 px-2 border-b-2 transition-colors relative whitespace-nowrap 
                          ${activeTab === tab.id 
                            ? 'border-primary text-primary dark:text-primary-light font-medium' 
                            : 'border-transparent hover:text-primary hover:border-surface-300 dark:hover:border-surface-600'}`}
                onClick={() => {
                  if (tab.id === 'customers') {
                    navigate('/customers');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
              >
                <TabIcon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Main Feature Area */}
      <MainFeature tabId={activeTab} />
    </div>
  );
};

export default Home;