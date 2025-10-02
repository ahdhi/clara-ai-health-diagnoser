

import React, { useState } from 'react';
import { PatientInputForm } from '../components/PatientInputForm';
import { ImageAnalysis } from '../components/ImageAnalysis';
import { DiagnosisResult } from '../components/DiagnosisResult';
import { Header } from '../components/shared/Header';
import { runAIAnalysis } from '../services/geminiService';
import { PatientData, ImageData, DiagnosisResponse, DiagnosisHistoryItem } from '../types';
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

export default function DiagnosticsPage() {
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'history' | 'knowledge'>('input');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleHistoryItemClick = (item: DiagnosisHistoryItem) => {
    setPatientData(item.patientData);
    setDiagnosisResult(item);
    setActiveTab('input');
  };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            console.log("Starting AI analysis...");
            const result = await runAIAnalysis(patientData, imageData);
            console.log("AI analysis completed:", result);
            setDiagnosisResult(result);
            
            // Save to history in the background
            try {
                console.log("Saving to history...");
                await saveToHistory(result, patientData);
                console.log("History saved successfully");
                // Trigger history refresh with a slight delay to ensure the save is complete
                setTimeout(() => {
                    setRefreshKey(Date.now());
                }, 500);
            } catch (historyError) {
                console.error('Failed to save to history:', historyError);
                // Don't fail the main operation if history save fails
            }
        } catch (err: any) {
            console.error("Analysis error:", err);
            // Handle error appropriately
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNewAnalysis = () => {
        console.log("Starting new analysis");
        setDiagnosisResult(null);
        setPatientData(initialPatientData);
        setImageData(null);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {/* Dashboard Header with New Analysis Button */}
                {diagnosisResult && (
                    <div className="mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Clara AI Dashboard</h2>
                                    <p className="text-sm text-gray-600">
                                        Your analysis results
                                    </p>
                                </div>
                                <button
                                    onClick={handleNewAnalysis}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    + New Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Input & History */}
                    <div className="lg:col-span-1 space-y-6">
                        <PatientInputForm
                            patientData={patientData}
                            setPatientData={setPatientData}
                            onAnalyze={handleAnalyze}
                            isLoading={isAnalyzing}
                        />
                        <ImageAnalysis imageData={imageData} setImageData={setImageData} />
                        <DiagnosisHistory 
                            key={refreshKey} 
                            onHistoryItemClick={handleHistoryItemClick}
                        />
                         <KnowledgeBase />
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-2">
                         <DiagnosisResult 
                            diagnosis={diagnosisResult} 
                            isLoading={isAnalyzing} 
                        />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};