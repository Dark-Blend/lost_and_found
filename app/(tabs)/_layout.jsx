// tabs/_layout.jsx
import React from 'react';
import { Tabs } from 'expo-router';
import { icons } from '../../constants/icons';
import { View, Image } from 'react-native';
import Header from '../../components/Header';

const TabIcon = ({ icon, focused }) => {
  return (
    <View
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

const TabsLayout = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: { height: 84 },
          tabBarIconStyle: { marginTop: 20 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ focused }) => TabIcon({ icon: icons.home, focused }),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add',
            headerShown: false,
            tabBarIcon: ({ focused }) => TabIcon({ icon: icons.plus, focused }),
          }}
        />
        <Tabs.Screen
          name="karma"
          options={{
            title: 'Karma',
            headerShown: false,
            tabBarIcon: ({ focused }) => TabIcon({ icon: icons.karma, focused }),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            headerShown: false,
            tabBarIcon: ({ focused }) => TabIcon({ icon: icons.chat, focused }),
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;