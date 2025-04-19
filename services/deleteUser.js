import { FIREBASE_DB } from "../firebaseConfig";
import { collection, doc, getDocs, query, where, deleteDoc, writeBatch } from "firebase/firestore";

export const deleteUser = async (userId) => {
  try {
    const batch = writeBatch(FIREBASE_DB);
    const collectionsToCheck = [
      { name: 'karma', field: 'userId' },
      { name: 'notifications', field: 'userId' },
      { name: 'foundItems', field: 'userId' },
      { name: 'lostItems', field: 'userId' },
      { name: 'chats', field: 'participants', operator: 'array-contains' },
      { name: 'comments', field: 'userId' },
      { name: 'likes', field: 'userId' },
      { name: 'reports', field: 'userId' },
      { name: 'bookmarks', field: 'userId' },
    ];

    // Delete documents from each collection
    for (const collection_info of collectionsToCheck) {
      const collectionRef = collection(FIREBASE_DB, collection_info.name);
      const q = query(
        collectionRef, 
        where(
          collection_info.field, 
          collection_info.operator || '==', 
          userId
        )
      );
      const snapshot = await getDocs(q);

      // For chats, we need to delete subcollections (messages)
      if (collection_info.name === 'chats') {
        for (const chatDoc of snapshot.docs) {
          const messagesRef = collection(FIREBASE_DB, `chats/${chatDoc.id}/messages`);
          const messagesSnapshot = await getDocs(messagesRef);
          messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
          batch.delete(chatDoc.ref);
        }
      } else {
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
      }
    }

    // Delete user document
    const userRef = doc(FIREBASE_DB, 'users', userId);
    batch.delete(userRef);

    // Commit all deletions in a single batch
    await batch.commit();

  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
