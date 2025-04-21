import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import FormField from "./FormField";
import LocationPicker from "./LocationPicker";
import ImagePickerComponent from "./ImagePicker";
import CategoryPicker from "./CategoryPicker";
import Button from "./Button";
import { addFoundItem } from '../services/databaseService';

const FoundItemForm = ({ onSuccess, userId }) => {
  if (!userId || userId === "") {
    Alert.alert("Error", "You must be logged in to add items");
    return null;
  }

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
    type: 'found'
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
      userId: userId
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
    if (!userId) {
      Alert.alert("Error", "You must be logged in to add items");
      return;
    }

    if (!foundItem.itemName || !foundItem.description || !foundItem.location.latitude || !foundItem.location.longitude) {
      Alert.alert("Error", "Please fill in all required fields and select a location");
      return;
    }

    if (foundItem.categories.length === 0) {
      Alert.alert("Error", "Please select at least one category");
      return;
    }

    setLoading(true);
    let itemAdded = false;
    try {
      const itemData = {
        ...foundItem,
        userId: userId
      };
      await addFoundItem(itemData);
      itemAdded = true;
      Alert.alert("Success", "Item added successfully");
      resetForm();
      // Small delay to ensure form clears before navigation
      setTimeout(() => {
        onSuccess();
      }, 200);
    } catch (error) {
      // Check if error is a timeout error
      if (error.message && error.message.includes('timed out until')) {
        Alert.alert("Timeout", error.message);
      } else if (!itemAdded) {
        Alert.alert("Error", "Failed to add item");
      } else {
        // If item was added but something else failed (e.g. notification), show a warning
        Alert.alert("Warning", "Item added but some notifications may have failed.");
      }
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
