import { View, Image } from 'react-native'
import React from 'react'

export const TabIcon = ({ icon, focused }) => {
  return (
    <View
      className={`flex rounded-full h-16 items-center justify-center ${
        focused ? 'bg-black w-32 flex-2' : 'bg-[#0000001a] w-20'
      }`}
    >
      <Image
        source={icon}
        className="w-12 h-12"
        resizeMode="contain"
        tintColor={focused ? '#ffffff' : '#000000'}
      />
    </View>
  );
}; 