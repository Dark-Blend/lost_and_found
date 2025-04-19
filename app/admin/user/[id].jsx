import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../firebaseConfig';
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

const UserDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'No date';
      
      // Handle Firestore Timestamp
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleDateString();
      }
      
      // Handle JavaScript Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      
      // Handle seconds timestamp
      if (typeof timestamp === 'number') {
        return new Date(timestamp * 1000).toLocaleDateString();
      }
      
      // Handle string dates
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString();
      }
      
      // Handle timestamp with nanoseconds format
      if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }

      return 'Invalid date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error formatting date';
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', id));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setLoading(false);
    }
  };

  const handleTimeout = async () => {
    if (user.role === 'admin') {
      Alert.alert('Error', 'Cannot timeout an admin user');
      return;
    }

    Alert.alert(
      'Timeout User',
      'Are you sure you want to timeout this user for 30 days?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Timeout',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const timeoutDate = new Date();
              timeoutDate.setDate(timeoutDate.getDate() + 30);

              await updateDoc(doc(FIREBASE_DB, 'users', id), {
                timeoutUntil: Timestamp.fromDate(timeoutDate),
                status: 'timeout'
              });

              setUser({
                ...user,
                timeoutUntil: Timestamp.fromDate(timeoutDate),
                status: 'timeout'
              });
              Alert.alert('Success', 'User has been timed out for 30 days');
            } catch (error) {
              console.error('Error timing out user:', error);
              Alert.alert('Error', 'Failed to timeout user');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    if (user.role === 'admin') {
      Alert.alert('Error', 'Cannot delete an admin user');
      return;
    }

    Alert.alert(
      'Delete User',
      'Are you sure you want to permanently delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              // Delete from Firestore
              await deleteDoc(doc(FIREBASE_DB, 'users', id));
              
              // Delete from Firebase Auth
              try {
                const currentAuthUser = FIREBASE_AUTH.currentUser;
                if (currentAuthUser) {
                  await deleteUser(currentAuthUser);
                }
              } catch (authError) {
                console.error('Error deleting user from auth:', authError);
              }

              Alert.alert('Success', 'User has been permanently deleted');
              router.back();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl font-poppins">User not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white py-4">
      <StatusBar hidden />
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-poppins-bold mb-4">User Details</Text>
        
        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-lg font-poppins-medium">Email</Text>
          <Text className="text-gray-600 font-poppins">{user.email}</Text>
        </View>

        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-lg font-poppins-medium">Role</Text>
          <Text className="text-gray-600 font-poppins capitalize">{user.role || 'user'}</Text>
        </View>

        {user.timeoutUntil && (
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="text-lg font-poppins-medium">Timeout Until</Text>
            <Text className="text-gray-600 font-poppins">
              {formatDate(user.timeoutUntil)}
            </Text>
          </View>
        )}

        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-lg font-poppins-medium">Status</Text>
          <Text className="text-gray-600 font-poppins capitalize">{user.status || 'active'}</Text>
        </View>

        {user.role !== 'admin' && (
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleTimeout}
              disabled={updating}
              className={`p-4 rounded-lg ${updating ? 'bg-gray-400' : 'bg-yellow-500'}`}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-poppins-medium text-center">
                  Timeout for 30 Days
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={updating}
              className={`p-4 mt-3 rounded-lg ${updating ? 'bg-gray-400' : 'bg-red-500'}`}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-poppins-medium text-center">
                  Delete User Permanently
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default UserDetails; 