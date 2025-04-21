import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { getLostItems, getClaimedItems } from '../../services/databaseService';
import ItemCard from '../../components/ItemCard';

const Lost = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lost');
  const router = useRouter();

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const fetchedItems = activeTab === 'lost' 
        ? await getLostItems() 
        : await getClaimedItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error(`Error loading ${activeTab} items:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadItems();
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
      <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="font-poppins-bold text-2xl">
          {activeTab === 'lost' ? 'Lost Items' : 'Claimed Items'}
        </Text>
        <View className="flex-row bg-gray-100 rounded-full p-1">
          <TouchableOpacity 
            onPress={() => setActiveTab('lost')}
            className={`px-4 py-2 rounded-full ${activeTab === 'lost' ? 'bg-blue-500' : 'bg-transparent'}`}
          >
            <Text className={`${activeTab === 'lost' ? 'text-white' : 'text-gray-600'}`}>Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('claimed')}
            className={`px-4 py-2 rounded-full ${activeTab === 'claimed' ? 'bg-blue-500' : 'bg-transparent'}`}
          >
            <Text className={`${activeTab === 'claimed' ? 'text-white' : 'text-gray-600'}`}>Claimed</Text>
          </TouchableOpacity>
        </View>
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
            <Text className="text-base text-gray-600">
              {activeTab === 'lost' 
                ? 'No lost items found' 
                : 'No claimed items found'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Lost;
