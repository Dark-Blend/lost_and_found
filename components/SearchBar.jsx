import { View, Image, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import React, { useState } from "react";
import { icons } from "../constants/icons";
import { TextInput } from "react-native";
import CategoryPicker from "./CategoryPicker";

const SearchBar = ({ onSearch, onCategorySelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  const handleSearch = (text) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleCategorySelect = (categories) => {
    setSelectedCategories(categories);
    onCategorySelect(categories);
  };

  return (
    <View className="absolute top-0 w-full z-10">
      <View className="p-2 flex flex-row gap-2 p-3">
        <View className="h-full relative flex-1">
          <TextInput
            placeholder="Something lost? Find it here"
            className="font-poppins w-full h-full rounded-full bg-white p-2 pl-16"
            placeholderTextColor={"#898989"}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Image
            source={icons.search}
            className="w-10 h-10 absolute left-2 top-1/2 -translate-y-1/2"
            resizeMode="contain"
            tintColor={"#898989"}
          />
        </View>
        <TouchableOpacity
          className="bg-white flex justify-center items-center p-2 rounded-full"
          style={styles.filterButton}
          onPress={() => setShowCategories(!showCategories)}
        >
          <Image
            source={icons.filter}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {showCategories && (
        <View className="px-3 pb-3">
          <CategoryPicker
            selectedCategories={selectedCategories}
            onCategorySelect={handleCategorySelect}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default SearchBar;
