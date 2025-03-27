import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { collection, getDocs } from 'firebase/firestore'
import { FIREBASE_DB } from '../../../firebaseConfig'
import { TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(FIREBASE_DB, 'users')
      const usersSnapshot = await getDocs(usersCollection)
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersList)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <View className="flex-1 py-4">
      <StatusBar hidden />
      <ScrollView className="flex-1 px-4">
        {users.map(user => (
          <TouchableOpacity 
            key={user.id} 
            className="bg-[#0000001a] p-4 rounded-lg mb-3"
            onPress={() => router.push(`/admin/user/${user.id}`)}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-poppins-medium text-lg">{user.email}</Text>
                <Text className="font-poppins-regular text-gray-600">
                  {user.role || 'user'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

export default Users 