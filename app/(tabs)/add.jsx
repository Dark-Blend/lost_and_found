import {
  View,
  StyleSheet,
  Text,
  Alert,
  ScrollView,
  SafeAreaView
} from "react-native";
import React, { useState, useRef } from "react";
import FormField from "../../components/FormField";
import LocationPicker from "../../components/LocationPicker";
import ImagePickerComponent from "../../components/ImagePicker";
import CategoryPicker from "../../components/CategoryPicker";
import Button from "../../components/Button";
import { addFoundItem } from "../../services/databaseService";
import { useGlobalContext } from "../../context/GlobalProvider";

const Add = () => {
  const { currentUser } = useGlobalContext();
  const locationPickerRef = useRef();
  const imagePickerRef = useRef();
  const categoryPickerRef = useRef();

  const [foundItem, setFoundItem] = useState({
    itemName: "",
    description: "",
    location: {
      latitude: null,
      longitude: null,
    },
    foundBy: currentUser?.uid || "",
    claimedBy: "",
    images: [],
    categories: [],
    timestamp: new Date(),
    isClaimed: false,
  });

  const [loading, setLoading] = useState(false);

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
      location: {
        latitude: null,
        longitude: null,
      },
      foundBy: currentUser?.uid || "",
      claimedBy: "",
      images: [],
      categories: [],
      timestamp: new Date(),
      isClaimed: false,
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

    setLoading(true);
    try {
      await addFoundItem(foundItem);
      Alert.alert("Success", "Item added successfully");
      resetForm();
    } catch (error) {
      Alert.alert("Error", "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text  className="font-poppins-bold text-2xl">Add Found Item</Text>
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
          className="mt-4 mb-6"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 16,
    marginBottom: 8,
  }
});

export default Add;
  