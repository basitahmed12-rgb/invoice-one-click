import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for freelancers starting out.',
      features: [
        '5 Invoices per month',
        'Standard Templates',
        'AI Data Extraction (Limited)',
        'Email Support',
        'PDF Export'
      ],
      cta: 'Start for Free',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '19',
      description: 'Best for growing small businesses.',
      features: [
        'Unlimited Invoices',
        'All Premium Templates',
        'Unlimited AI Extraction',
        'Custom Branding & Logo',
        'Priority Support',
        'Business Revenue Insights'
      ],
      cta: 'Upgrade to Pro',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large teams and ecommerce sellers.',
      features: [
        'Multi-user access',
        'API Integration',
        'Dedicated account manager',
        'Custom template design',
        'White-label solution',
        'Bulk generation'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="py-24 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Simple, transparent pricing.</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Choose the plan that fits your business stage. No hidden fees, cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-8 rounded-3xl border flex flex-col relative overflow-hidden ${
                plan.highlighted 
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105 z-10' 
                : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price !== 'Custom' && '$'}
                  {plan.price}
                </span>
                {plan.price !== 'Custom' && <span className={`${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>}
              </div>
              
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${plan.highlighted ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-100 text-primary-600'}`}>
                      <Check size={14} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                to="/signup"
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                {plan.cta} <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
               <div className="p-6 bg-white rounded-2xl border border-slate-100">
                  <h4 className="font-bold mb-2">Can I upgrade or downgrade anytime?</h4>
                  <p className="text-slate-600 text-sm">Yes, you can change your plan at any time from your dashboard settings. Changes are reflected proportionally in your next billing cycle.</p>
               </div>
               <div className="p-6 bg-white rounded-2xl border border-slate-100">
                  <h4 className="font-bold mb-2">How does the AI extraction work?</h4>
                  <p className="text-slate-600 text-sm">Simply paste your raw invoice data, and our AI logic (Gemini) will automatically identify the buyer, seller, items, and totals for you.</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
