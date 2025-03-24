import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { icons } from '../../constants/icons';
import Header from '../../components/Header';

const TabIcon = ({ icon, focused }) => {
    return (
      <View
Image
        className={`flex rounded-full h-16  items-center justify-center ${
          focused ? 'bg-black w-32 flex-2' : 'bg-[##0000001a] w-20'
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

const AdminLayout = () => {
  return (
    <View className='flex-1'>
      <Header />
      <Tabs screenOptions={{
      tabBarShowLabel: false,
      tabBarStyle: { height: 84 },
      tabBarIconStyle: { marginTop: 20 },
    }}>
        <Tabs.Screen
          name="users"
          options={{
            title: 'Users',
            headerShown: false,
            tabBarIcon: ({ focused }) => TabIcon({ icon: icons.users, focused }),
          }}
        />
        <Tabs.Screen
          name="posts"
          options={{
            title: 'Posts',
            headerShown: false,
            tabBarIcon: ({ focused }) => TabIcon({ icon: icons.posts, focused }),
          }}
        />
    </Tabs>
    </View>
  )
}

export default AdminLayout