import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQT8mUYbt7D2UAmUCPbZQ-fNRMlyxbH0g",
  authDomain: "searchanime-62fe2.firebaseapp.com",
  projectId: "searchanime-62fe2",
  storageBucket: "searchanime-62fe2.firebasestorage.app",
  messagingSenderId: "1077316966203",
  appId: "1:1077316966203:web:45a446691e58ec6a50091e",
  measurementId: "G-7P1QTQRE0N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);