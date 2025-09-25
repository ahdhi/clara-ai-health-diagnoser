import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';

// Enhanced drug interaction database
interface DrugInteraction {
    drugs: string[];
    severity: 'High' | 'Moderate' | 'Low';
    description: string;
    mechanism: string;
    recommendation: string;
}

const DRUG_INTERACTIONS: DrugInteraction[] = [
    {
        drugs: ['warfarin', 'aspirin'],
        severity: 'High',
        description: 'Increased risk of bleeding',
        mechanism: 'Both drugs affect blood clotting mechanisms',
        recommendation: 'Avoid concurrent use or monitor INR closely. Consider alternative antiplatelet agent.'
    },
    {
        drugs: ['warfarin', 'ibuprofen'],
        severity: 'High',
        description: 'Increased risk of bleeding and reduced warfarin efficacy',
        mechanism: 'NSAIDs affect platelet function and may displace warfarin from protein binding',
        recommendation: 'Avoid concurrent use. Use acetaminophen for pain relief instead.'
    },
    {
        drugs: ['lisinopril', 'potassium'],
        severity: 'Moderate',
        description: 'Risk of hyperkalemia',
        mechanism: 'ACE inhibitors reduce potassium excretion',
        recommendation: 'Monitor serum potassium levels regularly. Avoid potassium supplements unless necessary.'
    },
    {
        drugs: ['digoxin', 'amiodarone'],
        severity: 'High',
        description: 'Increased digoxin levels leading to toxicity',
        mechanism: 'Amiodarone inhibits P-glycoprotein, reducing digoxin clearance',
        recommendation: 'Reduce digoxin dose by 50% and monitor digoxin levels closely.'
    },
    {
        drugs: ['metformin', 'contrast media'],
        severity: 'High',
        description: 'Risk of lactic acidosis',
        mechanism: 'Contrast media may cause acute kidney injury, reducing metformin clearance',
        recommendation: 'Discontinue metformin 48 hours before and after contrast procedures with normal kidney function.'
    },
    {
        drugs: ['simvastatin', 'amiodarone'],
        severity: 'Moderate',
        description: 'Increased risk of myopathy',
        mechanism: 'Amiodarone inhibits CYP3A4, increasing simvastatin levels',
        recommendation: 'Limit simvastatin dose to 20mg daily or consider alternative statin.'
    },
    {
        drugs: ['lithium', 'thiazide'],
        severity: 'High',
        description: 'Increased lithium levels leading to toxicity',
        mechanism: 'Thiazide diuretics reduce renal lithium clearance',
        recommendation: 'Monitor lithium levels closely. May need to reduce lithium dose.'
    },
    {
        drugs: ['phenytoin', 'warfarin'],
        severity: 'Moderate',
        description: 'Variable effects on anticoagulation',
        mechanism: 'Complex interaction affecting both drug metabolism',
        recommendation: 'Monitor INR closely when starting, stopping, or changing phenytoin dose.'
    }
];

export const DrugInteractionChecker: React.FC = () => {
    const [drugs, setDrugs] = useState('');
    const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const normalizeDrugName = (drug: string): string => {
        return drug.toLowerCase().trim().replace(/[^a-z]/g, '');
    };

    const findInteractions = (drugList: string[]): DrugInteraction[] => {
        const normalizedDrugs = drugList.map(normalizeDrugName);
        const foundInteractions: DrugInteraction[] = [];

        DRUG_INTERACTIONS.forEach(interaction => {
            const matchingDrugs = interaction.drugs.filter(drug => 
                normalizedDrugs.some(inputDrug => 
                    inputDrug.includes(drug) || drug.includes(inputDrug)
                )
            );

            if (matchingDrugs.length >= 2) {
                foundInteractions.push(interaction);
            }
        });

        return foundInteractions;
    };

    const handleCheck = () => {
        setIsLoading(true);
        
        // Simulate API call delay
        setTimeout(() => {
            const drugList = drugs.split(',').map(d => d.trim()).filter(d => d.length > 0);
            
            if (drugList.length < 2) {
                setInteractions([]);
                setIsLoading(false);
                return;
            }

            const foundInteractions = findInteractions(drugList);
            setInteractions(foundInteractions);
            setIsLoading(false);
        }, 800);
    };

    const getSeverityColor = (severity: string): string => {
        switch (severity) {
            case 'High': return 'bg-red-50 border-red-200 text-red-800';
            case 'Moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'Low': return 'bg-green-50 border-green-200 text-green-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    return (
        <Card title="Drug Interaction Checker">
            <div className="space-y-4">
                <div>
                    <label htmlFor="drugs" className="block text-sm font-medium text-gray-700">Enter drug names (comma-separated)</label>
                    <textarea 
                        name="drugs" 
                        id="drugs" 
                        rows={3} 
                        value={drugs}
                        onChange={(e) => setDrugs(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-gray-900"
                        placeholder="e.g., Warfarin, Aspirin, Lisinopril"
                    />
                </div>
                <Button onClick={handleCheck} disabled={isLoading || !drugs}>
                    {isLoading ? 'Checking...' : 'Check Interactions'}
                </Button>
                
                {/* Results Section */}
                {!isLoading && drugs && interactions.length === 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                        <h4 className="font-semibold text-green-800">✅ No Major Interactions Found</h4>
                        <p className="text-sm text-green-600">
                            Based on our database, no significant interactions were detected. 
                            Always consult a pharmacist or physician for comprehensive drug interaction screening.
                        </p>
                    </div>
                )}

                {interactions.length > 0 && (
                    <div className="mt-4 space-y-3">
                        <h4 className="font-semibold text-gray-800">⚠️ Drug Interactions Found:</h4>
                        {interactions.map((interaction, index) => (
                            <div key={index} className={`p-4 rounded-md border ${getSeverityColor(interaction.severity)}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">
                                        {interaction.drugs.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(' + ')}
                                    </h5>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        interaction.severity === 'High' ? 'bg-red-100 text-red-800' :
                                        interaction.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {interaction.severity} Risk
                                    </span>
                                </div>
                                <p className="text-sm mb-2"><strong>Effect:</strong> {interaction.description}</p>
                                <p className="text-sm mb-2"><strong>Mechanism:</strong> {interaction.mechanism}</p>
                                <p className="text-sm"><strong>Recommendation:</strong> {interaction.recommendation}</p>
                            </div>
                        ))}
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                            <strong>Disclaimer:</strong> This tool provides general information only. Always consult healthcare professionals 
                            for personalized medical advice and comprehensive drug interaction screening.
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
