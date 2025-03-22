import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { icons } from '../constants/icons';

const ImagePickerComponent = ({ onImagesSelected }) => {
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.5, // Compress image to 50% quality
        base64: true, // Get base64 string directly
      });

      if (!result.canceled) {
        const newImages = [...images, ...result.assets];
        
        // Check if total images don't exceed 3 (to keep Firestore document size manageable)
        if (newImages.length > 3) {
          Alert.alert("Limit Exceeded", "You can only add up to 3 images");
          return;
        }

        setImages(newImages);
        onImagesSelected(newImages);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesSelected(newImages);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.length < 3 && (
          <TouchableOpacity onPress={pickImage} style={styles.addButton}>
            <Image source={icons.plus} style={styles.addIcon} />
          </TouchableOpacity>
        )}
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Image source={icons.close} style={styles.removeIcon} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  addButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addIcon: {
    width: 30,
    height: 30,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
  },
  removeIcon: {
    width: 20,
    height: 20,
  },
});

export default ImagePickerComponent; 