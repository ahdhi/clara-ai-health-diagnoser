
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { User } from "../types";
import UserProfileService, { UserProfile } from './userProfileService';
import { emailService } from './emailService';

// Convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    name: firebaseUser.displayName || undefined,
});

// Helper to get current user synchronously
export const getCurrentUser = (): User | null => {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? convertFirebaseUser(firebaseUser) : null;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
        callback(firebaseUser ? convertFirebaseUser(firebaseUser) : null);
    });
};

export const login = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = convertFirebaseUser(userCredential.user);
        
        // Update last login timestamp (don't block login on failure)
        UserProfileService.updateLastLogin(user.id).catch(error => {
            console.error('Failed to update last login:', error);
        });
        
        return user;
    } catch (error: any) {
        throw new Error(error.message || "Login failed");
    }
};

export const signUp = async (email: string, password: string, additionalData?: Partial<UserProfile>): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = convertFirebaseUser(userCredential.user);
        
        // Create user profile in Firestore
        try {
            await UserProfileService.createProfile(user, additionalData);
            
            // Send welcome email (don't block signup on email failure)
            emailService.sendWelcomeEmail({
                user,
                firstName: additionalData?.firstName,
                lastName: additionalData?.lastName,
            }).catch(error => {
                console.error('Failed to send welcome email:', error);
            });
            
        } catch (profileError) {
            console.error('Failed to create user profile:', profileError);
            // Profile creation failure shouldn't prevent signup completion
        }
        
        return user;
    } catch (error: any) {
        throw new Error(error.message || "Sign up failed");
    }
};

export const loginWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = convertFirebaseUser(result.user);
        
        // Check if profile exists, create if not
        const profileExists = await UserProfileService.profileExists(user.id);
        if (!profileExists) {
            try {
                // Parse name from Google account
                const firstName = user.displayName?.split(' ')[0];
                const lastName = user.displayName?.split(' ').slice(1).join(' ');
                
                await UserProfileService.createProfile(user, {
                    firstName,
                    lastName,
                    emailVerified: true, // Google accounts are pre-verified
                });
                
                // Send welcome email for new Google users
                emailService.sendWelcomeEmail({
                    user,
                    firstName,
                    lastName,
                }).catch(error => {
                    console.error('Failed to send welcome email:', error);
                });
            } catch (profileError) {
                console.error('Failed to create profile for Google user:', profileError);
            }
        } else {
            // Update last login for existing users
            UserProfileService.updateLastLogin(user.id).catch(error => {
                console.error('Failed to update last login:', error);
            });
        }
        
        return user;
    } catch (error: any) {
        throw new Error(error.message || "Google sign-in failed");
    }
};

export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error(error.message || "Logout failed");
    }
};
