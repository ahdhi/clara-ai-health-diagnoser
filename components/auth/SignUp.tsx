

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../shared/Button';
import { GoogleIcon } from '../shared/icons';

interface SignUpProps {
    onToggleView: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onToggleView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signUp, loginWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await signUp(email, password);
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-8 bg-surface rounded-lg shadow-md border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-on-surface">Create an Account</h2>
            <p className="text-center text-sm text-subtle mt-1">Get started with CLARA.</p>
            
            {error && <p className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label htmlFor="email-signup" className="block text-sm font-medium text-subtle">Email Address</label>
                    <input type="email" name="email" id="email-signup" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface" />
                </div>
                <div>
                    <label htmlFor="password-signup" className="block text-sm font-medium text-subtle">Password</label>
                    <input type="password" name="password" id="password-signup" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface" />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-subtle">Confirm Password</label>
                    <input type="password" name="confirm-password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface" />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full !mt-6">
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-subtle">Or</span>
              </div>
            </div>

            <div className="mt-6">
                 <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-subtle bg-surface hover:bg-gray-50 disabled:bg-gray-200">
                    <GoogleIcon className="w-5 h-5 mr-2"/>
                    Sign up with Google
                </button>
            </div>

            <div className="mt-6 text-center">
                <button onClick={onToggleView} className="text-sm text-primary hover:underline font-medium">
                    Already have an account? Sign In
                </button>
            </div>
        </div>
    );
};