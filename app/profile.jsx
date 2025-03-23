import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { getUser, updateUser } from "../services/databaseService";
import { SignOut } from "../services/authService";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { icons } from "../constants/icons";
import UserPosts from "../components/UserPosts";

const ProfileHeader = ({
  username,
  email,
  avatar,
  lastEdited,
  bio,
  isEditingUsername,
  setIsEditingUsername,
  setUsername,
  handleUpdateUsername,
  handleImagePick,
  setBio,
  handleUpdateBio,
}) => (
  <View className="bg-white px-5 pt-10">
    <View className="items-center mb-6">
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={{
            uri:
              avatar ||
              "https://ui-avatars.com/api/?name=A&background=8a524d&color=fff&format=png ",
          }}
          className="w-32 h-32 rounded-full border-4 border-gray-200"
          resizeMode="cover"
        />
      </TouchableOpacity>

      <View className="mt-2 flex flex-col items-center">
        <View className="flex flex-row items-center gap-2">
          {isEditingUsername ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                value={username}
                onChangeText={setUsername}
                className="text-gray-500 text-3xl font-poppins-bold text-center border-b border-gray-300 px-2"
                autoFocus
                onSubmitEditing={handleUpdateUsername}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
          ) : (
            <>
              <Text className="text-gray-500 text-3xl font-poppins-bold">
                {username || "User"}
              </Text>
              <TouchableOpacity onPress={() => setIsEditingUsername(true)}>
                <Image source={icons.edit} className="w-4 h-4" />
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text className="text-gray-500">{email}</Text>
        <Text className="text-xs text-gray-400 mt-1">
          Last edited: {lastEdited}
        </Text>
      </View>
    </View>

    <View className="mb-6">
      <Text className="text-lg font-poppins-semibold mb-2">Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        className="bg-white p-3 rounded border-b border-gray-300"
        multiline={true}
        numberOfLines={4}
        placeholder="Write something about yourself..."
        onEndEditing={() => handleUpdateBio(bio)}
        blurOnSubmit={true}
        returnKeyType="done"
      />
    </View>
  </View>
);

const Profile = () => {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useGlobalContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      // If no current user, redirect to signin
      router.replace("/signin");
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const userData = await getUser(currentUser.uid);
      if (userData) {
        setUser(userData);
        setBio(userData.bio || "");
        setAvatar(userData.avatar);
        setUsername(userData.username || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setAvatar(base64Image);
        handleUpdateAvatar(base64Image);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleUpdateAvatar = async (base64Image) => {
    try {
      const updatedUserData = {
        ...user,
        avatar: base64Image,
        editedAt: new Date().toISOString(),
      };

      await updateUser(currentUser.uid, updatedUserData);
      setUser(updatedUserData);
      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating avatar:", error);
      Alert.alert("Error", "Failed to update avatar");
    }
  };

  const handleUpdateBio = async (newBio) => {
    try {
      setBio(newBio);
      const updatedUserData = {
        ...user,
        bio: newBio,
        editedAt: new Date().toISOString(),
      };

      await updateUser(currentUser.uid, updatedUserData);
      setUser(updatedUserData);
    } catch (error) {
      console.error("Error updating bio:", error);
      Alert.alert("Error", "Failed to update bio");
    }
  };

  const handleUpdateUsername = async () => {
    try {
      const updatedUserData = {
        ...user,
        username,
        editedAt: new Date().toISOString(),
      };

      await updateUser(currentUser.uid, updatedUserData);
      setUser(updatedUserData);
      setIsEditingUsername(false);
      Alert.alert("Success", "Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert("Error", "Failed to update username");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            setLoading(true); // Show loading state while logging out
            await SignOut();
            // Only clear states and redirect after successful logout
            setUser(null);
            setCurrentUser(null);
            router.replace("/signin");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert(
              "Error",
              "Failed to sign out. Please try again."
            );
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!currentUser || !user) {
    return null; // Will redirect due to useEffect
  }

  const lastEdited = user?.editedAt
    ? new Date(user.editedAt).toLocaleString()
    : "Not edited yet";

  return (
    <View className="flex-1 flex justify-between">
      <StatusBar hidden />
      {/* Profile Header Section */}
      <View className="bg-white px-5 pt-10">
        <View className="items-center mb-6">
          <TouchableOpacity onPress={handleImagePick}>
            <Image
              source={{
                uri:
                  avatar ||
                  "https://ui-avatars.com/api/?name=A&background=8a524d&color=fff&format=png ",
              }}
              className="w-32 h-32 rounded-full border-4 border-gray-200"
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View className="mt-2 flex flex-col items-center">
            <View className="flex flex-row items-center gap-2">
              {isEditingUsername ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    className="text-gray-500 text-3xl font-poppins-bold text-center border-b border-gray-300 px-2"
                    autoFocus
                    onSubmitEditing={handleUpdateUsername}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              ) : (
                <>
                  <Text className="text-gray-500 text-3xl font-poppins-bold">
                    {username || "User"}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditingUsername(true)}>
                    <Image source={icons.edit} className="w-4 h-4" />
                  </TouchableOpacity>
                </>
              )}
            </View>
            <Text className="text-gray-500">{user?.email}</Text>
            <Text className="text-xs text-gray-400 mt-1">
              Last edited: {lastEdited}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-poppins-semibold mb-2">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            className="bg-white p-3 rounded border-b border-gray-300"
            multiline={true}
            numberOfLines={4}
            placeholder="Write something about yourself..."
            onEndEditing={() => handleUpdateBio(bio)}
            blurOnSubmit={true}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Posts Section */}
      {currentUser && <UserPosts userId={currentUser.uid} />}

      {/* Footer Section */}
      <View className="px-5 py-4">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 w-full px-6 py-3 rounded-lg"
        >
          <Text className="font-semibold text-white text-center">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
