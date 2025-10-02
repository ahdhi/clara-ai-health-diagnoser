import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
// FIX: Correctly import from the authService file. This error occurred because the target file was empty.
import * as authService from '../services/authService';
import { UserProfile } from '../services/userProfileService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, additionalData?: Partial<UserProfile>) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((user) => {
            setUser(user);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        await authService.login(email, pass);
        // User state will be updated via onAuthStateChange
    };

    const signUp = async (email: string, pass: string, additionalData?: Partial<UserProfile>) => {
        await authService.signUp(email, pass, additionalData);
        // User state will be updated via onAuthStateChange
    };
    
    const loginWithGoogle = async () => {
        await authService.loginWithGoogle();
        // User state will be updated via onAuthStateChange
    }

    const logout = async () => {
        await authService.logout();
        // User state will be updated via onAuthStateChange
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signUp, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
