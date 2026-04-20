import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Building, CreditCard, Shield, Bell, Save, Check, Sparkles } from 'lucide-react';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/firestore';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [taxId, setTaxId] = useState(user?.businessTaxId || '');
  const [address, setAddress] = useState(user?.businessAddress || '');

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        businessName,
        businessTaxId: taxId,
        businessAddress: address,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'business', label: 'Business Profile', icon: <Building size={18} /> },
    { id: 'account', label: 'Account', icon: <User size={18} /> },
    { id: 'billing', label: 'Billing & Plan', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic uppercase tracking-widest">Configuration</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Workspace Preferences & Profile</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg text-xs font-black uppercase tracking-[0.2em] hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 disabled:opacity-50 active:scale-95"
        >
          {saveSuccess ? (
            <><Check size={16} /> Update Successful</>
          ) : isSaving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><Save size={16} /> Deploy Changes</>
          )}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full xl:w-64 flex xl:flex-col gap-1 overflow-x-auto xl:overflow-visible pb-4 xl:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow card-premium p-10 min-h-[600px] border-slate-100">
          {activeTab === 'business' && (
            <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="border-b border-slate-50 pb-6 mb-2">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Business Identity</h3>
                 <p className="text-xs text-slate-400 font-medium">This information will appear on your generated invoices</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="label-sm">Legal Business Name</label>
                   <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="input-field font-bold" 
                      placeholder="Ex: Acme Solutions Ltd"
                   />
                </div>
                <div>
                   <label className="label-sm">Reference / Tax ID</label>
                   <input 
                      type="text" 
                      placeholder="Ex: VAT-123456789" 
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="input-field" 
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="label-sm">Registered Address</label>
                   <textarea 
                      className="input-field h-28 resize-none" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, Postcode, Country"
                   ></textarea>
                </div>
                <div>
                   <label className="label-sm">Invoicing Currency</label>
                   <select className="input-field appearance-none cursor-pointer">
                      <option>USD ($) - United States Dollar</option>
                      <option>GBP (£) - British Pound</option>
                      <option>EUR (€) - Euro</option>
                      <option>INR (₹) - Indian Rupee</option>
                   </select>
                </div>
                <div>
                   <label className="label-sm">Standard Tax (%)</label>
                   <input type="number" defaultValue="20" className="input-field" />
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 mt-10">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Visual Branding</h3>
                 <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 group hover:border-primary-500 transition-all cursor-pointer shadow-sm overflow-hidden">
                       {user?.brandingLogo ? (
                          <img src={user.brandingLogo} alt="Logo" className="w-full h-full object-cover" />
                       ) : <Building size={32} className="opacity-20" />}
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Corporate Seal / Logo</p>
                       <p className="text-[10px] text-slate-500 mb-4 font-medium uppercase tracking-wider">Accepted: .PNG, .JPG (Max 2MB)</p>
                       <button className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-white hover:text-primary-600 transition-all shadow-sm">Upload New Asset</button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
               <div className="border-b border-slate-50 pb-6 mb-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Subscription Tier</h3>
                  <p className="text-xs text-slate-400 font-medium">Review your current plan and usage limits</p>
               </div>

               <div className="p-10 bg-slate-900 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-10">
                        <div>
                           <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] mb-4">Enterprise Status</p>
                           <h2 className="text-5xl font-black tracking-tighter italic"><span className="text-primary-500">Free</span> Core</h2>
                        </div>
                        <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Active Account</span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-10 mb-10 border-y border-white/5 py-8">
                        <div>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Invoices Sent</p>
                           <p className="text-2xl font-black italic tracking-tighter">2<span className="text-primary-500">/</span>5</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Extractions</p>
                           <p className="text-2xl font-black italic tracking-tighter">0<span className="text-primary-500">/</span>10</p>
                        </div>
                     </div>

                     <button className="px-8 py-3.5 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/30">Elevate to Premium</button>
                  </div>
                  <Sparkles size={200} className="absolute -bottom-20 -right-20 text-white/5 transition-all duration-1000 group-hover:scale-125 group-hover:-rotate-12" />
               </div>
               
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Invoicing Records</h3>
               <div className="card-premium overflow-hidden">
                  <div className="bg-slate-50 px-8 py-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Filing Date</span>
                     <span>Description</span>
                     <span>Amount</span>
                     <span>Receipt</span>
                  </div>
                  <div className="p-20 text-center text-slate-400 group">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                       <CreditCard size={24} className="opacity-20" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest">No transaction history detected</p>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab !== 'business' && activeTab !== 'billing' && (
             <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-6 py-20 grayscale opacity-40">
                <Shield size={64} className="animate-pulse" />
                <div className="text-center space-y-2">
                   <p className="font-black uppercase tracking-[0.3em] text-[10px]">Secure Vault Locked</p>
                   <p className="text-xs font-medium max-w-[200px] leading-relaxed">This section is being encrypted and will be available in the next release.</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
