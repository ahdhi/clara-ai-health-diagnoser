
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    limit, 
    where 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from './authService';
import { DiagnosisHistoryItem, DiagnosisResponse, PatientData } from "../types";

// Fallback localStorage key for when Firebase is not available
const FALLBACK_HISTORY_KEY = 'clara_diagnosisHistory_fallback';

const HISTORY_COLLECTION = 'diagnosisHistory';

// Test function to verify Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.log("No user authenticated for Firebase test");
            return false;
        }
        
        // Try to read from collection (this will test both connection and auth)
        const testQuery = query(
            collection(db, HISTORY_COLLECTION),
            where("userId", "==", currentUser.id),
            limit(1)
        );
        
        await getDocs(testQuery);
        console.log("Firebase connection test: SUCCESS");
        return true;
    } catch (error) {
        console.error("Firebase connection test: FAILED", error);
        return false;
    }
};

// Fallback localStorage functions
const getFallbackHistory = (): DiagnosisHistoryItem[] => {
    try {
        const historyJson = localStorage.getItem(FALLBACK_HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        console.error("Failed to parse fallback history:", e);
        return [];
    }
};

const saveFallbackHistory = (history: DiagnosisHistoryItem[]): void => {
    try {
        localStorage.setItem(FALLBACK_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    } catch (e) {
        console.error("Failed to save fallback history:", e);
    }
};

export const getHistory = async (): Promise<DiagnosisHistoryItem[]> => {
    try {
        const currentUser = getCurrentUser();
        console.log("Getting history for user:", currentUser);
        
        if (!currentUser) {
            console.warn("User not authenticated - using fallback storage");
            return getFallbackHistory();
        }

        // Simplified query without orderBy to avoid index requirement
        // We'll sort in JavaScript instead
        const historyQuery = query(
            collection(db, HISTORY_COLLECTION),
            where("userId", "==", currentUser.id),
            limit(50) // Get more documents since we'll sort in JS
        );

        console.log("Fetching history from Firestore...");
        const querySnapshot = await getDocs(historyQuery);
        const history: DiagnosisHistoryItem[] = [];

        console.log("Query returned", querySnapshot.size, "documents");
        
        // Create temporary array with timestamps for sorting
        const historyWithTimestamps: (DiagnosisHistoryItem & { timestamp?: Date })[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Document data:", data);
            historyWithTimestamps.push({
                id: doc.id,
                date: data.date,
                differentialDiagnosis: data.differentialDiagnosis,
                rationale: data.rationale,
                recommendedTests: data.recommendedTests,
                managementPlan: data.managementPlan,
                patientData: data.patientData,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.date),
            });
        });

        // Sort by timestamp in JavaScript (newest first) and limit to 10
        historyWithTimestamps.sort((a, b) => {
            const aTime = a.timestamp || new Date(a.date);
            const bTime = b.timestamp || new Date(b.date);
            return bTime.getTime() - aTime.getTime();
        });

        // Remove timestamp property and convert back to DiagnosisHistoryItem[]
        const sortedHistory: DiagnosisHistoryItem[] = historyWithTimestamps.slice(0, 10).map(({timestamp, ...item}) => item);
        
        console.log("Returning sorted history from Firestore:", sortedHistory);
        return sortedHistory;
    } catch (e) {
        console.error("Failed to fetch diagnosis history from Firestore, using fallback:", e);
        return getFallbackHistory();
    }
};

export const saveToHistory = async (diagnosis: DiagnosisResponse, patientData: PatientData): Promise<void> => {
    const newEntry: DiagnosisHistoryItem = {
        ...diagnosis,
        id: new Date().toISOString(),
        date: new Date().toLocaleString(),
        patientData: { ...patientData },
    };

    try {
        const currentUser = getCurrentUser();
        console.log("Saving to history for user:", currentUser);
        
        if (!currentUser) {
            console.warn("User not authenticated - using fallback storage");
            const fallbackHistory = getFallbackHistory();
            const updatedHistory = [newEntry, ...fallbackHistory].slice(0, 10);
            saveFallbackHistory(updatedHistory);
            return;
        }

        const firestoreEntry = {
            ...diagnosis,
            patientData: { ...patientData },
            userId: currentUser.id,
            date: new Date().toLocaleString(),
            timestamp: new Date(),
        };

        console.log("Saving entry to Firestore:", firestoreEntry);
        const docRef = await addDoc(collection(db, HISTORY_COLLECTION), firestoreEntry);
        console.log("Document saved with ID:", docRef.id);
        
    } catch (e) {
        console.error("Failed to save diagnosis to Firestore, using fallback:", e);
        // Save to localStorage as fallback
        const fallbackHistory = getFallbackHistory();
        const updatedHistory = [newEntry, ...fallbackHistory].slice(0, 10);
        saveFallbackHistory(updatedHistory);
    }
};
