import { createUserWithEmailAndPassword , signInWithEmailAndPassword , onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "../firebaseConfig";

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
      onAuthStateChanged(FIREBASE_AUTH, (user) => {
        resolve(user);
      });
    });
  };