// Firebase initial setup logic
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "avi-ai-chatbot.firebaseapp.com",
  projectId: "avi-ai-chatbot",
  storageBucket: "avi-ai-chatbot.firebasestorage.app",
  messagingSenderId: "804368356104",
  appId: "1:804368356104:web:054f54a2c220e45b5c92bd",
};

const app = initializeApp(firebaseConfig);

// Services export kora jate anyo file-e use kora jay
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
