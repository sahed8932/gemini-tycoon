import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ নিচের অংশটুকু মুছে আপনার Firebase Console এর Config বসান
const firebaseConfig = {
  apiKey: "AIzaSyDZbOF1OVaSMYld2ljtKfJiG6loS-dz1pk",
  authDomain: "gemini-tycoon-7d4ef.firebaseapp.com",
  databaseURL: "https://gemini-tycoon-7d4ef-default-rtdb.firebaseio.com",
  projectId: "gemini-tycoon-7d4ef",
  storageBucket: "gemini-tycoon-7d4ef.firebasestorage.app",
  messagingSenderId: "891269583824",
  appId: "1:891269583824:web:a436a79b8123c1f7199fd5"
};
// ⚠️ উপরের অংশটুকু আপনার ডাটা দিয়ে পূরন করতে হবে

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
