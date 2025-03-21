import { initializeApp, getApps } from "firebase/app";
import { initializeAuth , getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtZrjsszDCiSPCLVelm35u2WhwwJk_0Kk",
  authDomain: "afsal-lost-n-found.firebaseapp.com",
  projectId: "afsal-lost-n-found",
  storageBucket: "afsal-lost-n-found.firebasestorage.app",
  messagingSenderId: "85128303594",
  appId: "1:85128303594:web:5ad6351a3b309f041d5893",
  measurementId: "G-S8VWQ317GR"
};


export const FIREBASE_APP = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);