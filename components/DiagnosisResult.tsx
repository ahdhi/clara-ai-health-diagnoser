import React, { useState, useEffect } from 'react';
import { DiagnosisResponse, ICD10CodeReference } from '../types';
import { Card } from './shared/Card';
import { Spinner } from './shared/Spinner';
import { ProbabilityBar } from './shared/ProbabilityBar';
import { ICD10Modal } from './shared/ICD10Modal';
import { ICD10Service } from '../services/icd10Service';

interface DiagnosisResultProps {
    diagnosis: DiagnosisResponse | null;
    isLoading: boolean;
    error: string | null;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4">
        <h3 className="text-md font-semibold text-on-surface mb-2">{title}</h3>
        {children}
    </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
    <ul className="list-disc list-inside space-y-1 text-subtle">
        {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
);

const ICD10CodeBadge: React.FC<{ 
    code: ICD10CodeReference; 
    onClick: (code: string) => void;
    size?: 'sm' | 'md';
}> = ({ code, onClick, size = 'sm' }) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm'
    };

    const confidenceColors = {
        High: 'bg-green-100 text-green-800 border-green-200',
        Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Low: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const confidenceColor = code.confidence ? confidenceColors[code.confidence] : 'bg-blue-100 text-blue-800 border-blue-200';

    return (
        <button
            onClick={() => onClick(code.code)}
            className={`
                inline-flex items-center ${sizeClasses[size]} font-mono font-medium rounded-full border
                ${confidenceColor}
                hover:shadow-sm transition-all duration-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            `}
            title={`${code.code}: ${code.description}${code.confidence ? ` (${code.confidence} confidence)` : ''}`}
        >
            <span className="font-semibold">{code.code}</span>
            {code.confidence && (
                <span className="ml-1 text-xs opacity-75">
                    {code.confidence.charAt(0)}
                </span>
            )}
        </button>
    );
};

const ICDCodeSection: React.FC<{ 
    title: string; 
    codes: ICD10CodeReference[]; 
    onCodeClick: (code: string) => void 
}> = ({ title, codes, onCodeClick }) => {
    if (!codes || codes.length === 0) return null;

    return (
        <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
            <div className="flex flex-wrap gap-2">
                {codes.map((code, index) => (
                    <ICD10CodeBadge 
                        key={index} 
                        code={code} 
                        onClick={onCodeClick}
                        size="sm"
                    />
                ))}
            </div>
        </div>
    );
};

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, isLoading, error }) => {
    const [selectedICD10Code, setSelectedICD10Code] = useState<string | null>(null);
    const [isICD10ModalOpen, setIsICD10ModalOpen] = useState(false);
    const [suggestedCodes, setSuggestedCodes] = useState<ICD10CodeReference[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const handleICD10CodeClick = (code: string) => {
        setSelectedICD10Code(code);
        setIsICD10ModalOpen(true);
    };

    const closeICD10Modal = () => {
        setIsICD10ModalOpen(false);
        setSelectedICD10Code(null);
    };

    // Helper function to suggest ICD-10 codes for a diagnosis if not provided
    const getSuggestedICD10Codes = async (diagnosisText: string): Promise<void> => {
        setLoadingSuggestions(true);
        try {
            const suggestions = await ICD10Service.suggestCodes(diagnosisText);
            const codes = suggestions.slice(0, 3).map(suggestion => ({
                code: suggestion.code,
                description: suggestion.description,
                confidence: 'Medium' as const
            }));
            setSuggestedCodes(codes);
        } catch (error) {
            console.error('Failed to get ICD-10 suggestions:', error);
            setSuggestedCodes([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Load suggested codes when diagnosis changes
    useEffect(() => {
        if (diagnosis?.diagnosis && (!diagnosis.icd10Codes || diagnosis.icd10Codes.length === 0)) {
            getSuggestedICD10Codes(diagnosis.diagnosis);
        } else {
            setSuggestedCodes([]);
        }
    }, [diagnosis?.diagnosis]);

    if (isLoading) {
        return (
            <Card title="AI Analysis in Progress">
                <div className="flex flex-col items-center justify-center text-center text-subtle py-12">
                    <Spinner />
                    <p className="mt-4 font-semibold text-on-surface">Analyzing clinical data...</p>
                    <p className="text-sm">This may take a moment.</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Analysis Error">
                <div className="text-center text-red-700 bg-red-50 p-4 rounded-lg">
                    <p className="font-semibold">An error occurred during analysis:</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </Card>
        );
    }

    if (!diagnosis) {
        return (
            <Card title="AI Analysis Result">
                <div className="text-center text-subtle py-12">
                    <p>The AI-generated diagnosis will appear here once the analysis is complete.</p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card title="AI Diagnostic Analysis">
                <div className="divide-y divide-gray-200 animate-fade-in">
                    {/* Primary ICD-10 Codes Section */}
                    {diagnosis.primaryIcdCodes && diagnosis.primaryIcdCodes.length > 0 && (
                        <Section title="Primary ICD-10 Codes">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex flex-wrap gap-2">
                                    {diagnosis.primaryIcdCodes.map((code, index) => (
                                        <ICD10CodeBadge 
                                            key={index} 
                                            code={code} 
                                            onClick={handleICD10CodeClick}
                                            size="md"
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-blue-700 mt-2">
                                    Click on any ICD-10 code to view detailed information
                                </p>
                            </div>
                        </Section>
                    )}

                    <Section title="Differential Diagnosis">
                        <div className="space-y-4">
                            {diagnosis.differentialDiagnosis.map((d, index) => {
                                // Use provided ICD codes or suggested ones from state
                                const icdCodes = d.icdCodes && d.icdCodes.length > 0 
                                    ? d.icdCodes 
                                    : suggestedCodes;

                                return (
                                    <div key={index} className="p-4 bg-background rounded-lg border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-bold text-on-surface text-lg flex-1">{d.diagnosis}</p>
                                            <div className="ml-4">
                                                <ProbabilityBar probability={d.probability} />
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-subtle mt-2">
                                            <span className="font-semibold text-on-surface">Rationale:</span> {d.rationale}
                                        </p>

                                        {/* ICD-10 Codes for this diagnosis */}
                                        {loadingSuggestions && (!d.icdCodes || d.icdCodes.length === 0) ? (
                                            <div className="mt-3">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Spinner size="sm" />
                                                    <span className="ml-2">Loading ICD-10 suggestions...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <ICDCodeSection
                                                title="Related ICD-10 Codes"
                                                codes={icdCodes}
                                                onCodeClick={handleICD10CodeClick}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title="Overall Rationale">
                        <p className="text-subtle whitespace-pre-wrap">{diagnosis.rationale}</p>
                    </Section>
                    
                    <Section title="Recommended Tests">
                        <BulletList items={diagnosis.recommendedTests} />
                    </Section>
                    
                    <Section title="Preliminary Management Plan">
                        <BulletList items={diagnosis.managementPlan} />
                    </Section>
                </div>
            </Card>

            {/* ICD-10 Information Modal */}
            <ICD10Modal
                isOpen={isICD10ModalOpen}
                onClose={closeICD10Modal}
                icdCode={selectedICD10Code}
            />
        </>
    );
};