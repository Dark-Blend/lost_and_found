import { View, Text } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'

const users = () => {
  return (
    <View className='flex-1'>
      <StatusBar hidden />
      <Text>users</Text>
    </View>
  )
}

export default users