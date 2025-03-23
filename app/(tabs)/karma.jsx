import { View, Text, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { getKarmaLeaderboard } from '../../services/databaseService';
import { useGlobalContext } from '../../context/GlobalProvider';

const KarmaItem = ({ item }) => (
  <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
    <View className="flex-row items-center gap-3">
      <Image
        source={{ uri: item.userAvatar }}
        className="w-12 h-12 rounded-full"
      />
      <View>
        <Text className="font-poppins-semibold text-lg">{item.username}</Text>
        <Text className="font-poppins text-gray-500">{item.reason}</Text>
        <Text className="font-poppins-light text-xs text-gray-400">
          {new Date(item.timestamp.toDate()).toLocaleDateString()}
        </Text>
      </View>
    </View>
    <Text className={`font-poppins-bold text-xl ${item.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
      {item.amount > 0 ? '+' : ''}{item.amount}
    </Text>
  </View>
);

const Karma = () => {
  const [karmaList, setKarmaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser } = useGlobalContext();

  const loadKarma = async () => {
    try {
      const karma = await getKarmaLeaderboard();
      setKarmaList(karma);
    } catch (error) {
      console.error('Error loading karma:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadKarma();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadKarma();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <View className="p-4 border-b border-gray-200">
        <Text className="font-poppins-bold text-2xl">Karma Leaderboard</Text>
        <Text className="font-poppins-light text-gray-500">
          See who's been helping the community
        </Text>
      </View>
      <FlatList
        data={karmaList}
        renderItem={({ item }) => <KarmaItem item={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-4">
            <Text className="font-poppins-light text-gray-500">No karma records yet</Text>
          </View>
        }
      />
    </View>
  );
};

export default Karma;