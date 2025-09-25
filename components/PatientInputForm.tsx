import React from 'react';
import { PatientData } from '../types';
import { Button } from './shared/Button';
import { Card } from './shared/Card';

interface PatientInputFormProps {
    patientData: PatientData;
    setPatientData: React.Dispatch<React.SetStateAction<PatientData>>;
    onAnalyze: () => void;
    isLoading: boolean;
}

export const PatientInputForm: React.FC<PatientInputFormProps> = ({ patientData, setPatientData, onAnalyze, isLoading }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPatientData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = patientData.symptoms.trim() !== '' || patientData.notes.trim() !== '';

    return (
        <Card title="Patient & Clinical Data">
            <form onSubmit={(e) => { e.preventDefault(); onAnalyze(); }} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-subtle">Patient Name</label>
                    <input type="text" name="name" id="name" value={patientData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-on-surface" placeholder="e.g., Jane Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-subtle">Age</label>
                        <input type="text" name="age" id="age" value={patientData.age} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-on-surface" placeholder="e.g., 45" />
                    </div>
                    <div>
                        <label htmlFor="sex" className="block text-sm font-medium text-subtle">Sex</label>
                        <select id="sex" name="sex" value={patientData.sex} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-surface text-on-surface">
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-subtle">Chief Complaint / Symptoms</label>
                    <textarea id="symptoms" name="symptoms" rows={4} value={patientData.symptoms} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-on-surface" placeholder="e.g., Persistent cough for 2 weeks..."></textarea>
                </div>
                 <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-subtle">Unstructured Clinical Notes</label>
                    <textarea id="notes" name="notes" rows={6} value={patientData.notes} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-surface border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-on-surface" placeholder="Enter any additional notes, history..."></textarea>
                </div>
                <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={!isFormValid || isLoading}>
                        {isLoading ? 'Analyzing...' : 'Run AI Analysis'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};