import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12">
            <FileText size={24} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Invoice<span className="text-primary-600">OneClick</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <Link to="/pricing" className="hover:text-primary-600 transition-colors">Pricing</Link>
          {user ? (
            <Link to="/dashboard" className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold">
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <Link to="/login" className="hover:text-primary-600 transition-colors flex items-center gap-2">
                <LogIn size={18} /> Login
              </Link>
              <Link to="/signup" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
