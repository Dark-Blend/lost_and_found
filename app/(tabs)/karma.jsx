import { View, Text, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { getKarmaLeaderboard, getUserStats } from '../../services/databaseService';
import { useGlobalContext } from '../../context/GlobalProvider';

const LeaderboardItem = ({ item, currentUserId }) => (
  <View className={`flex-row items-center p-4 border-b border-gray-100 ${item.id === currentUserId ? 'bg-blue-50' : ''}`}>
    <Text className="font-poppins-bold text-lg w-10 text-gray-500">#{item.rank}</Text>
    <View className="flex-row flex-1 items-center gap-3">
      <Image
        source={{ uri: item.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.username) }}
        className="w-12 h-12 rounded-full bg-gray-200"
      />
      <View className="flex-1">
        <Text className="font-poppins-semibold text-lg">{item.username}</Text>
        <Text className="font-poppins-light text-sm text-gray-500">
          Found: {item.foundItems} · Returned: {item.returnedItems}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-poppins-bold text-xl text-blue-500">{item.totalKarma}</Text>
        <Text className="font-poppins-light text-xs text-gray-400">karma points</Text>
      </View>
    </View>
  </View>
);

const Karma = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser } = useGlobalContext();

  const loadLeaderboard = async () => {
    try {
      const data = await getKarmaLeaderboard();
      // Log the leaderboard data for debugging
      console.log('Leaderboard data:', data);
      
      // Fetch user stats for each user
      const usersWithStats = await Promise.all(
        data.map(async (user) => {
          const stats = await getUserStats(user.id);
          return {
            ...user,
            foundItems: stats.foundItems,
            returnedItems: stats.returnedItems
          };
        })
      );
      
      setLeaderboard(usersWithStats);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const userRank = leaderboard.find(item => item.id === currentUser?.uid)?.rank;

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <View className="p-4 border-b border-gray-200">
        <Text className="font-poppins-bold text-2xl">Karma Leaderboard</Text>
        <Text className="font-poppins-light text-gray-500">
          Your rank: #{userRank || 'N/A'}
        </Text>
      </View>
      <FlatList
        data={leaderboard}
        renderItem={({ item }) => (
          <LeaderboardItem 
            item={item} 
            currentUserId={currentUser?.id}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-4">
            <Text className="font-poppins-light text-gray-500">No users yet</Text>
          </View>
        }
      />
    </View>
  );
};

export default Karma;