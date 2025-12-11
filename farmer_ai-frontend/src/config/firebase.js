import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let auth;
let googleProvider;

try {
    // Debug: Log what Vite sees
    console.log("🔥 Firebase Config Loading:", {
        apiKey: Boolean(firebaseConfig.apiKey),
        projectId: firebaseConfig.projectId,
        envKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    });

    if (!firebaseConfig.apiKey) {
        throw new Error("Missing Firebase API Key");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
} catch (error) {
    console.warn("Firebase initialization failed:", error.message);
    app = null;
    auth = null;
    googleProvider = null;
}

export { auth, googleProvider };
