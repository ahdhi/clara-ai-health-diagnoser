import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../shared/Button';
import { GoogleIcon } from '../shared/icons';
import { UserProfile } from '../../services/userProfileService';

interface EnhancedSignUpProps {
    onToggleView: () => void;
}

export const EnhancedSignUp: React.FC<EnhancedSignUpProps> = ({ onToggleView }) => {
    const [step, setStep] = useState(1); // Multi-step form
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        acceptTerms: false,
        emailNotifications: true,
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signUp, loginWithGoogle } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const validateStep1 = (): boolean => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (!formData.acceptTerms) {
            setError('Please accept the terms and conditions.');
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        if (!formData.firstName.trim()) {
            setError('First name is required.');
            return false;
        }
        return true;
    };

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!validateStep2()) return;
        
        setIsLoading(true);
        try {
            const additionalData: Partial<UserProfile> = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phoneNumber: formData.phoneNumber.trim() || undefined,
                preferences: {
                    emailNotifications: formData.emailNotifications,
                    smsNotifications: false,
                    dataSharing: false,
                    language: 'en',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            };
            
            await signUp(formData.email, formData.password, additionalData);
        } catch (err: any) {
            setError(err.message);
            setStep(1); // Go back to step 1 if signup fails
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
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setError(null);
    };

    return (
        <div className="p-8 bg-surface rounded-lg shadow-md border border-gray-200 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-on-surface">Create Your Account</h2>
                <p className="text-sm text-subtle mt-1">
                    {step === 1 ? 'Get started with CLARA Health Diagnostics' : 'Tell us a bit about yourself'}
                </p>
                {step === 2 && (
                    <div className="flex justify-center mt-3">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {step === 1 && (
                <>
                    <form onSubmit={handleStep1Submit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-subtle">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-subtle">
                                Password *
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface"
                                placeholder="Choose a strong password"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-subtle">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface"
                                placeholder="Confirm your password"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="acceptTerms"
                                name="acceptTerms"
                                type="checkbox"
                                checked={formData.acceptTerms}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-subtle">
                                I accept the{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full !mt-6">
                            Continue
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
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-subtle bg-surface hover:bg-gray-50 disabled:bg-gray-200"
                        >
                            <GoogleIcon className="w-5 h-5 mr-2" />
                            Sign up with Google
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-subtle">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface"
                                placeholder="Enter your first name"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-subtle">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface"
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-subtle">
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-on-surface"
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="emailNotifications"
                            name="emailNotifications"
                            type="checkbox"
                            checked={formData.emailNotifications}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-subtle">
                            I would like to receive email notifications about health insights and platform updates
                        </label>
                    </div>

                    <div className="flex space-x-3 !mt-6">
                        <Button
                            type="button"
                            onClick={handleBackToStep1}
                            variant="secondary"
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            )}

            <div className="mt-6 text-center">
                <button onClick={onToggleView} className="text-sm text-primary hover:underline font-medium">
                    Already have an account? Sign In
                </button>
            </div>
        </div>
    );
};