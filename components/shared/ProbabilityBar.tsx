import React from 'react';

interface ProbabilityBarProps {
    probability: string; // Expects "High", "Medium", "Low"
}

const getProbabilityData = (probability: string): { value: number; label: string; color: string } => {
    switch (probability.toLowerCase()) {
        case 'high':
            return { value: 95, label: 'High', color: 'text-red-600' };
        case 'medium':
            return { value: 50, label: 'Medium', color: 'text-yellow-600' };
        case 'low':
            return { value: 15, label: 'Low', color: 'text-green-600' };
        default:
            // Handle unexpected values gracefully
            return { value: 5, label: probability, color: 'text-gray-600' };
    }
};

export const ProbabilityBar: React.FC<ProbabilityBarProps> = ({ probability }) => {
    const { value, label, color } = getProbabilityData(probability);

    return (
        <div 
            className="w-full my-2"
            role="meter"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`Probability: ${label}`}
            aria-label="Estimated Probability Meter"
        >
            <div className="flex justify-between items-center mb-1">
                 <span className="text-sm font-medium text-gray-700">Estimated Probability</span>
                 <span className={`text-sm font-semibold ${color}`}>{label}</span>
            </div>
            <div className="relative h-3 w-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full">
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full border-2 border-gray-700 shadow-lg"
                    style={{ left: `${value}%` }}
                    title={`Probability: ${label}`}
                >
                     <div className="w-full h-full rounded-full border-2 border-white bg-gray-700"></div>
                </div>
            </div>
        </div>
    );
};