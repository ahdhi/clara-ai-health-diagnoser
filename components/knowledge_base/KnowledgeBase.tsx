import React from 'react';
import { Card } from '../shared/Card';
import { ClinicalGuidelines } from './ClinicalGuidelines';
import { DrugInteractionChecker } from './DrugInteractionChecker';
import { RareDiseaseDatabase } from './RareDiseaseDatabase';

export const KnowledgeBase: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card title="Knowledge Base">
                <p className="text-gray-400">
                    Access clinical resources to support your diagnostic process. These tools are powered by LuminatusAI developed by Adhi and can provide quick insights into guidelines, drug interactions, and rare diseases.
                </p>
            </Card>
            <DrugInteractionChecker />
            <ClinicalGuidelines />
            <RareDiseaseDatabase />
        </div>
    );
};
