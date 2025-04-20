import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import FormField from "./FormField";
import LocationPicker from "./LocationPicker";
import ImagePickerComponent from "./ImagePicker";
import CategoryPicker from "./CategoryPicker";
import Button from "./Button";
import { addLostItem } from '../services/databaseService';

const LostItemForm = ({ onSuccess, userId }) => {
  if (!userId || userId === "") {
    Alert.alert("Error", "You must be logged in to add items");
    return null;
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const locationPickerRef = useRef();
  const imagePickerRef = useRef();
  const categoryPickerRef = useRef();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategories([]);
    setLocation(null);
    setImages([]);

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
    if (!title || !description || categories.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const itemData = {
        itemName: title,
        description,
        categories,
        location,
        images,
        userId: userId
      };

      await addLostItem(itemData);
      Alert.alert('Success', 'Lost item added successfully');
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='pb-6'>
      <Text className="font-poppins-bold text-2xl">Add Lost Item</Text>
      <FormField 
        placeholder={'Item name'} 
        title={"Name"} 
        value={title}
        setValue={setTitle}
        otherStyles={"mt-3"}
      />
      <FormField 
        placeholder={'Description'} 
        title={'Description'} 
        value={description}
        setValue={setDescription}
        multiline={true}
        otherStyles={"mt-3"}
      />
      
      <Text style={styles.sectionTitle}>Categories</Text>
      <CategoryPicker 
        ref={categoryPickerRef}
        selectedCategories={categories}
        onCategorySelect={setCategories}
      />
      
      <Text style={styles.sectionTitle}>Last Seen Location (Optional)</Text>
      <LocationPicker 
        ref={locationPickerRef}
        onLocationSelect={setLocation} 
      />
      
      <Text style={styles.sectionTitle}>Images</Text>
      <ImagePickerComponent 
        ref={imagePickerRef}
        onImagesSelected={setImages} 
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

export default LostItemForm;
