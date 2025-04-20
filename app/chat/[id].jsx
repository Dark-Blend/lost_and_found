import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  getUser,
  sendMessage,
  getMessages,
} from "../../services/databaseService";
import { StatusBar } from "expo-status-bar";
import { icons } from "../../constants/icons";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

const ChatScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useGlobalContext();
  const [otherUser, setOtherUser] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();

  useEffect(() => {
    loadOtherUser();
    subscribeToMessages();
  }, [id]);

  const loadOtherUser = async () => {
    try {
      // First get the chat document to find the other user's ID
      const chatDoc = await getDoc(doc(FIREBASE_DB, "chats", id));
      if (!chatDoc.exists()) {
        console.error("Chat not found");
        return;
      }

      const chatData = chatDoc.data();
      // Get the other user's ID based on userId1 and userId2
      const otherUserId = chatData.userId1 === currentUser.uid 
        ? chatData.userId2 
        : chatData.userId1;
      setOtherUserId(otherUserId);

      // Get the other user's details
      const userData = await getUser(otherUserId);
      setOtherUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const messagesRef = collection(FIREBASE_DB, `chats/${id}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    return onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      setMessages(newMessages);

      // Scroll to bottom on new messages
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageBase64 = result.assets[0].base64;
        await sendMessage(currentUser.uid, otherUserId, '', imageBase64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(currentUser.uid, otherUserId, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-100"
    >
      <StatusBar hidden />

      {/* Header */}
      <View className="bg-white py-6  flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Image source={icons.back} className="w-6 h-6" />
        </TouchableOpacity>
        <Image
          source={{
            uri:
              otherUser?.avatar ||
              "https://ui-avatars.com/api/?name=U&background=8a524d&color=fff&format=png",
          }}
          className="w-10 h-10 rounded-full"
        />
        <View className="ml-3">
          <Text className="font-poppins-bold text-lg">
            {otherUser?.username || "User"}
          </Text>
          <Text className="font-poppins text-gray-500 text-sm">
            {otherUser?.email}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        <View className="mb-4 bg-white p-4 rounded-lg shadow-sm">
        
          <Text className="text-gray-500 font-poppins-light text-center text-xs leading-4">
            This chat is intended solely for discussing lost item details and arranging safe returns. For your security, avoid sharing personal information and always meet in public places. Report any suspicious behavior.
          </Text>
        </View>
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`mb-4 max-w-[80%] ${
              msg.senderId === currentUser.uid ? "self-end" : "self-start"
            }`}
          >
            <View
              className={`rounded-2xl p-3 ${
                msg.senderId === currentUser.uid
                  ? "bg-black rounded-tr-none"
                  : "bg-white rounded-tl-none"
              }`}
            >
              {msg.imageUrl ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${msg.imageUrl}` }}
                  className="w-48 h-48 rounded"
                  resizeMode="cover"
                />
              ) : (
                <Text
                  className={`font-poppins ${
                    msg.senderId === currentUser.uid ? "text-white" : "text-black"
                  }`}
                >
                  {msg.text}
                </Text>
              )}
            </View>
            <Text className="text-xs text-gray-500 mt-1 font-poppins">
              {msg.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleImagePick}
            className="p-2 mr-2 bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center"
          >
            <Text className="font-poppins text-lg">📷</Text>
          </TouchableOpacity>
          <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              className="font-poppins"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim()}
            className={`rounded-full p-2 ${
              message.trim() ? "bg-black" : "bg-gray-300"
            }`}
          >
            <Image
              source={icons.paperplane}
              className="w-12 h-12"
              tintColor="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
