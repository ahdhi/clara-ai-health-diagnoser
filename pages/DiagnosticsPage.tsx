

import React, { useState } from 'react';
import { PatientInputForm } from '../components/PatientInputForm';
import { ImageAnalysis } from '../components/ImageAnalysis';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { Header } from '../components/shared/Header';
import { runAIAnalysis } from '../services/geminiService';
import { PatientData, ImageData, DiagnosisResponse } from '../types';
import { DiagnosisHistory } from '../components/DiagnosisHistory';
import { KnowledgeBase } from '../components/knowledge_base/KnowledgeBase';
import { saveToHistory } from '../services/historyService';
import { Card } from '../components/shared/Card';
import { Footer } from '../components/shared/Footer';

const initialPatientData: PatientData = {
    name: '',
    age: '',
    sex: '',
    symptoms: '',
    notes: '',
};

export const DiagnosticsPage: React.FC = () => {
    const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyKey, setHistoryKey] = useState(Date.now());

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setDiagnosis(null);
        try {
            const result = await runAIAnalysis(patientData, imageData);
            setDiagnosis(result);
            
            // Save to history in the background
            try {
                await saveToHistory(result, patientData);
                setHistoryKey(Date.now());
            } catch (historyError) {
                console.error('Failed to save to history:', historyError);
                // Don't fail the main operation if history save fails
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Input & History */}
                    <div className="lg:col-span-1 space-y-6">
                        <PatientInputForm
                            patientData={patientData}
                            setPatientData={setPatientData}
                            onAnalyze={handleAnalyze}
                            isLoading={isLoading}
                        />
                        <ImageAnalysis imageData={imageData} setImageData={setImageData} />
                        <DiagnosisHistory key={historyKey} />
                         <KnowledgeBase />
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-2">
                         <DiagnosisResult diagnosis={diagnosis} isLoading={isLoading} error={error} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};