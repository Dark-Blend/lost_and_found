import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';
import ClaimPicker from './ClaimPicker';

const PostCard = ({ item, onUpdateStatus }) => {
  const { currentUser } = useGlobalContext();
  const router = useRouter();
  const [showClaimPicker, setShowClaimPicker] = useState(false);

  const handleStatusUpdate = (userId = null) => {
    const updatedStatus = userId ? 'claimed' : 'available';
    onUpdateStatus(item.id, {
      ...item,
      claimedBy: userId,
      isClaimed: !!userId,
      status: updatedStatus
    });
    setShowClaimPicker(false);
  };

  return (
    <TouchableOpacity 
      className="w-[360px] max-h-[320px] bg-white rounded-lg shadow-md m-2 overflow-hidden"
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
            {item.type === 'found' && (
              <>
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
              </>
            )}
          </View>
        </View>
      </View>

      {showClaimPicker && (
        <ClaimPicker
          visible={showClaimPicker}
          onClose={() => setShowClaimPicker(false)}
          onSelectUser={(user) => handleStatusUpdate(user?.id)}
          currentUserId={currentUser?.uid}
          foundById={item.userId}
          claimedBy={item.claimedBy}
        />
      )}
    </TouchableOpacity>
  );
};

export default PostCard;