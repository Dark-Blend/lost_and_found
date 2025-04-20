import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPost, getUser, getClaimedItemDetails, claimPost, unclaimPost } from '../../services/databaseService';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '../../context/GlobalProvider';
import { FIREBASE_DB } from '../../firebaseConfig';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';

const PostDetails = () => {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingItems, setMatchingItems] = useState([]);
  const router = useRouter();
  const { currentUser } = useGlobalContext();
  const [post, setPost] = useState(null);
  const [owner, setOwner] = useState(null);
  const [claimedDetails, setClaimedDetails] = useState(null);
  const [claimer, setClaimer] = useState(null);

  const loadPostDetails = async () => {
    try {
      const postData = await getPost(id);
      if (!postData) {
        Alert.alert("Error", "Post not found");
        router.back();
        return;
      }
      setPost(postData);

      // Load owner details
      const ownerData = await getUser(postData.foundBy);
      if (ownerData) {
        setOwner(ownerData);
      }

      // Load claimed item details if post is claimed
      if (postData.isClaimed) {
        const claimedData = await getClaimedItemDetails(id);
        if (claimedData) {
          setClaimedDetails(claimedData);
        }
      }
    } catch (error) {
      console.error("Error loading post details:", error);
      Alert.alert("Error", "Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPostDetails();
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFoundItem(id);
              Alert.alert("Success", "Post deleted successfully");
              router.back();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert("Error", "Failed to delete post");
            }
          }
        }
      ]
    );
  };

  const handleChat = async () => {
    if (!post || !owner) {
      Alert.alert("Error", "Could not start chat at this time");
      return;
    }

    if (currentUser.uid === post.foundBy) {
      Alert.alert("Error", "You cannot chat with yourself");
      return;
    }

    try {
      // Create chat ID by combining and sorting both user IDs
      const chatId = [currentUser.uid, post.foundBy].sort().join('_');
      
      // Create or get the chat document
      const chatDocRef = doc(FIREBASE_DB, 'chats', chatId);
      const chatDoc = await getDoc(chatDocRef);
      
      if (!chatDoc.exists()) {
        // Create the chat document if it doesn't exist
        await setDoc(chatDocRef, {
          participants: [currentUser.uid, post.foundBy],
          createdAt: serverTimestamp(),
          lastMessage: '',
          lastMessageTime: serverTimestamp()
        });
      }
      
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert("Error", "Failed to create chat");
    }
  };

  const handleContact = () => {
    // Implement contact logic here
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl font-poppins">Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <StatusBar hidden />
      
      {/* Images */}
      <ScrollView horizontal pagingEnabled className="h-72">
        {post.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: `data:image/jpeg;base64,${image}` }}
            className="w-screen h-72"
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Content */}
      <View className="flex-1 h-[76vh]  justify-between p-4">
      <View className="">
        <Text className="text-3xl font-poppins-bold mb-2">{post.itemName}</Text>
        
        <View className="flex-row items-center mb-4">
          <View className={`px-3 py-1 rounded ${
            post.isClaimed ? 'bg-green-500' : 'bg-yellow-500'
          }`}>
            <Text className="text-white font-poppins capitalize">
              {post.isClaimed ? 'Claimed' : 'Available'}
            </Text>
            {post.isClaimed && claimedDetails && (
              <Text className="text-xs text-white font-poppins-light">
                {new Date(claimedDetails.claimedAt.toDate()).toLocaleString()}
              </Text>
            )}
          </View>
          <Text className="text-gray-500 font-poppins-light ml-2">
            {new Date(post.createdAt.toDate()).toLocaleString()}
          </Text>
        </View>

        <Text className="text-lg font-poppins-semibold mb-1">Description</Text>
        <Text className="text-gray-600 font-poppins mb-4">{post.description}</Text>

        <Text className="text-lg font-poppins-semibold mb-1">Categories</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {post.categories.map((category, index) => (
            <View key={index} className="bg-gray-200 px-3 py-1 rounded">
              <Text className="font-poppins">{category}</Text>
            </View>
          ))}
        </View>

        <Text className="text-lg font-poppins-semibold mb-1">{post.type === 'found' ? 'Found By' : 'Lost By'}</Text>
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: owner?.avatar || 'https://via.placeholder.com/100' }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-2">
            <Text className="font-poppins-semibold">{owner?.username || 'Unknown User'}</Text>
            <Text className="font-poppins text-gray-500">{owner?.email || ''}</Text>
          </View>
        </View>

        {claimer && (
          <>
            <Text className="text-lg font-poppins-semibold mb-1">Claimed By</Text>
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: claimer.avatar }}
                className="w-10 h-10 rounded-full"
              />
              <View className="ml-2">
                <Text className="font-poppins-semibold">{claimer.username}</Text>
                <Text className="font-poppins text-gray-500">{claimer.email}</Text>
              </View>
            </View>
          </>
        )}
      </View>

        {/* Action Button */}
        <View className=''>
        {currentUser?.uid === post.foundBy ? (
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-red-500 px-4 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-poppins-semibold text-center">
              Delete Post
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleChat}
            className="bg-black px-4 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-poppins-semibold text-center">
              Chat with Finder
            </Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    </ScrollView>
  );
};

export default PostDetails; 