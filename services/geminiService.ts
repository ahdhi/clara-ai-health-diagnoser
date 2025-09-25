// FIX: Correctly import GoogleGenAI and Type from @google/genai.
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, ImageData, DiagnosisResponse } from '../types';

// Initialize GoogleGenAI with apiKey from environment variables.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const diagnosisSchema = {
    type: Type.OBJECT,
    properties: {
        differentialDiagnosis: {
            type: Type.ARRAY,
            description: "A list of possible diagnoses, ranked from most to least likely.",
            items: {
                type: Type.OBJECT,
                properties: {
                    diagnosis: {
                        type: Type.STRING,
                        description: "The name of the condition or disease."
                    },
                    probability: {
                        type: Type.STRING,
                        description: "The estimated probability (e.g., High, Medium, Low)."
                    },
                    rationale: {
                        type: Type.STRING,
                        description: "Clinical reasoning for including this diagnosis, citing specific patient data."
                    }
                },
                required: ["diagnosis", "probability", "rationale"]
            }
        },
        rationale: {
            type: Type.STRING,
            description: "A comprehensive summary of the clinical reasoning, synthesizing all provided patient data (demographics, symptoms, notes, and image findings if applicable)."
        },
        recommendedTests: {
            type: Type.ARRAY,
            description: "A list of recommended diagnostic tests or procedures to confirm the diagnosis.",
            items: { type: Type.STRING }
        },
        managementPlan: {
            type: Type.ARRAY,
            description: "A preliminary management plan, including potential treatments, lifestyle recommendations, and referrals.",
            items: { type: Type.STRING }
        }
    },
    required: ["differentialDiagnosis", "rationale", "recommendedTests", "managementPlan"]
};

const buildPrompt = (patientData: PatientData, hasImage: boolean) => {
    let prompt = `
        **Clinical Case Analysis Request**

        You are an expert AI medical diagnostic assistant. Your role is to analyze the provided clinical case information and generate a structured differential diagnosis and management plan. 
        Analyze the following patient data and provide a comprehensive clinical assessment.

        **Patient Information:**
        - Name: ${patientData.name || 'Not Provided'}
        - Age: ${patientData.age || 'Not Provided'}
        - Sex: ${patientData.sex || 'Not Provided'}

        **Clinical Details:**
        - Chief Complaint / Symptoms: ${patientData.symptoms || 'Not Provided'}
        - Unstructured Clinical Notes: ${patientData.notes || 'Not Provided'}
    `;

    if (hasImage) {
        prompt += `
        **Medical Image Analysis:**
        - An associated medical image has been provided. Please analyze the image in conjunction with the clinical data. Integrate any significant findings from the image into your overall assessment and rationale.
        `;
    }

    prompt += `
        **Task:**
        Based on all the provided information, please generate a response in JSON format according to the specified schema. The analysis should be thorough, evidence-based, and clinically relevant.
    `;

    return prompt.trim();
};

export const runAIAnalysis = async (
    patientData: PatientData,
    imageData: ImageData | null
): Promise<DiagnosisResponse> => {
    try {
        const textPart = { text: buildPrompt(patientData, !!imageData) };
        
        // FIX: The parts array must be able to hold both text and image parts.
        // This was refactored to conditionally construct the array to ensure type safety.
        const imagePart = imageData
            ? {
                inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.base64,
                },
              }
            : null;

        const parts = imagePart ? [imagePart, textPart] : [textPart];

        // FIX: Use the correct model 'gemini-2.5-flash'.
        // FIX: The generateContent method should be called on ai.models.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts }],
            config: {
                // FIX: Use responseMimeType and responseSchema for structured JSON output.
                responseMimeType: "application/json",
                responseSchema: diagnosisSchema,
                temperature: 0.2, // Lower temperature for more deterministic clinical output
            },
        });
        
        // FIX: The generated text is directly on response.text.
        const jsonText = response.text.trim();
        const diagnosis: DiagnosisResponse = JSON.parse(jsonText);
        return diagnosis;

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);

        if (typeof error.message === 'string' && error.message.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("The analysis service is currently busy due to high traffic (Rate Limit Exceeded). Please wait a moment before trying again.");
        }

        throw new Error("Failed to get a diagnosis from the AI. Please check the console for more details.");
    }
};