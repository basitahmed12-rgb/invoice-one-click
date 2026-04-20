import React, { useState, useRef, useMemo, memo } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Download, Save, Sparkles, X, ChevronDown, Check, Loader2, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { GoogleGenAI, Type } from "@google/genai";
import { db, auth } from '../../firebase';
import { collection, doc, setDoc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../../lib/firestore';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

// Memoized Preview Component to prevent heavy re-renders when form inputs change
const InvoicePreview = memo(({ 
  invoiceRef, template, sellerName, sellerAddress, buyerName, buyerAddress, 
  invoiceNumber, date, dueDate, items, subtotal, taxRate, taxAmount, total 
}: any) => {
  return (
    <div 
      className="bg-white shadow-2xl mx-auto origin-top transition-transform duration-500"
      ref={invoiceRef}
      style={{ width: '100%', minHeight: '842px', maxWidth: '595px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
       {template === 'classic' ? (
         <div className="p-10 space-y-12 flex flex-col h-full bg-white text-slate-900 border-[12px] border-slate-50">
            <div className="flex justify-between items-start">
               <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-lg shadow-primary-200">
                     {sellerName[0] || 'I'}
                  </div>
                  <div>
                     <h2 className="text-2xl font-black tracking-tight">{sellerName}</h2>
                     <p className="text-[11px] text-slate-500 font-medium max-w-[200px] whitespace-pre-wrap leading-relaxed">{sellerAddress}</p>
                  </div>
               </div>
               <div className="text-right">
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-[0.15em] mb-4 border-b-4 border-primary-600 pb-2 inline-block">Invoice</h1>
                  <div className="space-y-1.5">
                     <p className="text-xs"><span className="text-slate-400 uppercase font-bold text-[9px] tracking-widest mr-2">No:</span> <span className="font-bold">{invoiceNumber}</span></p>
                     <p className="text-xs"><span className="text-slate-400 uppercase font-bold text-[9px] tracking-widest mr-2">Date:</span> <span className="font-bold">{date}</span></p>
                     {dueDate && <p className="text-xs"><span className="text-slate-400 uppercase font-bold text-[9px] tracking-widest mr-2">Due:</span> <span className="font-bold">{dueDate}</span></p>}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mt-8 py-8 border-y-2 border-slate-100">
               <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Client Information</h4>
                  <h2 className="text-xl font-bold mb-1 tracking-tight">{buyerName || 'Client Name'}</h2>
                  <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">{buyerAddress || 'Address, Tax ID'}</p>
               </div>
            </div>

            <div className="flex-grow pt-4">
               <table className="w-full">
                  <thead>
                     <tr className="border-b-2 border-slate-900">
                        <th className="py-3 text-left text-[9px] uppercase font-black tracking-[0.2em]">Item / Task</th>
                        <th className="py-3 text-center text-[9px] uppercase font-black tracking-[0.2em] w-16">Qty</th>
                        <th className="py-3 text-right text-[9px] uppercase font-black tracking-[0.2em] w-24">Rate</th>
                        <th className="py-3 text-right text-[9px] uppercase font-black tracking-[0.2em] w-24">Total</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                           <td className="py-4 text-xs font-bold text-slate-800">{item.description || 'Description'}</td>
                           <td className="py-4 text-center text-xs text-slate-600">{item.quantity}</td>
                           <td className="py-4 text-right text-xs text-slate-600">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                           <td className="py-4 text-right text-xs font-black text-slate-900">${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {items.length === 0 && (
                  <div className="text-center py-10 text-slate-300 italic text-sm">No items defined</div>
               )}
            </div>

            <div className="pt-8 flex justify-end">
               <div className="w-56 space-y-3 p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between text-[10px] font-bold">
                     <span className="text-slate-400 uppercase tracking-widest">Subtotal</span>
                     <span className="text-slate-700">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                     <span className="text-slate-400 uppercase tracking-widest">Tax ({taxRate}%)</span>
                     <span className="text-slate-700">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-primary-600 mt-2">
                     <span className="uppercase font-black text-[11px] tracking-thicker text-primary-600">Total Due</span>
                     <span className="font-black text-xl tracking-tighter text-slate-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
               </div>
            </div>
            
            <div className="pt-12 text-[8px] font-black tracking-[0.4em] text-center text-slate-300 uppercase italic">
               Thank you for choosing {sellerName}
            </div>
         </div>
       ) : (
          <div className="p-10 space-y-12 flex flex-col h-full bg-slate-50 relative overflow-hidden text-slate-900">
             <div className="absolute top-0 right-0 w-2/5 h-full bg-primary-600 transform skew-x-[-20deg] translate-x-1/2 -z-0 opacity-[0.03]"></div>
             
             <div className="relative z-10 flex justify-between items-start pt-4">
                <div className="absolute -top-10 -left-6 text-9xl font-black text-slate-200/50 select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap">PREMIUM</div>
                <div className="mt-4">
                   <h2 className="text-3xl font-black text-primary-600 tracking-tighter leading-none">{sellerName}</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-1 border-l-2 border-primary-400">{sellerAddress}</p>
                </div>
                <div className="text-right">
                   <div className="inline-block px-4 py-1.5 bg-slate-900 text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-full mb-6 shadow-lg shadow-slate-200">Invoice Pro</div>
                   <div className="space-y-0.5">
                      <p className="text-sm font-black text-slate-900 tracking-tighter italic">#{invoiceNumber}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{date}</p>
                   </div>
                </div>
             </div>

             <div className="relative z-10 grid grid-cols-[1.5fr_1fr] gap-10 mt-12 bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm">
                <div className="space-y-1">
                   <h4 className="text-[8px] font-black text-primary-500 uppercase tracking-[0.4em] mb-3">Client Reference</h4>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{buyerName || 'Valued Customer'}</h2>
                   <p className="text-[10px] font-medium text-slate-400 leading-relaxed max-w-[200px]">{buyerAddress || 'Full billing address goes here'}</p>
                </div>
                <div className="flex flex-col justify-end items-end text-right">
                   <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Total Due Now</h4>
                   <div className="text-4xl font-black text-slate-900 tracking-tighter italic overflow-hidden">
                      <span className="text-primary-600">$</span>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </div>
                </div>
             </div>

             <div className="relative z-10 flex-grow pt-8">
                <div className="space-y-4">
                   {items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white hover:scale-[1.02] transition-all rounded-3xl group border border-slate-50 shadow-sm">
                         <div className="space-y-1">
                            <p className="font-black text-sm text-slate-800 tracking-tight">{item.description || 'Description'}</p>
                            <div className="flex items-center gap-2">
                               <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.quantity} Unit{item.quantity !== 1 && 's'}</span>
                               <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] underline decoration-primary-300/50 underline-offset-4 decoration-2">${item.price.toLocaleString()} per / unit</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-xl font-black text-slate-900 tracking-tighter italic">${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                         </div>
                      </div>
                   ))}
                   {items.length === 0 && (
                      <div className="text-center py-10 opacity-20 filter grayscale blur-[1px]">
                         <FileText size={48} className="mx-auto" />
                      </div>
                   )}
                </div>
             </div>

             <div className="relative z-10 mt-auto pt-8 flex justify-between items-end">
                <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] flex items-center gap-3">
                   Verify <Sparkles size={10} className="text-primary-400" /> Professional <span className="text-primary-600/30">OneClick</span>
                </div>
                <div className="w-56 space-y-1.5 p-4 border-2 border-dashed border-slate-200 rounded-3xl">
                   <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Sales Tax</span>
                      <span>${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
});

export default function InvoiceEditor() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [sellerName, setSellerName] = useState(user?.businessName || 'My Trading Co.');
  const [sellerAddress, setSellerAddress] = useState(user?.businessAddress || '123 Business St, Commerce City');
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', quantity: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [aiInput, setAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [template, setTemplate] = useState('classic');
  
  const invoiceRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.price), 0), [items]);
  const taxAmount = useMemo(() => (subtotal * taxRate) / 100, [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  // Load existing invoice if editing
  React.useEffect(() => {
    if (id) {
      const loadInvoice = async () => {
        try {
          const docRef = doc(db, 'invoices', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setInvoiceNumber(data.invoiceNumber);
            setDate(data.date);
            setDueDate(data.dueDate || '');
            setSellerName(data.sellerDetails.name);
            setSellerAddress(data.sellerDetails.address);
            setBuyerName(data.buyerDetails.name);
            setBuyerAddress(data.buyerDetails.address);
            setItems(data.items);
            setTaxRate(data.taxRate || 0);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `invoices/${id}`);
        }
      };
      loadInvoice();
    }
  }, [id]);

  const saveInvoice = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const invoiceData = {
      invoiceNumber,
      date,
      dueDate,
      sellerDetails: { name: sellerName, address: sellerAddress },
      buyerDetails: { name: buyerName, address: buyerAddress },
      items,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount: total,
      userId: user.uid,
      templateId: template,
      status: 'draft',
      updatedAt: serverTimestamp(),
      createdAt: id ? undefined : serverTimestamp(),
    };

    try {
      if (id) {
        await setDoc(doc(db, 'invoices', id), invoiceData, { merge: true });
      } else {
        await addDoc(collection(db, 'invoices'), { ...invoiceData, createdAt: serverTimestamp() });
      }
      navigate('/dashboard/invoices');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'invoices');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    // Show loading state or feedback if needed
    const element = invoiceRef.current;
    
    try {
      // Create a clone or modify styles temporarily for a clean capture
      const originalShadow = element.style.boxShadow;
      const originalTransform = element.style.transform;
      element.style.boxShadow = 'none';
      element.style.transform = 'none';

      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          boxShadow: 'none',
          margin: '0',
        },
        pixelRatio: 3, // Higher resolution for printing
      });

      // Restore original styles
      element.style.boxShadow = originalShadow;
      element.style.transform = originalTransform;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgWidth = pdfWidth;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(`invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
    }
  };

  const processWithAI = async () => {
    if (!aiInput.trim() || !process.env.GEMINI_API_KEY) return;
    
    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract invoice details from this text: "${aiInput}". Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              buyerName: { type: Type.STRING },
              buyerAddress: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    price: { type: Type.NUMBER }
                  }
                }
              },
              taxRate: { type: Type.NUMBER }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      if (data.buyerName) setBuyerName(data.buyerName);
      if (data.buyerAddress) setBuyerAddress(data.buyerAddress);
      if (data.items && data.items.length > 0) {
        setItems(data.items.map((item: any, idx: number) => ({
          id: idx.toString(),
          ...item
        })));
      }
      if (data.taxRate !== undefined) setTaxRate(data.taxRate);
      
      setShowAiModal(false);
      setAiInput('');
    } catch (err) {
      console.error('AI Error:', err);
      alert('Failed to process text with AI. Please check your input.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Invoice Editor</h2>
          <p className="text-sm text-slate-500">Fine-tune your invoice details and branding</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <Sparkles size={16} className="text-primary-600" /> Use AI Assistant
          </button>
          <button 
            onClick={saveInvoice}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            {id ? 'Update Changes' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8 items-start">
        {/* Editor Form - Left Side */}
        <div className="space-y-6">
          <div className="card-premium p-6">
             <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Basic Info</h3>
                <div className="flex gap-2">
                   <button onClick={() => setTemplate('classic')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${template === 'classic' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Classic</button>
                   <button onClick={() => setTemplate('modern')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${template === 'modern' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Modern Pro</button>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="label-sm">Invoice No.</label>
                   <input 
                      type="text" 
                      value={invoiceNumber} 
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="input-field"
                      placeholder="INV-000"
                   />
                </div>
                <div>
                   <label className="label-sm">Invoice Date</label>
                   <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="input-field"
                   />
                </div>
             </div>
          </div>

          <div className="card-premium p-6">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-4">Entities</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <label className="label-sm">Billed From (Seller)</label>
                   <input 
                      placeholder="Your Business Name" 
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="input-field font-bold mb-3"
                   />
                   <textarea 
                      placeholder="Address, Phone, Email" 
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      className="input-field h-28 text-sm resize-none"
                   />
                </div>
                <div>
                   <label className="label-sm">Billed To (Client)</label>
                   <input 
                      placeholder="Client Name" 
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="input-field font-bold mb-3"
                   />
                   <textarea 
                      placeholder="Billing Address, Tax ID" 
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="input-field h-28 text-sm resize-none"
                   />
                </div>
             </div>
          </div>

          <div className="card-premium">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Line Items</h3>
                <button onClick={addItem} className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-primary-100 transition-all border border-primary-200">
                   <Plus size={12} /> Add Item
                </button>
             </div>
             
             <div className="p-6 space-y-4">
                {items.length === 0 && (
                   <div className="text-center py-8 text-slate-400 italic text-sm">No items added yet. Click 'Add Item' to begin.</div>
                )}
                <div className="hidden md:grid grid-cols-[1fr_80px_100px_40px] gap-4 mb-2">
                   <span className="label-sm mb-0">Description</span>
                   <span className="label-sm mb-0 text-center">Qty</span>
                   <span className="label-sm mb-0 text-right">Price</span>
                   <span></span>
                </div>
                
                {items.map((item) => (
                   <div key={item.id} className="grid grid-cols-[1fr_80px_100px_40px] gap-4 items-start">
                      <input 
                         placeholder="Description" 
                         value={item.description}
                         onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                         className="input-field"
                      />
                      <input 
                         type="number"
                         value={item.quantity}
                         onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                         className="input-field text-center"
                      />
                      <input 
                         type="number"
                         value={item.price}
                         onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                         className="input-field text-right"
                      />
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all mt-0.5"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                ))}
             </div>
             
             <div className="bg-slate-50 p-6 flex flex-col items-end gap-3 border-t border-slate-200 mt-2">
                <div className="flex justify-between w-full max-w-[200px] text-slate-500 text-sm font-medium">
                   <span>Subtotal:</span>
                   <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px] items-center">
                   <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 whitespace-nowrap">Tax (%):</span>
                      <input 
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-14 p-1.5 bg-white border border-slate-200 rounded text-xs text-center outline-none focus:ring-1 focus:ring-primary-500"
                      />
                   </div>
                   <span className="text-sm text-slate-500 font-medium">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px] pt-4 mt-2 border-t-2 border-slate-200 font-black text-xl text-slate-900 italic tracking-tighter">
                   <span>Total:</span>
                   <span className="text-primary-600">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Live Preview - Right Side */}
        <div className="sticky top-8 space-y-4 h-[calc(100vh-160px)] flex flex-col min-h-[600px]">
           <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Live Preview</span>
              <button 
                 onClick={downloadPDF}
                 className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95"
              >
                <Download size={14} /> Download PDF
              </button>
           </div>
           
           <div className="flex-grow bg-slate-200 rounded-xl overflow-y-auto p-4 custom-scrollbar shadow-inner border border-slate-300">
              <InvoicePreview 
                invoiceRef={invoiceRef}
                template={template}
                sellerName={sellerName}
                sellerAddress={sellerAddress}
                buyerName={buyerName}
                buyerAddress={buyerAddress}
                invoiceNumber={invoiceNumber}
                date={date}
                dueDate={dueDate}
                items={items}
                subtotal={subtotal}
                taxRate={taxRate}
                taxAmount={taxAmount}
                total={total}
              />
           </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden shadow-primary-900/10"
           >
              <div className="p-8">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                          <Sparkles size={20} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold">Smart Extract</h3>
                          <p className="text-sm text-slate-500">Paste raw text to create invoice data automatically.</p>
                       </div>
                    </div>
                    <button onClick={() => setShowAiModal(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                       <X size={20} />
                    </button>
                 </div>

                 <textarea 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ex: Bill Tech Solutions at 142 main road for 4 web development modules at $500 each and 1 domain registration at $12. Add 5% tax."
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-700 resize-none mb-6"
                 ></textarea>

                 <div className="flex gap-4">
                    <button 
                       onClick={() => setShowAiModal(false)}
                       className="flex-grow py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={processWithAI}
                       disabled={isAiProcessing || !aiInput.trim()}
                       className="flex-grow py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                       {isAiProcessing ? (
                          <>
                             <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                             Processing...
                          </>
                       ) : (
                          <>
                             <Sparkles size={18} /> Extract Data
                          </>
                       )}
                    </button>
                 </div>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
