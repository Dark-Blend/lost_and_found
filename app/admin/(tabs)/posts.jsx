import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { collection, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { FIREBASE_DB } from '../../../firebaseConfig'
import { TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert } from 'react-native'
import { useRouter } from 'expo-router'

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const router = useRouter()

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'No date'
      
      console.log('Timestamp type:', typeof timestamp, timestamp)
      
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

      console.log('Unhandled timestamp format:', timestamp)
      return 'Invalid date'
    } catch (error) {
      console.error('Error formatting date:', error, timestamp)
      return 'Error formatting date'
    }
  }

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(FIREBASE_DB, 'foundItems')
      const postsSnapshot = await getDocs(postsCollection)
      const postsList = postsSnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('Post data:', doc.id, data)
        console.log('CreatedAt:', data.createdAt)
        
        return {
          id: doc.id,
          ...data,
          // Ensure createdAt is properly handled
          createdAt: data.createdAt || null
        }
      })
      
      // Sort posts by createdAt, handling potential undefined or invalid dates
      postsList.sort((a, b) => {
        try {
          let dateA = a.createdAt
          let dateB = b.createdAt
          
          // Convert to milliseconds for comparison
          if (dateA?.seconds) dateA = dateA.seconds * 1000
          if (dateB?.seconds) dateB = dateB.seconds * 1000
          
          // If still not a number, try to convert from Timestamp
          if (dateA instanceof Timestamp) dateA = dateA.toMillis()
          if (dateB instanceof Timestamp) dateB = dateB.toMillis()
          
          // Default to 0 if invalid
          dateA = dateA || 0
          dateB = dateB || 0
          
          return dateB - dateA
        } catch (error) {
          console.error('Error sorting dates:', error)
          return 0
        }
      })
      
      setPosts(postsList)
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
              await deleteDoc(doc(FIREBASE_DB, 'foundItems', postId))
              setPosts(posts.filter(post => post.id !== postId))
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

  return (
    <View className="flex-1 py-4">
      <StatusBar hidden />
      <ScrollView className="flex-1 px-4">
        {posts.map(post => (
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
        ))}
      </ScrollView>
    </View>
  )
}

export default Posts 