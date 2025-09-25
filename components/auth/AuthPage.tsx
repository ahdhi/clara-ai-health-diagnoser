

import React, { useState } from 'react';
import { Login } from './Login';
import { SignUp } from './SignUp';
import { Footer } from '../shared/Footer';

export const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    const toggleView = () => setIsLoginView(!isLoginView);

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
             <main className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 flex items-center justify-center bg-primary text-white text-3xl font-bold rounded-lg">
                        C
                    </div>
                    <h1 className="mt-4 text-3xl font-extrabold text-on-surface">
                        Clara AI - Health Diagnostics
                    </h1>
                    <p className="mt-2 text-md text-subtle">
                        Clinical Learning and Diagnostic Assessment
                    </p>
                </div>

                {isLoginView ? <Login onToggleView={toggleView} /> : <SignUp onToggleView={toggleView} />}
            </main>
            <div className="w-full max-w-md mt-8">
                 <Footer />
            </div>
        </div>
    );
};