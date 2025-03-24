import { View } from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import AccessLocation from "../../components/AccessLocation";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categories) => {
    setSelectedCategories(categories);
  };

  return (
    <View className="flex-1">
      <StatusBar hidden />
      <AccessLocation 
        searchQuery={searchQuery}
        selectedCategories={selectedCategories}
      />
    </View>
  );
};

export default Home;
