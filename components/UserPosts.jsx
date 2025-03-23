import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  getUserFoundItems,
  updateFoundItem,
} from "../services/databaseService";
import PostCard from "./PostCard";

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    try {
      setError(null);
      const items = await getUserFoundItems(userId);
      setPosts(items);
    } catch (error) {
      console.error("Error loading posts:", error);
      if (error.message.includes("requires an index")) {
        setError("Building search index... Please try again in a few minutes.");
      } else {
        setError("Failed to load posts. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [userId]);

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      await updateFoundItem(postId, updatedData);
      await loadPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Error", "Failed to update post. Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 font-poppins text-center">
          {error || "No posts yet"}
        </Text>
        {error && (
          <TouchableOpacity
            onPress={loadPosts}
            className="mt-4 bg-blue-500 px-4 py-2 rounded"
          >
            <Text className="text-white font-poppins">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 flex">
      <Text className="text-xl font-poppins-semibold px-6">Posts</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {posts.map((item) => (
          <PostCard
            key={item.id}
            item={item}
            onUpdateStatus={handleUpdatePost}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default UserPosts;
