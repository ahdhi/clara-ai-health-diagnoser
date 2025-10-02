import React from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import { Spinner } from './components/shared/Spinner';

function App() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Spinner />
            </div>
        );
    }

    return user ? <DiagnosticsPage /> : <AuthPage />;
}

export default App;