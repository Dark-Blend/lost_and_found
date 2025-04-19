import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from "react-native";
import React, { useState } from "react";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useRouter } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import FoundItemForm from "../../components/FoundItemForm";
import LostItemForm from "../../components/LostItemForm";

const Add = () => {
  const { currentUser } = useGlobalContext();
  const router = useRouter();
  const [itemType, setItemType] = useState('found');

  const handleSuccess = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between mb-5">
          <TouchableOpacity 
            className={`flex-1 py-3 px-6 rounded-lg mx-1 ${itemType === 'found' ? 'bg-black' : 'bg-gray-100'}`}
            onPress={() => setItemType('found')}
          >
            <Text className={`text-center text-base ${itemType === 'found' ? 'text-white' : 'text-black'}`}>Found Item</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 px-6 rounded-lg mx-1 ${itemType === 'lost' ? 'bg-black' : 'bg-gray-100'}`}
            onPress={() => setItemType('lost')}
          >
            <Text className={`text-center text-base ${itemType === 'lost' ? 'text-white' : 'text-black'}`}>Lost Item</Text>
          </TouchableOpacity>
        </View>
        {itemType === 'found' ? (
          <FoundItemForm
            onSuccess={handleSuccess}
            userId={currentUser?.uid || ""}
            foundBy={currentUser?.username || "Anonymous"}
          />
        ) : (
          <LostItemForm
            onSuccess={handleSuccess}
            userId={currentUser?.uid || ""}
            userName={currentUser?.username || "Anonymous"}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Add;
  