import React from 'react';
import { DiagnosisResponse } from '../types';
import { Card } from './shared/Card';
import { Spinner } from './shared/Spinner';
import { ProbabilityBar } from './shared/ProbabilityBar';

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

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, isLoading, error }) => {
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
        <Card title="AI Diagnostic Analysis">
            <div className="divide-y divide-gray-200 animate-fade-in">
                <Section title="Differential Diagnosis">
                    <div className="space-y-4">
                        {diagnosis.differentialDiagnosis.map((d, index) => (
                            <div key={index} className="p-4 bg-background rounded-lg border border-gray-200">
                                <p className="font-bold text-on-surface text-lg">{d.diagnosis}</p>
                                <ProbabilityBar probability={d.probability} />
                                <p className="text-sm text-subtle mt-2"><span className="font-semibold text-on-surface">Rationale:</span> {d.rationale}</p>
                            </div>
                        ))}
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
    );
};