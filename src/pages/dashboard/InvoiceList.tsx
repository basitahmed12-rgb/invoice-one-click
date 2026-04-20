import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Download, MoreVertical, Eye, Trash2, Edit, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/firestore';

export default function InvoiceList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvoices(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'invoices');
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteDoc(doc(db, 'invoices', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `invoices/${id}`);
      }
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.buyerDetails.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic">Accounts Receivable</h1>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Audit Log & History</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download size={14} /> Export XLS
           </button>
           <Link 
              to="/dashboard/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-xs font-black uppercase tracking-[0.15em] hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
           >
              Create New
           </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by Client or Invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500 shadow-sm">
          <Filter size={16} /> Advanced Search
        </button>
      </div>

      <div className="card-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Client Entity</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Valuation</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing...</p>
                   </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                         <FileText size={20} className="text-slate-200" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">Zero matches for your current filter.</p>
                   </td>
                </tr>
              ) : filteredInvoices.map((invoice, idx) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50 transition-all group"
                >
                  <td className="px-8 py-5">
                    <span className="font-black text-sm text-slate-900 tracking-tight italic">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-600 font-bold text-xs tracking-tight">{invoice.buyerDetails.name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">{invoice.date}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-slate-900 tracking-tighter italic text-sm">${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.15em] ${
                      invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                      invoice.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                      invoice.status === 'Overdue' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 group-hover:opacity-100 transition-opacity">
                      <Link to={`/dashboard/edit/${invoice.id}`} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Edit Structure">
                         <Edit size={14} />
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(invoice.id); }}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                        title="Purge Document"
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Audit Volume: <span className="text-slate-900">{filteredInvoices.length} entries</span></p>
           <div className="flex gap-2">
              <button disabled className="px-4 py-1.5 border border-slate-200 rounded-lg bg-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-30">Previous</button>
              <button disabled className="px-4 py-1.5 border border-slate-200 rounded-lg bg-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-30">Next Page</button>
           </div>
        </div>
      </div>
    </div>
  );
}
