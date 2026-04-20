import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, TrendingUp, Clock, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/firestore';

export default function DashboardHome() {
  const { user } = useAuth();
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: 'Revenue (Total)', value: '$0', change: '+0%', icon: <TrendingUp size={20} className="text-emerald-500" /> },
    { label: 'Unpaid Invoices', value: '0', change: '--', icon: <Clock size={20} className="text-amber-500" /> },
    { label: 'Total Volume', value: '0', change: '--', icon: <AlertCircle size={20} className="text-rose-500" /> },
    { label: 'Total Count', value: '0', change: '--', icon: <FileText size={20} className="text-primary-500" /> },
  ]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setRecentInvoices(docs);
      
      // Calculate basic stats
      const totalRevenue = docs.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const invoiceCount = snapshot.size;
      
      setStats([
        { label: 'Revenue (Recent)', value: `$${totalRevenue.toLocaleString()}`, change: '+', icon: <TrendingUp size={20} className="text-emerald-500" /> },
        { label: 'Count', value: invoiceCount.toString(), change: 'Total', icon: <FileText size={20} className="text-primary-500" /> },
        { label: 'Activity', value: 'High', change: 'Steady', icon: <Clock size={20} className="text-amber-500" /> },
        { label: 'Status', value: 'Active', change: 'Good', icon: <AlertCircle size={20} className="text-rose-500" /> },
      ]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'invoices');
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            Welcome back, <span className="text-primary-600">{user?.displayName?.split(' ')[0] || 'Business Owner'}</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Your business is scaling nicely. Here's a quick pulse check.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-6 card-premium relative group hover:border-primary-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                {stat.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                stat.change.startsWith('+') || stat.change === 'Total' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="label-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter italic">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Recent Transaction Stream</h3>
                <Link to="/dashboard/invoices" className="text-primary-600 text-[10px] font-black uppercase tracking-widest hover:underline border-b-2 border-primary-100 pb-0.5">View Audit Log</Link>
             </div>
             <div className="divide-y divide-slate-50">
                {recentInvoices.length === 0 ? (
                   <div className="text-center py-12">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                         <FileText size={20} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 italic text-sm">No recent activity detected.</p>
                   </div>
                ) : recentInvoices.map(invoice => (
                   <Link key={invoice.id} to={`/dashboard/edit/${invoice.id}`} className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-all font-black text-[10px] italic">
                            INV
                         </div>
                         <div>
                            <p className="font-black text-sm text-slate-900 tracking-tight italic">{invoice.invoiceNumber}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{invoice.buyerDetails?.name || 'Unknown Client'} • <span className="text-slate-300 font-medium">{invoice.date}</span></p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-sm text-slate-900 tracking-tighter italic">${(invoice.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                         <span className={`text-[8px] uppercase font-black tracking-[0.2em] px-2 py-0.5 rounded-sm ${invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {invoice.status}
                         </span>
                      </div>
                   </Link>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-primary-600 p-8 rounded-[32px] text-white shadow-2xl shadow-primary-200 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                    <Sparkles size={20} className="text-white" />
                 </div>
                 <h3 className="text-xl font-bold mb-2 tracking-tight">Level Up To Pro</h3>
                 <p className="text-primary-100 text-xs mb-6 font-medium leading-relaxed uppercase tracking-wider">Access Premium Templates & Unlimited Smart Extraction</p>
                 <Link to="/pricing" className="inline-block px-6 py-3 bg-white text-primary-600 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Upgrade Account</Link>
              </div>
              <Sparkles size={160} className="absolute -bottom-16 -right-16 text-white/5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-1000" />
           </div>

           <div className="card-premium p-6 border-primary-100 bg-primary-50/20">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Quick AI Assist</h3>
              </div>
              <p className="text-slate-500 text-[11px] font-medium mb-4 leading-relaxed tracking-wide">Drop a raw brief here and we'll draft the entire invoice in seconds.</p>
              <textarea 
                placeholder="Ex: Bill Tech Solutions for 5 laptops at $800 each..."
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 h-28 mb-4 shadow-inner resize-none transition-all focus:border-primary-500"
              ></textarea>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                 <Sparkles size={14} /> Ignite Extraction
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
