import { View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import AccessLocation from "../../components/AccessLocation";
import AddFoundItem from "../../components/AddFoundItem";
import SearchBar from "../../components/SearchBar";
const Home = () => {
  return (
    <View className="flex-1">
      <StatusBar hidden />
      <AccessLocation />
      <AddFoundItem />   
      <SearchBar />
    </View>
  );
};

export default Home;
