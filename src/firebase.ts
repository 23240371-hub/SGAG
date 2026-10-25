import { initializeApp } from "firebase/app";
import { getFirestore  } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAukOYTulOUCsHuG67c5uEVUg5VwEfAH6M",
  authDomain: "sgag-2932d.firebaseapp.com",
  projectId: "sgag-2932d",
  storageBucket: "sgag-2932d.firebasestorage.app",
  messagingSenderId: "356743233581",
  appId: "1:356743233581:web:ca7cb45c16f56d7c9ff8a4",
  measurementId: "G-95KVN1P335"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);