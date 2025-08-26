// Import required Firebase services
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyApyuau8WAuqHSoKaIGBAv1NNDUKZKqKgU",
  authDomain: "app-1-19279.firebaseapp.com",
  projectId: "app-1-19279",
  storageBucket: "app-1-19279.appspot.com",
  messagingSenderId: "573248149774",
  appId: "1:573248149774:web:38ab8d003688d3dd539f5f",
  measurementId: "G-WJJMG4BSY8",
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Ensure the app has been initialized successfully
if (!app) {
  console.error("Firebase initialization failed. Check your configuration.");
} else {
  console.log("Firebase app initialized successfully.");
}

// Initialize Firebase services
export const auth = getAuth(app); // Authentication
export const firestore = getFirestore(app); // Firestore
export const storage = getStorage(app); // Firebase Storage

// Analytics — only for web
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized successfully.");
    } else {
      // Firebase Analytics is not supported in React Native/mobile environments
      // This is expected behavior and can be safely ignored
      console.log("Firebase Analytics not supported in this environment (expected for mobile).");
    }
  });
}
export { analytics };

// Export the app instance
export default app;
