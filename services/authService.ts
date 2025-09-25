
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
        return convertFirebaseUser(userCredential.user);
    } catch (error: any) {
        throw new Error(error.message || "Login failed");
    }
};

export const signUp = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return convertFirebaseUser(userCredential.user);
    } catch (error: any) {
        throw new Error(error.message || "Sign up failed");
    }
};

export const loginWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return convertFirebaseUser(result.user);
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
