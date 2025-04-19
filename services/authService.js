import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut, clearPersistence, EmailAuthProvider, reauthenticateWithCredential as firebaseReauthenticate } from "firebase/auth";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../firebaseConfig";

export const SignUp = async (email, password) => {
  try {
    const userCredentials = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    return userCredentials.user;
  } catch (error) {
    let errorMessage = "Sign up failed";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email already in use. Please use a different email.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address. Please enter a valid email.";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak. Please use a stronger password.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection.";
        break;
      default:
        errorMessage = "An unexpected error occurred. Please try again.";
        break;
    }
    throw new Error(errorMessage);
  }
};

export const SignIn = async (email, password) => {
    try {
      const user = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      return user;
    } catch (error) {
      // Handle different error types
      let errorMessage = "Sign in failed";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No user found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address. Please enter a valid email.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = "An unexpected error occurred. Please try again.";
          break;
      }
      throw new Error(errorMessage);
    }
  };

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Merge Firestore data with auth user data
          Object.assign(user, {
            ...userData,
            role: userData.role || "user",
          });
        } else {
          user.role = "user";
        }
      }
      resolve(user);
    });
  });
};

export const SignOut = async () => {
  try {
    await firebaseSignOut(FIREBASE_AUTH);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
};

export const reauthenticateWithCredential = async (user, credential) => {
  try {
    return await firebaseReauthenticate(user, credential);
  } catch (error) {
    throw error;
  }
};

export { EmailAuthProvider };