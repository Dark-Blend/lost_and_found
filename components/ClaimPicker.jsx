import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAllUsersExceptCurrent } from "../services/databaseService";

const ClaimPicker = ({ visible, onClose, onSelectUser, currentUserId, foundById, claimedBy }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsersExceptCurrent(currentUserId);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    if (!user) {
      onSelectUser(null);
      onClose();
      return;
    }

    if (user.id === foundById) {
      Alert.alert("Error", "You cannot claim an item you found.");
      return;
    }
    onSelectUser(user);
    onClose();
  };

  const handleDeselect = () => {
    handleSelectUser(null);
  };

  const renderHeader = () => {
    if (!currentUserId || !claimedBy) return null;

    return (
      <TouchableOpacity
        onPress={handleDeselect}
        className="p-4 border-b border-gray-200 flex-row items-center bg-red-50"
      >
        <View className="flex-1">
          <Text className="font-poppins-semibold text-lg text-red-600">
            Remove Claim
          </Text>
          <Text className="font-poppins text-red-500">
            Mark item as available
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-3/4 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-poppins-bold">Select User</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 font-poppins">Cancel</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            className="bg-gray-100 p-3 rounded-lg mb-4 font-poppins"
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              ListHeaderComponent={renderHeader}
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectUser(item)}
                  className={`p-4 border-b border-gray-200 flex-row items-center ${
                    item.id === currentUserId ? "bg-blue-50" : ""
                  }`}
                >
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-lg">
                      {item.username}
                    </Text>
                    <Text className="font-poppins text-gray-500">
                      {item.email}
                    </Text>
                  </View>
                  {item.id === currentUserId && (
                    <View className="bg-blue-500 px-2 py-1 rounded">
                      <Text className="text-white font-poppins">Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center p-4">
                  <Text className="text-gray-500 font-poppins">
                    No users found
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ClaimPicker;
