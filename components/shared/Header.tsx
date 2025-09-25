import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { User } from '../../types';

// Utility function to get display name
const getDisplayName = (user: User): string => {
    // First, try to use displayName from Google
    if (user.displayName) {
        return user.displayName;
    }
    
    // If no displayName, try to use name
    if (user.name) {
        return user.name;
    }
    
    // Fall back to email username (part before @)
    if (user.email) {
        const emailUsername = user.email.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        return emailUsername
            .replace(/[._]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    return 'User';
};

export const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-surface shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <div className="flex-shrink-0 flex items-center justify-center bg-primary text-white text-xl font-bold rounded-md w-10 h-10">
                            C
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-baseline space-x-4">
                                <h1 className="text-xl font-bold text-on-surface">Clara AI - Health Diagnostics</h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-subtle text-sm mr-4 hidden sm:block">
                            Welcome, {user ? getDisplayName(user) : 'User'}
                        </span>
                        <Button
                            onClick={logout}
                            className="!px-3 !py-1.5 !text-sm !bg-transparent !text-subtle !border-gray-300 border hover:!bg-gray-100"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};