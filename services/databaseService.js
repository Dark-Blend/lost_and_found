import { FIREBASE_DB } from "../firebaseConfig";
import { collection, setDoc, doc, getDoc } from "firebase/firestore";

export const createUser = async (userData , userId) => {
    try {
      console.log("Attempting to create user with ID:", userId);
      const userDocRef = doc(FIREBASE_DB, "users", userId);
      
      await setDoc(userDocRef, userData);
      
      console.log("User created with ID: ", userId);
      return userId;
    } catch (error) {
      console.error("Detailed error in createUser:", error);
      throw error;
    }
  };

export const getUser = async (userId) => {
  try {
    const userRef = doc(collection(FIREBASE_DB, "users"), userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.warn("User document does not exist:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

const convertImageToBase64 = async (uri) => {
  try {
    // Fetch the image
    const response = await fetch(uri);
    // Convert to blob
    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
};

export const addFoundItem = async (itemData) => {
  try {
    const foundItemsRef = collection(FIREBASE_DB, "foundItems");
    const newItemRef = doc(foundItemsRef);
    const itemId = newItemRef.id;

    // Extract base64 data from the images
    const base64Images = itemData.images.map(image => image.base64);

    // Add the item to Firestore with base64 images
    await setDoc(newItemRef, {
      ...itemData,
      id: itemId,
      images: base64Images,
      createdAt: new Date(),
    });
    
    return itemId;
  } catch (error) {
    console.error("Error adding found item:", error);
    throw error;
  }
};
