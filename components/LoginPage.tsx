import React, { useState } from 'react';
import { LogoIcon, UserIcon, LockIcon, EyeIcon, EyeOffIcon } from './IconComponents';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('emily.carter@med.us');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (email && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          setError('Invalid credentials. Please check your email and password.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        console.error("Firebase login error:", error);
      }
    } else {
      setError('Please enter both email and password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto flex bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Left Pane (Image) */}
            <div 
                className="hidden lg:block w-1/2 bg-cover bg-center relative" 
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2128&auto=format&fit=crop')"}}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/70 to-brand-primary/50"></div>
                <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white">
                    <h1 className="text-4xl font-bold leading-tight mb-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>Innovating Patient Care, Together.</h1>
                    <p className="text-lg text-gray-200 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        Securely collaborate with medical experts from around the world to deliver exceptional patient outcomes.
                    </p>
                </div>
            </div>

            {/* Right Pane (Form) */}
            <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center mb-8">
                        <div className="bg-brand-primary p-2 rounded-lg shadow-md">
                            <LogoIcon className="w-6 h-6 text-white"/>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 ml-4">Global MedConnect</h1>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900">Secure Doctor Login</h2>
                    <p className="text-gray-600 mt-2">Welcome back! Please sign in to your account.</p>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address / Username</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent sm:text-sm"
                                    placeholder="Enter your email or username"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent sm:text-sm"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-brand-primary hover:text-brand-accent">
                                Forgot Password?
                                </a>
                            </div>
                        </div>

                        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button onClick={onSwitchToSignUp} className="font-medium text-brand-primary hover:text-brand-accent">
                        Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};