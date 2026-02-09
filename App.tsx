import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator as CalculatorIcon, 
  FileText, 
  Users, 
  Package, 
  Settings as SettingsIcon,
  Menu,
  X,
  FileDown,
  Printer,
  Plus,
  UserPlus
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import CRM from './components/CRM';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { ToastProvider } from './components/Toast';
import { NAV_ITEMS } from './constants';
import { getCustomers, getEstimates, getInventory, getSettings, generatePDF, saveEstimate, getUser } from './services/storage';
import { JobStatus, Estimate, User } from './types';

const App: React.FC = () => {
  // --- Data State ---
  const [activeView, setActiveView] = useState('dashboard');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Storage State
  const [user, setUser] = useState<User | null>(getUser());
  const [customers, setCustomers] = useState(getCustomers());
  const [estimates, setEstimates] = useState(getEstimates());
  const [inventory, setInventory] = useState(getInventory());
  const [settings, setSettings] = useState(getSettings());
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Trigger re-renders

  // --- Effects ---
  useEffect(() => {
    // Refresh data when lastUpdate changes
    setCustomers(getCustomers());
    setEstimates(getEstimates());
    setInventory(getInventory());
    setSettings(getSettings());
    setUser(getUser());
  }, [lastUpdate]);

  const refreshData = () => setLastUpdate(Date.now());

  // --- Job List Component ---
  const JobsList = () => {
    const [filter, setFilter] = useState('All');
    
    const filteredEstimates = estimates.filter(e => {
        if (filter === 'All') return true;
        return e.status === filter;
    });

    const handleStatusChange = (est: Estimate, newStatus: JobStatus) => {
        const updated = { ...est, status: newStatus };
        saveEstimate(updated);
        refreshData();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-900">Jobs & Estimates</h2>
             <select 
               className="p-2 border rounded-lg bg-white"
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
             >
               <option value="All">All Jobs</option>
               <option value={JobStatus.DRAFT}>Drafts</option>
               <option value={JobStatus.WORK_ORDER}>Work Orders</option>
               <option value={JobStatus.INVOICED}>Invoices</option>
               <option value={JobStatus.PAID}>Paid</option>
               <option value={JobStatus.ARCHIVED}>Archived</option>
             </select>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Ref #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEstimates.map(est => {
                  const customer = customers.find(c => c.id === est.customerId);
                  return (
                  <tr key={est.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-600">{est.number}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{customer?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(est.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">${est.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                        <select 
                            value={est.status}
                            onChange={(e) => handleStatusChange(est, e.target.value as JobStatus)}
                            className="text-xs rounded-full px-2 py-1 border-0 ring-1 ring-inset ring-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500"
                        >
                            {Object.values(JobStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => generatePDF(est, customer, settings)}
                         className="text-slate-500 hover:text-brand-600 mx-1" 
                         title="Download PDF"
                        >
                         <FileDown className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                )})}
                {filteredEstimates.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">No jobs found matching this filter.</td></tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    );
  };

  // --- Render Active View ---
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard estimates={estimates} inventory={inventory} onNavigate={setActiveView} />;
      case 'calculator':
        return <Calculator settings={settings} customers={customers} onSave={() => { refreshData(); setActiveView('jobs'); }} onRefresh={refreshData} />;
      case 'jobs':
        return <JobsList />;
      case 'customers':
        return <CRM customers={customers} onRefresh={refreshData} />;
      case 'inventory':
        return <Inventory items={inventory} onRefresh={refreshData} />;
      case 'settings':
        return <Settings settings={settings} onSave={refreshData} />;
      default:
        return <Dashboard estimates={estimates} inventory={inventory} onNavigate={setActiveView} />;
    }
  };

  const IconComponent = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard className={className} />;
      case 'Calculator': return <CalculatorIcon className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Package': return <Package className={className} />;
      case 'Settings': return <SettingsIcon className={className} />;
      default: return <LayoutDashboard className={className} />;
    }
  };

  if (!user || !user.isAuthenticated) {
    return (
      <ToastProvider>
        <Auth onLogin={refreshData} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
        
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <aside className="hidden lg:block fixed h-full w-64 bg-slate-900 text-white">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
             <div className="bg-brand-600 p-2 rounded-lg">
               <CalculatorIcon className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="font-bold text-lg leading-tight">SprayFoam<span className="text-brand-500">Pro</span></h1>
               <p className="text-xs text-slate-400">Estimator & CRM</p>
             </div>
          </div>

          <nav className="p-4 space-y-1">
            <div className="mb-4">
              <button 
                onClick={() => setActiveView('calculator')}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold shadow-lg shadow-brand-900/50 transition-all"
              >
                <Plus className="w-5 h-5" /> New Estimate
              </button>
            </div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group relative
                  ${activeView === item.id 
                    ? 'bg-slate-800 text-white border-l-4 border-brand-500' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                {IconComponent(item.icon)}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold uppercase ring-2 ring-slate-800">
                      {user.username.substring(0,2)}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{user.username}</p>
                      <p className="text-xs text-slate-500 truncate">{user.company}</p>
                  </div>
              </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative pb-20 lg:pb-0">
          
          {/* Mobile Header (Only Branding & Settings) */}
          <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2">
               <div className="bg-brand-600 p-1.5 rounded">
                 <CalculatorIcon className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-slate-900">SprayFoam Pro</span>
            </div>
            <button 
              onClick={() => setActiveView('settings')}
              className={`p-2 rounded-full ${activeView === 'settings' ? 'bg-slate-100 text-brand-600' : 'text-slate-600'}`}
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </header>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
              {renderContent()}
          </div>

          {/* Quick Actions Menu (Mobile) */}
          {showQuickActions && (
             <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 lg:hidden">
                <button 
                  onClick={() => { setActiveView('customers'); setShowQuickActions(false); }}
                  className="flex items-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-full shadow-xl border border-slate-100 font-bold hover:bg-slate-50 w-48 justify-center"
                >
                  <UserPlus className="w-5 h-5 text-brand-500" /> New Customer
                </button>
                <button 
                   onClick={() => { setActiveView('calculator'); setShowQuickActions(false); }}
                   className="flex items-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-full shadow-xl border border-slate-100 font-bold hover:bg-slate-50 w-48 justify-center"
                >
                  <CalculatorIcon className="w-5 h-5 text-brand-500" /> New Estimate
                </button>
             </div>
           )}

           {/* Mobile Bottom Navigation Bar */}
           <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="grid grid-cols-5 h-16 items-center">
                 {/* 1. Dashboard */}
                 <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center justify-center h-full space-y-1 ${activeView === 'dashboard' ? 'text-brand-600' : 'text-slate-400'}`}>
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Home</span>
                 </button>

                 {/* 2. Jobs */}
                 <button onClick={() => setActiveView('jobs')} className={`flex flex-col items-center justify-center h-full space-y-1 ${activeView === 'jobs' ? 'text-brand-600' : 'text-slate-400'}`}>
                    <FileText className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Jobs</span>
                 </button>

                 {/* 3. Center PLUS Button */}
                 <div className="relative h-full flex items-center justify-center">
                    <button 
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className={`absolute -top-6 w-14 h-14 bg-brand-600 rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center text-white transition-transform ${showQuickActions ? 'rotate-45 bg-slate-800' : ''}`}
                    >
                      <Plus className="w-8 h-8" />
                    </button>
                 </div>

                 {/* 4. Customers */}
                 <button onClick={() => setActiveView('customers')} className={`flex flex-col items-center justify-center h-full space-y-1 ${activeView === 'customers' ? 'text-brand-600' : 'text-slate-400'}`}>
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-medium">CRM</span>
                 </button>

                 {/* 5. Inventory */}
                 <button onClick={() => setActiveView('inventory')} className={`flex flex-col items-center justify-center h-full space-y-1 ${activeView === 'inventory' ? 'text-brand-600' : 'text-slate-400'}`}>
                    <Package className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Stock</span>
                 </button>
              </div>
           </div>

        </main>
      </div>
    </ToastProvider>
  );
};

export default App;