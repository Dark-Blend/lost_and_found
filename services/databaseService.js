import { FIREBASE_DB } from "../firebaseConfig";
import { collection, setDoc, doc, getDoc, updateDoc, getDocs, query, orderBy, limit, where, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";

// Fetch a post by ID from foundItems or lostItems
export const getPost = async (postId) => {
  if (!postId) {
    throw new Error("Post ID is required");
  }

  try {
    // Try foundItems first
    let docRef = doc(FIREBASE_DB, "foundItems", postId);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        type: 'found',
        userId: data.userId // Ensure userId is always available
      };
    }
    // Try lostItems
    docRef = doc(FIREBASE_DB, "lostItems", postId);
    docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        type: 'lost',
        userId: data.userId // Ensure userId is always available
      };
    }
    throw new Error("Post not found");
  } catch (error) {
    console.error('Error in getPost:', error);
    throw error;
  }
};

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
    const userRef = doc(FIREBASE_DB, "users", userId);
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
    const foundItemsRef = collection(FIREBASE_DB, 'foundItems');
    const newItemRef = doc(foundItemsRef);
    const itemId = newItemRef.id;

    // Extract base64 data from the images
    const base64Images = itemData.images.map(image => image.base64);

    // Add the item to Firestore with base64 images and userId
    await setDoc(newItemRef, {
      ...itemData,
      id: itemId,
      images: base64Images,
      type: 'found',
      createdAt: new Date(),
      isClaimed: false
    });
    
    // Check for matching lost items and create notifications
    const lostItemsRef = collection(FIREBASE_DB, 'lostItems');
    const q = query(lostItemsRef, 
      where('isClaimed', '==', false),
      where('categories', 'array-contains-any', itemData.categories)
    );
    const querySnapshot = await getDocs(q);
    
    const notificationPromises = querySnapshot.docs.map(async (doc) => {
      const lostItem = doc.data();
      try {
        // If location is available, check distance
        if (itemData.location && lostItem.location) {
          const distance = calculateDistance(
            itemData.location.latitude,
            itemData.location.longitude,
            lostItem.location.latitude,
            lostItem.location.longitude
          );
          // If within 1km, create notification
          if (distance <= 1) {
            await createNotification(lostItem.userId, {
              type: 'match',
              title: 'Potential Match Found',
              message: `A found item matches your lost item description: ${itemData.itemName}`,
              itemId: itemId,
              read: false,
              createdAt: new Date()
            });
          }
        } else {
          // If no location, create notification based on category match
          await createNotification(lostItem.userId, {
            type: 'match',
            title: 'Potential Match Found',
            message: `A found item matches your lost item description: ${itemData.itemName}`,
            itemId: itemId,
            read: false,
            createdAt: new Date()
          });
        }
      } catch (notifErr) {
        console.error('[Notification Error]', {
          userId: lostItem.userId,
          notificationData: {
            type: 'match',
            title: 'Potential Match Found',
            message: `A found item matches your lost item description: ${itemData.itemName}`,
            itemId: itemId,
            read: false,
            createdAt: new Date()
          },
          error: notifErr && notifErr.message ? notifErr.message : notifErr
        });
        if (notifErr && notifErr.code) {
          console.error('[Notification Firestore Error Code]', notifErr.code);
        }
        throw notifErr;
      }
    });
    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);
    
    return itemId;
  } catch (error) {
    console.error('Error adding found item:', error);
    throw error;
  }
};

export const createNotification = async (userId, data) => {
  try {
    const notificationsRef = collection(FIREBASE_DB, 'notifications');
    await addDoc(notificationsRef, {
      userId,
      ...data,
      createdAt: new Date(),
      read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getNotifications = async (userId) => {
  try {
    const notificationsRef = collection(FIREBASE_DB, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// getClaimedItemDetails removed: now claim info is stored directly on foundItems

export const markNotificationAsRead = async (notificationId, postId, claimedBy) => {
  try {
    if (!notificationId || !postId || !claimedBy) {
      throw new Error('Invalid parameters provided');
    }

    const notificationRef = doc(FIREBASE_DB, 'notifications', notificationId);
    const postRef = doc(FIREBASE_DB, 'foundItems', postId);

    // First check if notification exists
    const notificationSnap = await getDoc(notificationRef);
    if (!notificationSnap.exists()) {
      console.warn('Notification not found:', notificationId);
      return;
    }

    // Update post status: claim directly on foundItems
    await updateDoc(postRef, {
      isClaimed: true,
      claimedBy: claimedBy,
      claimedAt: serverTimestamp()
    });

    // Update notification as read
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const addLostItem = async (itemData) => {
  try {
    const lostItemsRef = collection(FIREBASE_DB, "lostItems");
    const newItemRef = doc(lostItemsRef);
    const itemId = newItemRef.id;

    // Extract base64 data from the images
    const base64Images = itemData.images.map(image => image.base64);

    // Add the item to Firestore with base64 images and userId
    await setDoc(newItemRef, {
      ...itemData,
      id: itemId,
      images: base64Images,
      type: 'lost',
      createdAt: new Date(),
      isClaimed: false
    });
    
    return itemId;
  } catch (error) {
    console.error("Error adding lost item:", error);
    throw error;
  }
};

export const getLostItems = async () => {
  try {
    const lostItemsRef = collection(FIREBASE_DB, "lostItems");
    const q = query(
      lostItemsRef,
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
    console.error("Error getting lost items:", error);
    throw error;
  }
};

export const checkMatchingFoundItems = async (lostItem) => {
  try {
    const itemsRef = collection(FIREBASE_DB, "foundItems");
    const q = query(itemsRef, 
      where("type", "==", "found"),
      where("categories", "array-contains-any", lostItem.categories)
    );
    const querySnapshot = await getDocs(q);
    
    const matchingItems = [];
    querySnapshot.forEach((doc) => {
      const foundItem = {
        id: doc.id,
        ...doc.data()
      };
      
      // Check if location is within reasonable distance if both items have location
      if (lostItem.location?.latitude && foundItem.location?.latitude) {
        const distance = calculateDistance(
          lostItem.location.latitude,
          lostItem.location.longitude,
          foundItem.location.latitude,
          foundItem.location.longitude
        );
        
        // If within 1km, consider it a potential match
        if (distance <= 1) {
          matchingItems.push(foundItem);
        }
      } else {
        // If no location, just add it as a category match
        matchingItems.push(foundItem);
      }
    });
    
    return matchingItems;
  } catch (error) {
    console.error("Error checking matching items:", error);
    throw error;
  }
};

// Helper function to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

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
    const karmaRef = doc(FIREBASE_DB, "karma", userId);
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
    // First get all users
    const usersRef = collection(FIREBASE_DB, "users");
    const usersSnapshot = await getDocs(usersRef);
    const users = {};
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users[doc.id] = {
        id: doc.id,
        username: userData.username,
        avatar: userData.avatar,
        totalKarma: 0,
        foundItems: 0,
        returnedItems: 0
      };
    });

    // Get all karma transactions
    const karmaRef = collection(FIREBASE_DB, "karma");
    const karmaSnapshot = await getDocs(karmaRef);
    
    // Aggregate karma for each user
    karmaSnapshot.forEach((doc) => {
      const karma = doc.data();
      if (users[karma.userId]) {
        users[karma.userId].totalKarma += karma.amount;
        if (karma.reason.includes('found')) {
          users[karma.userId].foundItems++;
        } else if (karma.reason.includes('returned')) {
          users[karma.userId].returnedItems++;
        }
      }
    });

    // Convert to array and sort by total karma
    const leaderboard = Object.values(users)
      .sort((a, b) => b.totalKarma - a.totalKarma)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    
    return leaderboard;
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

export const getUserLostItems = async (userId) => {
  try {
    if (!userId) {
      console.log('No user ID provided for lost items query');
      return [];
    }
    
    const lostItemsRef = collection(FIREBASE_DB, 'lostItems');
    const q = query(lostItemsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
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
    console.error('Error getting user lost items:', error);
    throw error;
  }
};

export const getUserFoundItems = async (userId) => {
  try {
    if (!userId) {
      console.log('No user ID provided for found items query');
      return [];
    }
    
    const foundItemsRef = collection(FIREBASE_DB, 'foundItems');
    const q = query(foundItemsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
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
    console.error('Error getting user found items:', error);
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

export const getAllUsersExceptCurrent = async (currentUserId) => {
  try {
    const usersRef = collection(FIREBASE_DB, "users");
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data()
      };
      // Only add users who are not the current user
      if (userData.id !== currentUserId) {
        users.push(userData);
      }
    });
    return users;
  } catch (error) {
    console.error("Error loading users:", error);
    throw error;
  }
};

export const createChat = async (userId1, userId2, postId) => {
  try {
    if (!userId1 || !userId2 || !postId) {
      throw new Error('Invalid parameters provided');
    }

    // Sort user IDs to create consistent chat ID
    const sortedIds = [userId1, userId2].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;

    const chatRef = doc(FIREBASE_DB, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      // Chat already exists, just return the ID
      return chatId;
    }

    // Create new chat
    await setDoc(chatRef, {
      userId1,
      userId2,
      postId,
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTimestamp: null
    });

    return chatId;
  } catch (error) {
    console.error('Error creating chat:', error);
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
      const data = doc.data();
      // Only include items that have valid location data
      if (data.location && data.location.latitude && data.location.longitude) {
        items.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return items;
  } catch (error) {
    console.error("Error getting all found items:", error);
    throw error;
  }
};

// Chat functions
export const sendMessage = async (senderId, receiverId, message, imageBase64 = null) => {
  try {
    // Sort user IDs to create consistent chat ID
    const sortedIds = [senderId, receiverId].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
    
    // Create last message preview
    const lastMessagePreview = imageBase64 ? '📷 Image' : message;

    // First, ensure the chat document exists
    const chatDocRef = doc(FIREBASE_DB, 'chats', chatId);
    const chatDoc = await getDoc(chatDocRef);
    
    if (!chatDoc.exists()) {
      // Create the chat document if it doesn't exist
      await setDoc(chatDocRef, {
        userId1: sortedIds[0],
        userId2: sortedIds[1],
        createdAt: serverTimestamp(),
        lastMessage: lastMessagePreview,
        lastMessageTime: serverTimestamp()
      });
    } else {
      // Update the last message
      await updateDoc(chatDocRef, {
        lastMessage: lastMessagePreview,
        lastMessageTime: serverTimestamp()
      });
    }

    // Add the message to the messages subcollection
    const messageData = {
      senderId,
      text: message,
      createdAt: serverTimestamp(),
      ...(imageBase64 && { imageUrl: imageBase64 })
    };

    await addDoc(collection(FIREBASE_DB, `chats/${chatId}/messages`), messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (chatId) => {
  try {
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
    // Query chats where the user is either userId1 or userId2
    const chatsRef = collection(FIREBASE_DB, 'chats');
    const q = query(
      chatsRef,
      where('userId1', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const querySnapshot1 = await getDocs(q);
    
    // Query for userId2
    const q2 = query(
      chatsRef,
      where('userId2', '==', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const querySnapshot2 = await getDocs(q2);
    
    // Combine both query results
    const allDocs = [...querySnapshot1.docs, ...querySnapshot2.docs];
    const userChats = [];
    
    // Process all documents
    for (const doc of allDocs) {
      const chatData = doc.data();
      // Get the other user's ID based on userId1 and userId2
      const otherUserId = chatData.userId1 === userId 
        ? chatData.userId2 
        : chatData.userId1;
      
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
