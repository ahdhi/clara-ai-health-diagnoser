import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import DrugInteractionService, { 
    DrugInteraction, 
    Drug, 
    InteractionSeverity 
} from '../../services/drugInteractionService';

interface CheckResult {
    interactions: DrugInteraction[];
    searchedDrugs: (Drug | null)[];
    notFoundDrugs: string[];
}

export const DrugInteractionChecker: React.FC = () => {
    const [drugInput, setDrugInput] = useState('');
    const [results, setResults] = useState<CheckResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Memoized search results to prevent infinite re-renders
    const searchResults = useMemo(() => {
        if (drugInput.length < 2) {
            return [];
        }
        return DrugInteractionService.searchDrugs(drugInput);
    }, [drugInput]);

    // Update dropdown visibility when search results change
    useEffect(() => {
        if (drugInput.length >= 2) {
            setShowDropdown(searchResults.length > 0);
        } else {
            setShowDropdown(false);
        }
    }, [drugInput, searchResults.length]);

    const addDrug = (drug: Drug) => {
        if (!selectedDrugs.find(d => d.id === drug.id)) {
            setSelectedDrugs([...selectedDrugs, drug]);
        }
        setDrugInput('');
        setShowDropdown(false);
    };

    const removeDrug = (drugId: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d.id !== drugId));
    };

    const handleCheckInteractions = () => {
        if (selectedDrugs.length < 2) return;
        
        setIsLoading(true);
        
        // Simulate API delay for better UX
        setTimeout(() => {
            const drugNames = selectedDrugs.map(d => d.name);
            const interactions = DrugInteractionService.checkMultipleInteractions(drugNames);
            
            setResults({
                interactions,
                searchedDrugs: selectedDrugs,
                notFoundDrugs: []
            });
            setIsLoading(false);
        }, 800);
    };

    const getSeverityColor = (severity: InteractionSeverity): string => {
        switch (severity) {
            case 'Major': return 'bg-red-50 border-red-200 text-red-800';
            case 'Moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'Minor': return 'bg-green-50 border-green-200 text-green-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getSeverityIcon = (severity: InteractionSeverity): string => {
        switch (severity) {
            case 'Major': return '🚨';
            case 'Moderate': return '⚠️';
            case 'Minor': return '💡';
            default: return '❓';
        }
    };

    return (
        <Card title="Drug Interaction Checker" allowOverflow={true}>
            <div className="space-y-6">
                {/* Drug Search and Selection */}
                <div className="relative" style={{ zIndex: 1000 }}>
                    <label htmlFor="drug-search" className="block text-sm font-medium text-gray-700 mb-2">
                        Search and add medications
                    </label>
                    <div className="relative" ref={dropdownRef}>
                        <input
                            ref={inputRef}
                            id="drug-search"
                            type="text"
                            value={drugInput}
                            onChange={(e) => setDrugInput(e.target.value)}
                            onFocus={() => {
                                if (drugInput.length >= 2 && searchResults.length > 0) {
                                    setShowDropdown(true);
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Type medication name (e.g., Warfarin, Aspirin, Metformin)"
                        />
                        
                        {/* Search Results Dropdown */}
                        {showDropdown && searchResults.length > 0 && (
                            <div 
                                className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto top-full left-0"
                                style={{ zIndex: 9999 }}
                            >
                                {searchResults.slice(0, 10).map((drug) => (
                                    <button
                                        key={drug.id}
                                        onClick={() => {
                                            addDrug(drug);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="font-medium text-gray-900">{drug.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {drug.genericName} • {drug.category}
                                        </div>
                                        {drug.brandNames.length > 0 && (
                                            <div className="text-xs text-gray-400">
                                                Brand names: {drug.brandNames.slice(0, 3).join(', ')}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Drugs */}
                {selectedDrugs.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Medications:</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedDrugs.map((drug) => (
                                <span
                                    key={drug.id}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                >
                                    {drug.name}
                                    <button
                                        onClick={() => removeDrug(drug.id)}
                                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Check Interactions Button */}
                <Button 
                    onClick={handleCheckInteractions} 
                    disabled={isLoading || selectedDrugs.length < 2}
                    className="w-full"
                >
                    {isLoading ? 'Checking Interactions...' : `Check Interactions (${selectedDrugs.length} medications)`}
                </Button>

                {/* Results Section */}
                {results && !isLoading && (
                    <div className="space-y-4">
                        {results.interactions.length === 0 ? (
                            <div className="p-4 bg-green-50 rounded-md border border-green-200">
                                <h4 className="font-semibold text-green-800 flex items-center">
                                    ✅ No Known Interactions Found
                                </h4>
                                <p className="text-sm text-green-600 mt-1">
                                    Based on our database, no significant interactions were detected between the selected medications. 
                                    However, always consult your pharmacist or physician for comprehensive screening.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">
                                    {getSeverityIcon(results.interactions[0]?.severity)} 
                                    {results.interactions.length} Drug Interaction{results.interactions.length > 1 ? 's' : ''} Found
                                </h4>
                                
                                <div className="space-y-3">
                                    {results.interactions.map((interaction, index) => (
                                        <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(interaction.severity)}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-medium text-lg">
                                                    {interaction.drug1Name} + {interaction.drug2Name}
                                                </h5>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    interaction.severity === 'Major' ? 'bg-red-100 text-red-800' :
                                                    interaction.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                    interaction.severity === 'Minor' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {interaction.severity} Risk
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium">Clinical Effect:</span>
                                                    <p className="mt-1">{interaction.clinicalEffect}</p>
                                                </div>
                                                
                                                <div>
                                                    <span className="font-medium">Mechanism:</span>
                                                    <p className="mt-1">{interaction.mechanism}</p>
                                                </div>
                                                
                                                <div>
                                                    <span className="font-medium">Management:</span>
                                                    <p className="mt-1 font-medium text-gray-900">{interaction.managementRecommendation}</p>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                                                    <span>Evidence Level: {interaction.evidenceLevel}</span>
                                                    <span>Last Updated: {new Date(interaction.lastUpdated).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Database Info */}
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <span>
                                    <strong>Database:</strong> {DrugInteractionService.validateDatabase().isValid ? 'Validated' : 'Validation Issues'} • 
                                    {selectedDrugs.length} medications analyzed
                                </span>
                            </div>
                            <p className="mt-1">
                                <strong>Disclaimer:</strong> This tool provides general information based on known drug interactions. 
                                It does not replace professional medical advice. Always consult healthcare professionals for 
                                personalized medication management and comprehensive interaction screening.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
