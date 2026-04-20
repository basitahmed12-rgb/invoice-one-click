import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                <FileText size={18} />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">Invoice<span className="text-primary-600">OneClick</span></span>
            </Link>
            <p className="text-slate-500 mb-6">
              Empowering small businesses with AI-powered invoicing tools. Fast, professional, and reliable.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-600 transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-600 transition-all">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-600 transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-slate-500">
              <li><Link to="/features" className="hover:text-primary-600">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-600">Pricing</Link></li>
              <li><Link to="/templates" className="hover:text-primary-600">Templates</Link></li>
              <li><Link to="/ai" className="hover:text-primary-600">AI Processing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-slate-500">
              <li><Link to="/docs" className="hover:text-primary-600">Documentation</Link></li>
              <li><Link to="/blog" className="hover:text-primary-600">Business Blog</Link></li>
              <li><Link to="/guides" className="hover:text-primary-600">Invoice Guides</Link></li>
              <li><Link to="/support" className="hover:text-primary-600">Support Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-500">
              <li><Link to="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-primary-600">Cookie Policy</Link></li>
              <li><Link to="/security" className="hover:text-primary-600">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Invoice OneClick. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
