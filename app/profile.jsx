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
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  getUser,
  getNotifications,
  markNotificationAsRead,
  updateUser,
  getUserFoundItems,
  getUserLostItems,
  updateFoundItem,
} from "../services/databaseService";
import { deleteUser } from "../services/deleteUser";
import {
  SignOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "../services/authService";
import { FIREBASE_AUTH } from "../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { icons } from "../constants/icons";
import UserItems from "../components/UserItems";

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
  notifications,
  showNotifications,
  setShowNotifications,
  foundItems = 0,
  returnedItems = 0,
}) => (
  <View className="bg-white px-5 pt-10">
    <View className="items-center mb-6 relative">
      {/* Notification Bell */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
        onPress={() => setShowNotifications(true)}
      >
        <Image source={icons.bell} style={{ width: 28, height: 28 , tintColor:'black' }} />
        {notifications && notifications.some(n => !n.read) && (
          <View style={{
            position: 'absolute',
            top: 2,
            right: 2,
            backgroundColor: 'red',
            borderRadius: 8,
            width: 16,
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{notifications.filter(n => !n.read).length}</Text>
          </View>
        )}
      </TouchableOpacity>
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
        <View className="flex-row items-center gap-4 mt-4">
          <View className="flex-row items-center gap-2">
            <Image source={icons.found} className="w-6 h-6" />
            <Text className="text-gray-500">Found: {foundItems}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Image source={icons.returned} className="w-6 h-6" />
            <Text className="text-gray-500">Returned: {returnedItems}</Text>
          </View>
        </View>
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
  // ...existing state
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const { currentUser } = useGlobalContext();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [foundItems, setFoundItems] = useState(0);
  const [returnedItems, setReturnedItems] = useState(0);

  const styles = {
    notificationsContainer: {
      marginTop: 20,
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      padding: 16,
    },
    notificationItem: {
      backgroundColor: "#fff",
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: "#eee",
    },
    unreadNotification: {
      backgroundColor: "#f0f8ff",
      borderColor: "#007AFF",
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    notificationMessage: {
      fontSize: 14,
      color: "#666",
      marginBottom: 8,
    },
    notificationTime: {
      fontSize: 12,
      color: "#999",
    },
    emptyContainer: {
      padding: 20,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 16,
      color: "#666",
    },
  };

  useEffect(() => {
    loadUserProfile();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!currentUser) return;

    try {
      const userNotifications = await getNotifications(currentUser.uid);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.read) {
        await markNotificationAsRead(notification.id, notification.itemId, currentUser.uid);
        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }

      // Navigate to the relevant item
      if (notification.type === "match" && notification.itemId) {
        router.push(`/post/${notification.itemId}`);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userData = await getUser(currentUser.uid);
      if (userData) {
        setUser(userData);
        setBio(userData.bio || "");
        setAvatar(userData.avatar);
        setUsername(userData.username || "");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
      setLoading(false);
    }
  };

  // Add this useEffect to update stats when user data changes
  useEffect(() => {
    if (user) {
      setFoundItems(user.foundItems || 0);
      setReturnedItems(user.returnedItems || 0);
    }
  }, [user]);

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
            await SignOut();
            router.replace("/signin");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", error.message);
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

  const lastEdited = user?.editedAt
    ? new Date(user.editedAt).toLocaleString()
    : "Not edited yet";

  return (
    <View className="flex-1 flex  justify-between">
      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" transparent onRequestClose={() => setShowNotifications(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start' }}>
          <View style={{ backgroundColor: 'white', marginTop: 80, borderTopLeftRadius: 16, borderTopRightRadius: 16, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', flex: 1 }}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Text style={{ fontSize: 18, color: '#007AFF' }}>Close</Text>
              </TouchableOpacity>
            </View>
            {notifications.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 16 }}>No notifications yet.</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      { padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0', backgroundColor: item.read ? '#fff' : '#f0f8ff' },
                    ]}
                    onPress={() => {
                      setShowNotifications(false);
                      handleNotificationPress(item);
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', color: '#222', marginBottom: 2 }}>{item.title}</Text>
                    <Text style={{ color: '#555', marginBottom: 2 }}>{item.message}</Text>
                    <Text style={{ color: '#999', fontSize: 12 }}>{item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleString() : ''}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
      <StatusBar hidden />
      {/* Profile Header Section */}
      <View className="bg-white px-5 pt-10">
        <View className="items-center mb-6 relative">
          {/* Notification Bell */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
            onPress={() => setShowNotifications(true)}
          >
            <Image source={icons.bell} style={{ width: 28, height: 28 }} />
            {notifications.some(n => !n.read) && (
              <View style={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: 'red',
                borderRadius: 8,
                width: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{notifications.filter(n => !n.read).length}</Text>
              </View>
            )}
          </TouchableOpacity>
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
      {user?.role === "user" && <UserItems userId={currentUser.uid} />}

      {/* Footer Section */}
      <View className="px-5 py-4  flex-row gap-2">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 px-6 py-3 rounded-lg w-[85%]"
        >
          <Text className="font-semibold text-white text-center">Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account? This action cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    setShowPasswordModal(true);
                  },
                },
              ],
              { cancelable: true }
            );
          }}
          className="bg-gray-200 border border-red-500 flex-1 items-center justify-center rounded-lg"
        >
          <Image
            source={icons.trash}
            className="w-[30px] h-[30px]"
            tintColor="red"
          />
        </TouchableOpacity>
      </View>

      {/* Password Confirmation Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <View className="bg-white w-[90%] rounded-xl p-4">
            <Text className="font-poppins-semibold text-lg mb-4">
              Confirm with Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              className="bg-gray-100 p-3 rounded-lg mb-4"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
                className="flex-1 bg-gray-200 p-3 rounded-lg"
              >
                <Text className="text-center font-poppins-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!password) {
                    Alert.alert("Error", "Password is required");
                    return;
                  }

                  setLoading(true);

                  try {
                    const user = FIREBASE_AUTH.currentUser;
                    if (!user) {
                      Alert.alert(
                        "Error",
                        "User not found. Please try logging in again."
                      );
                      return;
                    }

                    // Step 1: Re-authenticate user
                    const credential = EmailAuthProvider.credential(
                      user.email,
                      password
                    );
                    await reauthenticateWithCredential(user, credential);

                    // Step 2: Delete user data from Firestore
                    // We need to do this before deleting the auth user
                    // because we need the user to be authenticated
                    await deleteUser(currentUser.uid);
                    
                    // Step 3: Delete Firebase auth user
                    // This will automatically sign out the user
                    await user.delete();
                    
                    // Step 4: Navigate to login
                    router.replace("/signin");
                  } catch (error) {
                    
                    if (error.code === "auth/wrong-password" || 
                        error.code === "auth/invalid-credential") {
                      Alert.alert("Error", "Incorrect password. Please try again.");
                    } else {
                      Alert.alert(
                        "Error",
                        "Failed to delete account. Please try again."
                      );
                    }
                  } finally {
                    setLoading(false);
                    setShowPasswordModal(false);
                    setPassword("");
                  }
                }}
                disabled={loading}
                className={`flex-1 p-3 rounded-lg ${
                  loading ? "bg-red-300" : "bg-red-500"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-center font-poppins-semibold text-white">
                    Delete Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default Profile;
