import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    medicalInfo?: {
        allergies?: string[];
        chronicConditions?: string[];
        currentMedications?: string[];
        bloodType?: string;
    };
    preferences?: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        dataSharing: boolean;
        language: string;
        timezone: string;
    };
    createdAt: any;
    updatedAt: any;
    lastLoginAt?: any;
    emailVerified: boolean;
    onboardingCompleted: boolean;
}

export class UserProfileService {
    private static readonly COLLECTION_NAME = 'userProfiles';

    /**
     * Create a new user profile
     */
    static async createProfile(user: User, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
        const profile: UserProfile = {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            firstName: additionalData?.firstName,
            lastName: additionalData?.lastName,
            phoneNumber: additionalData?.phoneNumber,
            dateOfBirth: additionalData?.dateOfBirth,
            gender: additionalData?.gender,
            emergencyContact: additionalData?.emergencyContact,
            medicalInfo: additionalData?.medicalInfo,
            preferences: {
                emailNotifications: true,
                smsNotifications: false,
                dataSharing: false,
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ...additionalData?.preferences,
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            emailVerified: false,
            onboardingCompleted: false,
            ...additionalData,
        };

        try {
            const docRef = doc(db, this.COLLECTION_NAME, user.id);
            await setDoc(docRef, profile);
            return profile;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw new Error('Failed to create user profile');
        }
    }

    /**
     * Get user profile by ID
     */
    static async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw new Error('Failed to get user profile');
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId: string, updateData: Partial<UserProfile>): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, userId);
            await updateDoc(docRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Failed to update user profile');
        }
    }

    /**
     * Update last login timestamp
     */
    static async updateLastLogin(userId: string): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, userId);
            await updateDoc(docRef, {
                lastLoginAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating last login:', error);
            // Don't throw error for login tracking failures
        }
    }

    /**
     * Mark onboarding as completed
     */
    static async completeOnboarding(userId: string): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, userId);
            await updateDoc(docRef, {
                onboardingCompleted: true,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error completing onboarding:', error);
            throw new Error('Failed to complete onboarding');
        }
    }

    /**
     * Mark email as verified
     */
    static async markEmailVerified(userId: string): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, userId);
            await updateDoc(docRef, {
                emailVerified: true,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error marking email verified:', error);
            throw new Error('Failed to mark email as verified');
        }
    }

    /**
     * Get all profiles (for admin purposes)
     */
    static async getAllProfiles(): Promise<UserProfile[]> {
        try {
            const q = query(collection(db, this.COLLECTION_NAME));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as UserProfile);
        } catch (error) {
            console.error('Error getting all profiles:', error);
            throw new Error('Failed to get all profiles');
        }
    }

    /**
     * Search profiles by email
     */
    static async getProfileByEmail(email: string): Promise<UserProfile | null> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('email', '==', email)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting profile by email:', error);
            throw new Error('Failed to get profile by email');
        }
    }

    /**
     * Check if profile exists
     */
    static async profileExists(userId: string): Promise<boolean> {
        try {
            const profile = await this.getProfile(userId);
            return profile !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Delete user profile (GDPR compliance)
     */
    static async deleteProfile(userId: string): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, userId);
            await updateDoc(docRef, {
                // Instead of deleting, mark as deleted for audit purposes
                deleted: true,
                deletedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // Remove PII
                email: '[DELETED]',
                displayName: '[DELETED]',
                firstName: '[DELETED]',
                lastName: '[DELETED]',
                phoneNumber: '[DELETED]',
                emergencyContact: null,
                medicalInfo: null,
            });
        } catch (error) {
            console.error('Error deleting user profile:', error);
            throw new Error('Failed to delete user profile');
        }
    }
}

export default UserProfileService;