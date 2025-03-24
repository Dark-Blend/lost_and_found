import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../../context/GlobalProvider';
import { getUserChats } from '../../services/databaseService';
import { StatusBar } from 'expo-status-bar';

const ChatListScreen = () => {
  const router = useRouter();
  const { currentUser } = useGlobalContext();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const userChats = await getUserChats(currentUser.uid);
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If message is from today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // If message is from this year, show date without year
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    // Otherwise show full date
    return messageDate.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${item.id}`)}
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
    >
      <Image
        source={{
          uri: item.otherUser.avatar || 'https://ui-avatars.com/api/?name=U&background=8a524d&color=fff&format=png'
        }}
        className="w-12 h-12 rounded-full"
      />
      <View className="ml-4 flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="font-poppins-bold text-lg">{item.otherUser.username}</Text>
          {item.lastMessageTime && (
            <Text className="text-gray-500 text-xs font-poppins">
              {formatTime(item.lastMessageTime)}
            </Text>
          )}
        </View>
        {item.lastMessage && (
          <Text className="font-poppins text-gray-500 mt-1" numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="font-poppins-bold text-2xl">Messages</Text>
      </View>

      {chats.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="font-poppins text-gray-500 text-center">
            No conversations yet.{'\n'}Start chatting with someone!
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
};

export default ChatListScreen;
