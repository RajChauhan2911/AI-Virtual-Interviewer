import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  jobPreferences: string[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get user profile from Firestore
 */
export async function getProfile(userId: string): Promise<ProfileData | null> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return profileSnap.data() as ProfileData;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

/**
 * Save or update user profile in Firestore
 */
export async function saveProfile(userId: string, profileData: Partial<ProfileData>): Promise<void> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const existingProfile = await getDoc(profileRef);
    
    const timestamp = new Date().toISOString();
    const dataToSave: Partial<ProfileData> = {
      ...profileData,
      userId,
      updatedAt: timestamp,
    };

    // Add createdAt only for new profiles
    if (!existingProfile.exists()) {
      dataToSave.createdAt = timestamp;
    }

    await setDoc(profileRef, dataToSave, { merge: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}

/**
 * Update specific fields in user profile
 */
export async function updateProfile(userId: string, updates: Partial<ProfileData>): Promise<void> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
