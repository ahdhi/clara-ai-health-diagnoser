

import React, { useEffect, useState } from 'react';
import { DiagnosisHistoryItem } from '../types';
import * as historyService from '../services/historyService';
import { Card } from './shared/Card';
import { BookOpenIcon } from './shared/icons';
import { useAuth } from '../context/AuthContext';

interface DiagnosisHistoryProps {
    onHistoryItemClick?: (item: DiagnosisHistoryItem) => void;
}

export const DiagnosisHistory: React.FC<DiagnosisHistoryProps> = ({ onHistoryItemClick }) => {
    const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoading: authLoading } = useAuth();

    const fetchHistory = async () => {
        console.log("DiagnosisHistory: Starting to fetch history...");
        setIsLoading(true);
        setError(null);
        
        try {
            // Test Firebase connection first
            const isConnected = await historyService.testFirebaseConnection();
            console.log("Firebase connection test result:", isConnected);
            
            const historyData = await historyService.getHistory();
            console.log("DiagnosisHistory: Received history data:", historyData);
            setHistory(historyData);
            
            if (historyData.length === 0) {
                console.log("No history data found");
            }
        } catch (error: any) {
            console.error('DiagnosisHistory: Failed to fetch history:', error);
            setError(error.message || 'Failed to load history');
            setHistory([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Don't fetch history until auth is ready
        if (authLoading) {
            console.log("DiagnosisHistory: Waiting for auth to be ready...");
            return;
        }

        console.log("DiagnosisHistory: Auth ready, user:", user);
        
        // Add a small delay to ensure everything is properly initialized
        const timer = setTimeout(fetchHistory, 500);
        return () => clearTimeout(timer);
    }, [user, authLoading]);

    // Manual refresh function for debugging
    const handleRefresh = () => {
        console.log("DiagnosisHistory: Manual refresh triggered");
        fetchHistory();
    };

    if (authLoading) {
        return (
            <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
                <p className="text-sm text-subtle text-center py-4">Initializing...</p>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-subtle">Loading history...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
                <div className="text-center py-4">
                    <p className="text-sm text-red-600 mb-2">Error: {error}</p>
                    <button 
                        onClick={handleRefresh}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </Card>
        );
    }

    if (history.length === 0) {
        return (
            <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
                <div className="text-center py-4">
                    <p className="text-sm text-subtle mb-2">
                        {user ? 'No recent analyses found.' : 'Sign in to view your history.'}
                    </p>
                    {user && (
                        <button 
                            onClick={handleRefresh}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                            Refresh
                        </button>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">{history.length} recent analyses</span>
                <button 
                    onClick={handleRefresh}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    title="Refresh history"
                >
                    ↻
                </button>
            </div>
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {history.map(item => (
                    <li 
                        key={item.id} 
                        className="p-3 bg-background hover:bg-gray-100 rounded-md border border-gray-200 text-sm transition-colors cursor-pointer group"
                        onClick={() => onHistoryItemClick?.(item)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-on-surface truncate" title={item.patientData.name}>
                                    {item.patientData.name || 'Unnamed Patient'} 
                                    <span className="font-normal text-gray-500 ml-1">
                                        ({item.patientData.age || 'Age N/A'})
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 mb-1">{item.date}</p>
                                <p className="text-subtle truncate group-hover:text-gray-700 transition-colors" 
                                   title={item.differentialDiagnosis[0]?.diagnosis}>
                                    <span className="font-medium text-on-surface">Primary Dx:</span> {item.differentialDiagnosis[0]?.diagnosis || 'N/A'}
                                </p>
                                {item.differentialDiagnosis[0]?.probability && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Confidence: {item.differentialDiagnosis[0].probability}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Show symptoms on hover */}
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-xs text-gray-600 truncate" title={item.patientData.symptoms}>
                                <span className="font-medium">Symptoms:</span> {item.patientData.symptoms || 'Not specified'}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-700">Debug Info</summary>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono">
                            <p>User: {user ? user.email : 'Not signed in'}</p>
                            <p>History count: {history.length}</p>
                            <p>Auth loading: {authLoading ? 'Yes' : 'No'}</p>
                            <p>Last fetch: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </details>
                </div>
            )}
        </Card>
    );
};