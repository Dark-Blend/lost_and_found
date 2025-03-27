import { View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { icons } from '../../../constants/icons';
import Header from '../../../components/Header';
import { TabIcon } from '../../../components/TabIcon';

const AdminTabsLayout = () => {
  return (
    <View className='flex-1'>
      <Header />
      <Tabs 
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: { height: 84 },
          tabBarIconStyle: { marginTop: 20 },
        }}
      >
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

export default AdminTabsLayout 