import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ নিচের অংশটুকু মুছে আপনার Firebase Console এর Config বসান
const firebaseConfig = {
  apiKey: "AIzaSy...আপনার_ফায়ারবেস_API_KEY",
  authDomain: "আপনার_PROJECT.firebaseapp.com",
  projectId: "আপনার_PROJECT_ID",
  storageBucket: "আপনার_PROJECT.appspot.com",
  messagingSenderId: "NUMBER",
  appId: "NUMBER"
};
// ⚠️ উপরের অংশটুকু আপনার ডাটা দিয়ে পূরন করতে হবে

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
