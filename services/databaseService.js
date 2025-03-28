import { FIREBASE_DB } from "../firebaseConfig";
import { collection, setDoc, doc, getDoc, updateDoc, getDocs, query, orderBy, limit, where, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";

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

// Chat functions
export const sendMessage = async (senderId, receiverId, message) => {
  try {
    const chatId = [senderId, receiverId].sort().join('_');
    
    // First, ensure the chat document exists
    const chatDocRef = doc(FIREBASE_DB, 'chats', chatId);
    const chatDoc = await getDoc(chatDocRef);
    
    if (!chatDoc.exists()) {
      // Create the chat document if it doesn't exist
      await setDoc(chatDocRef, {
        participants: [senderId, receiverId],
        createdAt: serverTimestamp(),
        lastMessage: message,
        lastMessageTime: serverTimestamp()
      });
    } else {
      // Update the last message
      await updateDoc(chatDocRef, {
        lastMessage: message,
        lastMessageTime: serverTimestamp()
      });
    }

    // Add the message to the messages subcollection
    const messageData = {
      senderId,
      text: message,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(FIREBASE_DB, `chats/${chatId}/messages`), messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (userId1, userId2) => {
  try {
    const chatId = [userId1, userId2].sort().join('_');
    const messagesRef = collection(FIREBASE_DB, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    // Query chats where the user is a participant
    const chatsRef = collection(FIREBASE_DB, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const userChats = [];

    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      // Find the other participant's ID
      const otherUserId = chatData.participants.find(id => id !== userId);
      
      // Get the other user's details
      const otherUser = await getUser(otherUserId);
      
      if (otherUser) {
        userChats.push({
          id: doc.id,
          otherUser,
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime?.toDate(),
        });
      }
    }

    return userChats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};
