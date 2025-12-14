import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_fgviZkK9RuOuwvhcg_dIwlKvXxE7ZXY",
    authDomain: "usefailboard.firebaseapp.com",
    projectId: "usefailboard",
    storageBucket: "usefailboard.firebasestorage.app",
    messagingSenderId: "95035763142",
    appId: "1:95035763142:web:ec7b29627c9dfd4d836ac7",
    measurementId: "G-NJJYG27E8N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
