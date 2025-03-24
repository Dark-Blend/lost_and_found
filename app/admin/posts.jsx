import { View, Text } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'

const posts = () => {
  return (
    <View className='flex-1'>
      <StatusBar hidden />
      <Text>posts</Text>
    </View>
  )
}

export default posts