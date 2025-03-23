import { FIREBASE_DB } from "../firebaseConfig";
import { collection, setDoc, doc, getDoc, updateDoc, getDocs, query, orderBy, limit, where, deleteDoc } from "firebase/firestore";

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

export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(FIREBASE_DB, "users", userId);
    await updateDoc(userRef, userData);
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const addKarma = async (userId, amount, reason) => {
  try {
    const karmaRef = doc(collection(FIREBASE_DB, "karma"), userId);
    const userRef = doc(FIREBASE_DB, "users", userId);
    
    // Get user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    const userData = userDoc.data();

    // Create karma entry
    const karmaData = {
      userId,
      username: userData.username,
      amount,
      reason,
      timestamp: new Date(),
      userAvatar: userData.avatar
    };

    await setDoc(karmaRef, karmaData);
    return true;
  } catch (error) {
    console.error("Error adding karma:", error);
    throw error;
  }
};

export const getKarmaLeaderboard = async () => {
  try {
    const karmaRef = collection(FIREBASE_DB, "karma");
    const q = query(karmaRef, orderBy("timestamp", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    
    const karmaList = [];
    querySnapshot.forEach((doc) => {
      karmaList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return karmaList;
  } catch (error) {
    console.error("Error getting karma leaderboard:", error);
    throw error;
  }
};

export const getUserKarma = async (userId) => {
  try {
    const karmaRef = collection(FIREBASE_DB, "karma");
    const q = query(karmaRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    let totalKarma = 0;
    const karmaHistory = [];
    
    querySnapshot.forEach((doc) => {
      const karmaData = doc.data();
      totalKarma += karmaData.amount;
      karmaHistory.push({
        id: doc.id,
        ...karmaData
      });
    });
    
    return {
      totalKarma,
      karmaHistory
    };
  } catch (error) {
    console.error("Error getting user karma:", error);
    throw error;
  }
};

export const getUserFoundItems = async (userId) => {
  try {
    const foundItemsRef = collection(FIREBASE_DB, "foundItems");
    const q = query(foundItemsRef, where("foundBy", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return items;
  } catch (error) {
    console.error("Error getting user found items:", error);
    throw error;
  }
};

export const updateFoundItem = async (itemId, itemData) => {
  try {
    const itemRef = doc(FIREBASE_DB, "foundItems", itemId);
    await updateDoc(itemRef, {
      ...itemData,
      updatedAt: new Date(),
      isClaimed: !!itemData.claimedBy // Ensure isClaimed is updated based on claimedBy
    });
    return true;
  } catch (error) {
    console.error("Error updating found item:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const usersRef = collection(FIREBASE_DB, "users");
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return users;
  } catch (error) {
    console.error("Error loading users:", error);
    throw error;
  }
};

export const getFoundItemById = async (itemId) => {
  try {
    const itemRef = doc(FIREBASE_DB, "foundItems", itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (itemDoc.exists()) {
      return {
        id: itemDoc.id,
        ...itemDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting found item:", error);
    throw error;
  }
};

export const deleteFoundItem = async (itemId) => {
  try {
    const itemRef = doc(FIREBASE_DB, "foundItems", itemId);
    await deleteDoc(itemRef);
    return true;
  } catch (error) {
    console.error("Error deleting found item:", error);
    throw error;
  }
};

export const getAllFoundItems = async () => {
  try {
    const foundItemsRef = collection(FIREBASE_DB, "foundItems");
    const q = query(
      foundItemsRef, 
      where("isClaimed", "==", false),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return items;
  } catch (error) {
    console.error("Error getting all found items:", error);
    throw error;
  }
};
