/**
 * Firebase initialization for client-side Firestore access
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for slangmaker project
const firebaseConfig = {
  apiKey: "AIzaSyCf2hO7pwer8r-9Pywe3gntURCkLIOYwks",
  authDomain: "slangmaker-11c54.firebaseapp.com",
  projectId: "slangmaker-11c54",
  storageBucket: "slangmaker-11c54.firebasestorage.app",
  messagingSenderId: "117386279570",
  appId: "1:117386279570:web:520c514d175d091e49844b",
  measurementId: "G-E7C4X9FFST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
