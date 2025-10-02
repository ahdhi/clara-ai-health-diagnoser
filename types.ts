
export interface User {
  id: string;
  email: string;
  displayName?: string;
  name?: string;
}

export interface PatientData {
  name: string;
  age: string;
  sex: string;
  symptoms: string;
  notes: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
  fileName: string;
}

export interface ICD10CodeReference {
  code: string;
  description: string;
  confidence?: 'High' | 'Medium' | 'Low';
}

export interface DifferentialDiagnosis {
  diagnosis: string;
  probability: string;
  rationale: string;
  icdCodes?: ICD10CodeReference[];
}

export interface DiagnosisResponse {
  differentialDiagnosis: DifferentialDiagnosis[];
  rationale: string;
  recommendedTests: string[];
  managementPlan: string[];
  primaryIcdCodes?: ICD10CodeReference[];
}

export interface DiagnosisHistoryItem extends DiagnosisResponse {
    id: string;
    date: string;
    patientData: PatientData;
}

// For the patient management feature
export interface Patient {
    id: string;
    name: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    lastVisit: string;
}

export interface Visit {
    id: string;
    date: string;
    chiefComplaint: string;
    diagnosis: string;
    notes: string;
}
