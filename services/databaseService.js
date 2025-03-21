import { FIREBASE_DB } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export const createUser = async (userData) => {
    try{
        const userRef = await addDoc(collection(FIREBASE_DB, "users"), userData);
        console.log("User created with ID: ", userRef.id);
        return userRef.id;
    }catch(error){
        throw error;
    }
};
