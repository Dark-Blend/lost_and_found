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
import { getFoundItemById, getUser, deleteFoundItem, checkMatchingFoundItems } from '../../services/databaseService';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '../../context/GlobalProvider';

const PostDetails = () => {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingItems, setMatchingItems] = useState([]);
  const router = useRouter();
  const { currentUser } = useGlobalContext();
  const [post, setPost] = useState(null);
  const [owner, setOwner] = useState(null);
  const [claimer, setClaimer] = useState(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const docRef = doc(FIREBASE_DB, 'foundItems', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const itemData = { id: docSnap.id, ...docSnap.data() };
          setItem(itemData);
          setPost(itemData);
          
          // If this is a lost item, check for matching found items
          if (itemData.type === 'lost') {
            const matches = await checkMatchingFoundItems(itemData);
            setMatchingItems(matches);
          }
        } else {
          Alert.alert('Error', 'Item not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading item:', error);
        Alert.alert('Error', 'Failed to load item');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadItem();
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

  const handleChat = () => {
    if (!post || !owner) {
      Alert.alert("Error", "Could not start chat at this time");
      return;
    }

    if (currentUser.uid === post.foundBy) {
      Alert.alert("Error", "You cannot chat with yourself");
      return;
    }

    // Navigate to chat screen with the finder's ID
    router.push(`/chat/${post.foundBy}`);
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
            post.status === 'claimed' ? 'bg-green-500' : 'bg-yellow-500'
          }`}>
            <Text className="text-white font-poppins capitalize">
              {post.status}
            </Text>
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

        <Text className="text-lg font-poppins-semibold mb-1">Found By</Text>
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: owner?.avatar }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-2">
            <Text className="font-poppins-semibold">{owner?.username}</Text>
            <Text className="font-poppins text-gray-500">{owner?.email}</Text>
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