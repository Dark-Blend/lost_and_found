import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import FormField from "./FormField";
import LocationPicker from "./LocationPicker";
import ImagePickerComponent from "./ImagePicker";
import CategoryPicker from "./CategoryPicker";
import Button from "./Button";
import { addFoundItem } from '../services/databaseService';

const FoundItemForm = ({ onSuccess, userId, userName }) => {
  const [foundItem, setFoundItem] = useState({
    itemName: "",
    description: "",
    images: [],
    categories: [],
    location: {
      latitude: null,
      longitude: null,
    },
    userId: userId,
    userName: userName,
  });
  const [loading, setLoading] = useState(false);

  const locationPickerRef = useRef();
  const imagePickerRef = useRef();
  const categoryPickerRef = useRef();

  const handleLocationSelect = (coordinate) => {
    setFoundItem({
      ...foundItem,
      location: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      },
    });
  };

  const handleImagesSelected = (images) => {
    setFoundItem({
      ...foundItem,
      images,
    });
  };

  const handleCategorySelect = (categories) => {
    setFoundItem({
      ...foundItem,
      categories,
    });
  };

  const resetForm = () => {
    setFoundItem({
      itemName: "",
      description: "",
      images: [],
      categories: [],
      location: {
        latitude: null,
        longitude: null,
      },
      userId: userId,
      userName: userName,
    });

    // Reset child components
    if (locationPickerRef.current?.reset) {
      locationPickerRef.current.reset();
    }
    if (imagePickerRef.current?.reset) {
      imagePickerRef.current.reset();
    }
    if (categoryPickerRef.current?.reset) {
      categoryPickerRef.current.reset();
    }
  };

  const handleSubmit = async () => {
    if (!foundItem.itemName || !foundItem.description || !foundItem.location.latitude || !foundItem.location.longitude) {
      Alert.alert("Error", "Please fill in all required fields and select a location");
      return;
    }

    if (foundItem.categories.length === 0) {
      Alert.alert("Error", "Please select at least one category");
      return;
    }

    try {
      setLoading(true);
      await addFoundItem(foundItem);
      Alert.alert("Success", "Item added successfully");
      resetForm();
      onSuccess();
    } catch (error) {
      Alert.alert("Error", "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='pb-6'>
      <Text className="font-poppins-bold text-2xl">Add Found Item</Text>
      <FormField 
        placeholder={'Item name'} 
        title={"Name"} 
        value={foundItem.itemName}
        setValue={(text) => setFoundItem({ ...foundItem, itemName: text })}
        otherStyles={"mt-3"}
      />
      <FormField 
        placeholder={'Description'} 
        title={'Description'} 
        value={foundItem.description}
        setValue={(text) => setFoundItem({ ...foundItem, description: text })}
        multiline={true}
        otherStyles={"mt-3"}
      />
      
      <Text style={styles.sectionTitle}>Categories</Text>
      <CategoryPicker 
        ref={categoryPickerRef}
        selectedCategories={foundItem.categories}
        onCategorySelect={handleCategorySelect}
      />
      
      <Text style={styles.sectionTitle}>Location</Text>
      <LocationPicker 
        ref={locationPickerRef}
        onLocationSelect={handleLocationSelect} 
      />
      
      <Text style={styles.sectionTitle}>Images</Text>
      <ImagePickerComponent 
        ref={imagePickerRef}
        onImagesSelected={handleImagesSelected} 
      />

      <Button 
        title={loading ? "Adding..." : "Add Item"} 
        onPress={handleSubmit} 
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default FoundItemForm;
