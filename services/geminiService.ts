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
                    },
                    icdCodes: {
                        type: Type.ARRAY,
                        description: "Relevant ICD-10 codes for this diagnosis.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                code: {
                                    type: Type.STRING,
                                    description: "The ICD-10 code (e.g., 'I10', 'E11.9', 'J45.9')."
                                },
                                description: {
                                    type: Type.STRING,
                                    description: "Brief description of the ICD-10 code."
                                },
                                confidence: {
                                    type: Type.STRING,
                                    description: "Confidence level for this code assignment (High, Medium, Low)."
                                }
                            },
                            required: ["code", "description", "confidence"]
                        }
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
        },
        primaryIcdCodes: {
            type: Type.ARRAY,
            description: "Primary ICD-10 codes for the most likely diagnoses.",
            items: {
                type: Type.OBJECT,
                properties: {
                    code: {
                        type: Type.STRING,
                        description: "The ICD-10 code (e.g., 'I10', 'E11.9', 'J45.9')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "Brief description of the ICD-10 code."
                    },
                    confidence: {
                        type: Type.STRING,
                        description: "Confidence level for this code assignment (High, Medium, Low)."
                    }
                },
                required: ["code", "description", "confidence"]
            }
        }
    },
    required: ["differentialDiagnosis", "rationale", "recommendedTests", "managementPlan"]
};

const buildPrompt = (patientData: PatientData, hasImage: boolean) => {
    let prompt = `
        **Clinical Case Analysis Request**

        You are an expert AI medical diagnostic assistant with comprehensive knowledge of ICD-10 coding. Your role is to analyze the provided clinical case information and generate a structured differential diagnosis, management plan, and appropriate ICD-10 codes.

        **ICD-10 Coding Guidelines:**
        - Provide accurate ICD-10-CM codes for each diagnosis
        - Include confidence levels (High, Medium, Low) for code assignments
        - Focus on the most specific codes available based on the clinical information
        - Consider both primary diagnoses and relevant secondary conditions
        - Use unspecified codes when specific details are not available

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
        Based on all the provided information, please generate a response in JSON format according to the specified schema. The analysis should include:

        1. **Differential Diagnosis**: Ranked list of possible diagnoses with appropriate ICD-10 codes
        2. **Primary ICD-10 Codes**: Most relevant codes for documentation and billing
        3. **Clinical Rationale**: Evidence-based reasoning for diagnoses
        4. **Recommended Tests**: Diagnostic workup suggestions
        5. **Management Plan**: Treatment and follow-up recommendations

        **ICD-10 Code Examples to Reference:**
        - I10: Essential hypertension
        - E11.9: Type 2 diabetes without complications
        - J45.9: Asthma, unspecified
        - F32.9: Major depressive disorder, single episode, unspecified
        - R50.9: Fever, unspecified
        - R51.9: Headache, unspecified
        - R06.02: Shortness of breath
        - M54.9: Dorsalgia, unspecified
        - K21.9: GERD without esophagitis
        - G43.9: Migraine, unspecified

        Ensure all ICD-10 codes are valid and clinically appropriate for the presented case.
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