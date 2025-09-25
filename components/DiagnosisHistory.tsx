

import React, { useEffect, useState } from 'react';
import { DiagnosisHistoryItem } from '../types';
import * as historyService from '../services/historyService';
import { Card } from './shared/Card';
import { BookOpenIcon } from './shared/icons';

export const DiagnosisHistory: React.FC = () => {
    const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            console.log("DiagnosisHistory: Fetching history...");
            setIsLoading(true);
            
            // Test Firebase connection first
            try {
                const isConnected = await historyService.testFirebaseConnection();
                console.log("Firebase connection test result:", isConnected);
            } catch (e) {
                console.error("Firebase connection test error:", e);
            }
            
            try {
                const historyData = await historyService.getHistory();
                console.log("DiagnosisHistory: Received history data:", historyData);
                setHistory(historyData);
            } catch (error) {
                console.error('DiagnosisHistory: Failed to fetch history:', error);
                setHistory([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Add a small delay to ensure auth state is ready
        const timer = setTimeout(fetchHistory, 1000);
        return () => clearTimeout(timer);
    }, []);


    if (isLoading) {
        return (
            <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
                <p className="text-sm text-subtle text-center py-4">Loading history...</p>
            </Card>
        );
    }

    if (history.length === 0) {
        return (
            <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
                <p className="text-sm text-subtle text-center py-4">No recent analyses found.</p>
            </Card>
        );
    }

    return (
        <Card title="Diagnosis History" icon={<BookOpenIcon className="h-5 w-5 text-subtle" />}>
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {history.map(item => (
                    <li key={item.id} className="p-3 bg-background hover:bg-gray-100 rounded-md border border-gray-200 text-sm transition-colors">
                        <p className="font-semibold text-on-surface truncate">
                            {item.patientData.name || 'Unnamed Patient'} ({item.patientData.age || 'N/A'})
                        </p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                        <p className="mt-1 text-subtle truncate" title={item.differentialDiagnosis[0]?.diagnosis}>
                            <span className="font-medium text-on-surface">Dx:</span> {item.differentialDiagnosis[0]?.diagnosis || 'N/A'}
                        </p>
                    </li>
                ))}
            </ul>
        </Card>
    );
};