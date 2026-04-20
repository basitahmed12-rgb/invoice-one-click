import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Github, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ isSignup = false }: { isSignup?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signInWithGoogle, signInWithGithub, signInWithApple, signupWithEmail, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignup) {
        if (!name) throw new Error('Full name is required');
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, name, isSignup, signupWithEmail, loginWithEmail, navigate]);

  const handleProviderSignIn = async (providerName: 'google' | 'github' | 'apple') => {
    setIsLoading(true);
    setError(null);
    try {
      if (providerName === 'google') await signInWithGoogle();
      else if (providerName === 'github') await signInWithGithub();
      else if (providerName === 'apple') await signInWithApple();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `${providerName} Sign-In failed.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-slate-50 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic mb-3">
              {isSignup ? 'Init Sequence' : 'Access Granted'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-10">
              {isSignup ? "Join the ranks of high-performance business owners." : "Decrypt your dashboard and manage the stream."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            <button 
              onClick={() => handleProviderSignIn('google')}
              disabled={isLoading}
              title="Sign in with Google"
              className="h-14 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-primary-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button 
              onClick={() => handleProviderSignIn('apple')}
              disabled={isLoading}
              title="Sign in with Apple"
              className="h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.06.75.7 0 1.83-.75 3.35-.64 1.8.12 3.12 1.01 3.82 2.3-3.06 1.81-2.58 5.76.46 7.15-.36 1.14-.94 2.41-1.69 3.41zM12.03 7.25c-.09-2.62 2.24-4.8 4.67-4.87.26 2.45-2.3 4.96-4.67 4.87z" />
              </svg>
            </button>
            <button 
              onClick={() => handleProviderSignIn('github')}
              disabled={isLoading}
              title="Sign in with GitHub"
              className="h-14 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Github className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]">
              <span className="bg-white px-4 text-slate-300">Or Secure Protocol</span>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <label className="label-sm ml-4 border-l-2 border-primary-500 pl-2">Entity Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label-sm ml-4 border-l-2 border-primary-500 pl-2">Communication Link</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-4">
                <label className="label-sm border-l-2 border-primary-500 pl-2 m-0">Security Cipher</label>
                {!isSignup && <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:underline">Lost access?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all mt-4 shadow-2xl shadow-primary-200 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <>{isSignup ? 'Init Global Account' : 'Authenticate Session'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">
              {isSignup ? "Parallel user detected?" : "New to the grid?"}
            </p>
            <Link 
              to={isSignup ? '/login' : '/signup'} 
              className="inline-block px-8 py-3 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:bg-white hover:border-primary-200 hover:shadow-lg transition-all"
            >
              {isSignup ? 'Return to Access Portal' : 'Register New Entity'}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
