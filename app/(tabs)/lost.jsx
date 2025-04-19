import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { getLostItems } from '../../services/databaseService';
import ItemCard from '../../components/ItemCard';

const Lost = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLostItems();
  }, []);

  const loadLostItems = async () => {
    try {
      setLoading(true);
      const lostItems = await getLostItems();
      setItems(lostItems);
    } catch (error) {
      console.error('Error loading lost items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLostItems();
  };

  const handleItemPress = (item) => {
    router.push(`/post/${item.id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      <View className="p-4 border-b border-gray-100">
        <Text className="font-poppins-bold text-2xl">Lost Items</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => handleItemPress(item)}
          />
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <View className="p-5 items-center">
            <Text className="text-base text-gray-600">No lost items found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Lost;
