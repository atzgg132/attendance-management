// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhR1IemjrvMKBZb0jJsi-6Swm5tz92Pyo",
  authDomain: "attendance-management-d03c0.firebaseapp.com",
  projectId: "attendance-management-d03c0",
  storageBucket: "attendance-management-d03c0.appspot.com",
  messagingSenderId: "930592223667",
  appId: "1:930592223667:web:455749837296cd4a591bc6",
  measurementId: "G-QVB4J7JTTL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { storage, auth };
