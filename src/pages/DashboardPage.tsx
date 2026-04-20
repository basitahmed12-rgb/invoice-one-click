import React, { lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Settings, LogOut, FileText, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InvoiceList = lazy(() => import('./dashboard/InvoiceList'));
const InvoiceEditor = lazy(() => import('./dashboard/InvoiceEditor'));
const DashboardHome = lazy(() => import('./dashboard/DashboardHome'));
const SettingsPage = lazy(() => import('./dashboard/SettingsPage'));

function DashboardLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Section...</p>
    </div>
  );
}

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/dashboard' },
    { icon: <FileText size={18} />, label: 'Invoices', path: '/dashboard/invoices' },
    { icon: <FilePlus size={18} />, label: 'New Invoice', path: '/dashboard/new' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/dashboard/settings' },
  ];

  const getPageTitle = () => {
    const active = navItems.find(item => item.path === location.pathname);
    if (active) return active.label;
    if (location.pathname.includes('/edit/')) return 'Edit Invoice';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col pt-8">
        <div className="px-6 mb-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <span className="text-lg font-extrabold text-primary-600 tracking-tight">OneClick</span>
        </div>

        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all relative ${
                      isActive 
                      ? 'text-primary-600 bg-primary-50 border-r-4 border-primary-600' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-slate-100">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden shadow-inner">
                {user?.brandingLogo ? (
                   <img src={user.brandingLogo} alt="Me" className="w-full h-full object-cover" />
                ) : user?.displayName?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate text-slate-900">{user?.displayName || 'User'}</p>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{user?.plan || 'Free'}</span>
                </div>
              </div>
           </div>
           <button
             onClick={logout}
             className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all text-xs font-bold"
           >
             <LogOut size={16} /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4 text-sm font-semibold">
             <span className="text-slate-400 uppercase tracking-widest text-[10px]">Portal</span>
             <span className="text-slate-200">/</span>
             <span className="text-slate-900">{getPageTitle()}</span>
          </div>
          <div className="flex items-center gap-3">
             <Link to="/dashboard/new" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-100">
                New Invoice
             </Link>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-8">
           <div className="max-w-6xl mx-auto">
              <Suspense fallback={<DashboardLoader />}>
                <Routes>
                  <Route index element={<DashboardHome />} />
                  <Route path="invoices" element={<InvoiceList />} />
                  <Route path="new" element={<InvoiceEditor />} />
                  <Route path="edit/:id" element={<InvoiceEditor />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </Suspense>
           </div>
        </div>
      </main>
    </div>
  );
}
