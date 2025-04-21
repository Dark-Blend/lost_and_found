import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { collection, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { FIREBASE_DB } from '../../../firebaseConfig'
import { TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert } from 'react-native'
import { useRouter } from 'expo-router'

const Posts = () => {
  const [foundPosts, setFoundPosts] = useState([])
  const [lostPosts, setLostPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [activeTab, setActiveTab] = useState('found')
  const router = useRouter()

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'No date'
      
      // Handle Firestore Timestamp
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleDateString()
      }
      
      // Handle JavaScript Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString()
      }
      
      // Handle seconds timestamp
      if (typeof timestamp === 'number') {
        return new Date(timestamp * 1000).toLocaleDateString()
      }
      
      // Handle string dates
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString()
      }
      
      // Handle timestamp with nanoseconds format
      if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString()
      }

      return 'Invalid date'
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Error formatting date'
    }
  }

  const fetchPosts = async () => {
    try {
      // Fetch both foundItems and lostItems
      const foundItemsCollection = collection(FIREBASE_DB, 'foundItems')
      const lostItemsCollection = collection(FIREBASE_DB, 'lostItems')
      
      const [foundItemsSnapshot, lostItemsSnapshot] = await Promise.all([
        getDocs(foundItemsCollection),
        getDocs(lostItemsCollection)
      ])
      
      const foundPostsList = foundItemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || null
      }))
      
      const lostPostsList = lostItemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || null
      }))
      
      // Sort posts by createdAt
      foundPostsList.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0
        const dateB = b.createdAt?.seconds || 0
        return dateB - dateA
      })

      lostPostsList.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0
        const dateB = b.createdAt?.seconds || 0
        return dateB - dateA
      })
      
      setFoundPosts(foundPostsList)
      setLostPosts(lostPostsList)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(postId)
              const collectionName = activeTab === 'found' ? 'foundItems' : 'lostItems'
              
              await deleteDoc(doc(FIREBASE_DB, collectionName, postId))
              
              if (activeTab === 'found') {
                setFoundPosts(foundPosts.filter(post => post.id !== postId))
              } else {
                setLostPosts(lostPosts.filter(post => post.id !== postId))
              }
              
              Alert.alert('Success', 'Post deleted successfully')
            } catch (error) {
              console.error('Error deleting post:', error)
              Alert.alert('Error', 'Failed to delete post')
            } finally {
              setDeleting(null)
            }
          }
        }
      ]
    )
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  const renderPosts = activeTab === 'found' ? foundPosts : lostPosts

  return (
    <View className="flex-1 py-4">
      <StatusBar hidden />
      
      {/* Tab Navigation */}
      <View className="flex-row justify-center mb-4 w-full px-4">
        <TouchableOpacity 
          onPress={() => setActiveTab('found')}
          className={`px-4 w-1/2 py-2 ${activeTab === 'found' ? 'bg-black' : 'bg-gray-200'} rounded-l-lg`}
        >
          <Text className={`text-center ${activeTab === 'found' ? 'text-white' : 'text-gray-600'}`}>
            Found Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('lost')}
          className={`px-4 py-2 w-1/2 ${activeTab === 'lost' ? 'bg-black' : 'bg-gray-200'} rounded-r-lg`}
        >
          <Text className={`text-center ${activeTab === 'lost' ? 'text-white' : 'text-gray-600'}`}>
            Lost Items
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {renderPosts.length === 0 ? (
          <View className="items-center justify-center mt-10">
            <Text className="text-gray-500 font-poppins-regular">
              No {activeTab === 'found' ? 'found' : 'lost'} items
            </Text>
          </View>
        ) : (
          renderPosts.map(post => (
            <TouchableOpacity 
              key={post.id} 
              className="bg-[#0000001a] p-4 rounded-lg mb-3"
              onPress={() => router.push(`/post/${post.id}`)}
            >
              <View>
                {post.images && post.images.length > 0 && (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${post.images[0]}` }}
                    className="w-full h-48 rounded-lg mb-3"
                    resizeMode="cover"
                  />
                )}
                <View className="flex-col w-full justify-between items-center">
                  <View className='w-full'>
                    <Text className="font-poppins-medium text-lg">{post.itemName}</Text>
                    <Text className="font-poppins-regular text-gray-600" numberOfLines={2}>
                      {post.description}
                    </Text>
                    <Text className="font-poppins-light text-gray-500 mt-1">
                      {formatDate(post.createdAt)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => handleDelete(post.id)}
                    disabled={deleting === post.id}
                    className={`p-2 w-full rounded-lg mt-3 ${deleting === post.id ? 'bg-gray-400' : 'bg-red-500'}`}
                  >
                    {deleting === post.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-poppins-medium px-2">
                        Delete
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default Posts