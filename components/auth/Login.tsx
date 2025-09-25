import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../shared/Button';
import { GoogleIcon } from '../shared/icons';

interface LoginProps {
    onToggleView: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await loginWithGoogle();
        } catch (err: any)
{
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-8 bg-surface rounded-lg shadow-md border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-on-surface">Welcome Back</h2>
            <p className="text-center text-sm text-subtle mt-1">Sign in to access your dashboard.</p>
            
            {error && <p className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-subtle">Email Address</label>
                    <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-subtle">Password</label>
                    <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface" />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-subtle">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
                 <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-subtle bg-surface hover:bg-gray-50 disabled:bg-gray-200">
                    <GoogleIcon className="w-5 h-5 mr-2"/>
                    Sign in with Google
                </button>
            </div>

            <div className="mt-6 text-center">
                <button onClick={onToggleView} className="text-sm text-primary hover:underline font-medium">
                    Don't have an account? Sign Up
                </button>
            </div>
        </div>
    );
};