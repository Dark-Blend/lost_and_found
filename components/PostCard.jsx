import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ClaimPicker from './ClaimPicker';
import { addKarma } from '../services/databaseService';

const PostCard = ({ item, onUpdateStatus }) => {
  const router = useRouter();
  const [showClaimPicker, setShowClaimPicker] = useState(false);

  const handleStatusUpdate = async (userId = null) => {
    const updatedStatus = userId ? 'claimed' : 'available';
    
    try {
      // Update the item status first
      await onUpdateStatus(item.id, {
        ...item,
        claimedBy: userId,
        isClaimed: !!userId,
        status: updatedStatus
      });

      // Handle karma updates
      if (userId) {
        // Item is being claimed, add karma to the finder
        await addKarma(
          item.foundBy,
          50,
          `Item "${item.itemName}" was claimed`
        );
      } else if (item.claimedBy) {
        // Item is being unclaimed, remove karma from the finder
        await addKarma(
          item.foundBy,
          -50,
          `Claim removed for item "${item.itemName}"`
        );
      }

      setShowClaimPicker(false);
    } catch (error) {
      console.error('Error updating status and karma:', error);
      // You might want to show an alert here
    }
  };

  return (
    <TouchableOpacity 
      className="w-[350px] max-h-[350px]  bg-white rounded-lg shadow-md m-2 overflow-hidden"
      onPress={() => router.push(`/post/${item.id}`)}
    >
      <Image 
        source={{ uri: `data:image/jpeg;base64,${item.images[0]}` }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-poppins-bold mb-2">{item.itemName}</Text>
        <Text className="text-gray-600 font-poppins mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-gray-500 font-poppins-light">
            {new Date(item.createdAt.toDate()).toLocaleDateString()}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowClaimPicker(true)}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              <Text className="text-white font-poppins">
                {item.claimedBy ? 'Update Claim' : 'Claim'}
              </Text>
            </TouchableOpacity>
            <View className={`px-3 py-1 rounded ${
              item.isClaimed ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              <Text className="text-white font-poppins capitalize">
                {item.isClaimed ? 'claimed' : 'available'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {showClaimPicker && (
        <ClaimPicker
          visible={showClaimPicker}
          onClose={() => setShowClaimPicker(false)}
          onSelectUser={(user) => handleStatusUpdate(user?.id)}
          currentUserId={item.claimedBy}
          foundById={item.foundBy}
        />
      )}
    </TouchableOpacity>
  );
};

export default PostCard;