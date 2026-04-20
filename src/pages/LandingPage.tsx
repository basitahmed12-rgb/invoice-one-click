import React from 'react';
import { motion } from 'motion/react';
import { FileText, Zap, Shield, BarChart3, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6">
              AI-Powered Invoicing for Modern Businesses
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">
              Generate invoices in <span className="text-primary-600">one click.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              The fastest way for traders, small business owners, and ecommerce sellers to create professional invoices using AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
              >
                Get Started Free <ChevronRight size={20} />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>

          {/* Floating Elements Mockup */}
          <div className="mt-20 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-slate-900 rounded-2xl p-4 shadow-2xl relative z-10 mx-auto max-w-4xl overflow-hidden border-4 border-slate-800"
            >
               <div className="aspect-[16/10] bg-white rounded-lg p-8 flex flex-col items-start gap-4">
                  <div className="w-32 h-8 bg-slate-100 rounded mb-8"></div>
                  <div className="flex justify-between w-full mb-12">
                     <div className="space-y-2">
                        <div className="w-24 h-4 bg-slate-100 rounded"></div>
                        <div className="w-48 h-10 bg-slate-50 rounded"></div>
                     </div>
                     <div className="space-y-2 text-right">
                        <div className="w-24 h-4 bg-slate-100 ml-auto rounded"></div>
                        <div className="w-48 h-10 bg-primary-50 rounded"></div>
                     </div>
                  </div>
                  <div className="w-full space-y-4">
                     {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 border-b border-slate-50 pb-4">
                           <div className="flex-grow h-6 bg-slate-50 rounded"></div>
                           <div className="w-20 h-6 bg-slate-50 rounded"></div>
                           <div className="w-24 h-6 bg-slate-50 rounded"></div>
                        </div>
                     ))}
                  </div>
                  <div className="mt-auto ml-auto w-48 space-y-4">
                     <div className="flex justify-between border-t pt-4">
                        <span className="font-semibold">Total</span>
                        <span className="text-primary-600 font-bold">$2,450.00</span>
                     </div>
                  </div>
               </div>
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-200/20 blur-[120px] rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Everything you need to bill.</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Designed for simplicity, built for power. No complex spreadsheets, just professional invoices.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="text-amber-500" />}
              title="AI processing"
              description="Paste raw data or text and let our AI extract buyer, seller, and item details automatically."
            />
            <FeatureCard
              icon={<FileText className="text-primary-500" />}
              title="Premium Templates"
              description="Choose from multiple clean, modern invoice templates that work for any business type."
            />
            <FeatureCard
              icon={<Shield className="text-emerald-500" />}
              title="Tax Ready"
              description="Configure custom tax rates globally or per invoice. Handle VAT, GST, or Sales Tax effortlessly."
            />
            <FeatureCard
              icon={<BarChart3 className="text-indigo-500" />}
              title="Detailed Tracking"
              description="Keep track of sent, pending, and paid invoices. Get insights into your business revenue."
            />
            <FeatureCard
              icon={<Check className="text-rose-500" />}
              title="Custom Branding"
              description="Add your logo and business colors to all outgoing invoices for a professional look."
            />
            <FeatureCard
              icon={<ChevronRight className="text-primary-500" />}
              title="One-Click PDF"
              description="Generate and download high-quality PDFs ready for printing or emailing to clients."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
