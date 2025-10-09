import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const configFromEnv = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

function isConfigValid(cfg: Record<string, unknown>) {
  return [
    cfg.apiKey,
    cfg.authDomain,
    cfg.projectId,
    cfg.storageBucket,
    cfg.messagingSenderId,
    cfg.appId,
  ].every(Boolean);
}

export function getFirebaseApp() {
  const existing = getApps()[0];
  if (existing) return existing;
  const cfg = configFromEnv();
  if (!isConfigValid(cfg)) {
    console.warn("Firebase: missing config. Did you set .env VITE_FIREBASE_*?");
    return undefined as unknown as ReturnType<typeof initializeApp>;
  }
  return initializeApp(cfg);
}

export const app = getFirebaseApp();
export const auth = app ? getAuth(app) : undefined as unknown as ReturnType<typeof getAuth>;
export const db = app ? getFirestore(app) : undefined as unknown as ReturnType<typeof getFirestore>;
export const storage = app ? getStorage(app) : undefined as unknown as ReturnType<typeof getStorage>;

export default app;


