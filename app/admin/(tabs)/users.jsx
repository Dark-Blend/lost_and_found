import { View, Text, TextInput } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { StatusBar } from 'expo-status-bar'
import { TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { getAllUsers } from '../../../services/databaseService'
import { Ionicons } from '@expo/vector-icons'
import { debounce } from 'lodash'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true)
      const usersList = await getAllUsers(query)
      setUsers(usersList)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  // Debounced search to reduce unnecessary API calls
  const debouncedFetchUsers = useCallback(
    debounce((query) => {
      fetchUsers(query)
    }, 500),
    []
  )

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.length > 2) {
      debouncedFetchUsers(query)
    } else if (query.length === 0) {
      fetchUsers()
    }
  }

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
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 border border-gray-300">
          <Ionicons name="search" size={20} color="gray" className="mr-2" />
          <TextInput 
            placeholder="Search users "
            value={searchQuery}
            onChangeText={handleSearch}
            className="flex-1 ml-2 font-poppins-regular"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <ScrollView className="flex-1 px-4">
        {users.length === 0 ? (
          <View className="items-center justify-center">
            <Text className="text-gray-500 font-poppins-regular">
              {searchQuery 
                ? 'No users found matching your search' 
                : 'No users available'}
            </Text>
          </View>
        ) : (
          users.map(user => (
            <TouchableOpacity 
              key={user.id} 
              className="bg-[#0000001a] p-4 rounded-lg mb-3"
              onPress={() => router.push(`/admin/user/${user.id}`)}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-poppins-medium text-lg">
                    {user.username}
                  </Text>
                  <Text className="font-poppins-regular text-gray-600">
                    {user.email}
                  </Text>
                  <Text className="font-poppins-regular text-gray-600">
                    Role: {user.role || 'user'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default Users