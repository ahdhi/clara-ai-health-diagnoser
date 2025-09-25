
import { Patient, Visit } from "../types";

const MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'John Doe', age: 45, sex: 'Male', lastVisit: '2023-10-26' },
    { id: '2', name: 'Jane Smith', age: 34, sex: 'Female', lastVisit: '2023-10-22' },
    { id: '3', name: 'Sam Wilson', age: 62, sex: 'Male', lastVisit: '2023-09-15' },
];

const MOCK_VISITS: { [patientId: string]: Visit[] } = {
    '1': [
        { id: 'v1', date: '2023-10-26', chiefComplaint: 'Persistent Cough', diagnosis: 'Acute Bronchitis', notes: 'Prescribed Amoxicillin and advised rest. Follow-up in 1 week.' },
    ],
    '2': [
        { id: 'v2', date: '2023-10-22', chiefComplaint: 'Severe Headache', diagnosis: 'Migraine with Aura', notes: 'Prescribed Sumatriptan. Advised to avoid triggers.' },
    ],
    '3': [
         { id: 'v3', date: '2023-09-15', chiefComplaint: 'Annual Checkup', diagnosis: 'Hypertension', notes: 'Routine blood work ordered. Continue Lisinopril.' },
    ]
};

export const getPatients = (): Promise<Patient[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_PATIENTS), 300));
};

export const getPatient = (id: string): Promise<Patient | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_PATIENTS.find(p => p.id === id)), 300));
};

export const getPatientVisits = (patientId: string): Promise<Visit[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_VISITS[patientId] || []), 300));
};
