import {
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Alert,
  ScrollView
} from "react-native";
import React, { useState } from "react";
import { icons } from "../constants/icons";
import ModalView from "./ModalView";
import FormField from "./FormField";
import LocationPicker from "./LocationPicker";
import ImagePickerComponent from "./ImagePicker";
import CategoryPicker from "./CategoryPicker";
import Button from "./Button";
import { addFoundItem } from "../services/databaseService";
import { useGlobalContext } from "../context/GlobalProvider";

const AddFoundItem = () => {
  const { currentUser } = useGlobalContext();
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
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOnPress = () => {
    setIsModalVisible(true);
  };

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
      setIsModalVisible(false);
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
      });
    } catch (error) {
      Alert.alert("Error", "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <TouchableOpacity
        className="rounded-full absolute bottom-8 right-8 bg-primary"
        style={styles.shadowedView}
        onPress={handleOnPress}
      >
        <Image source={icons.plus} className="w-16 h-16" resizeMode="contain" />
      </TouchableOpacity>

      {/* Modal */}
      <ModalView isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
        <ScrollView className="p-3">
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
          
          <Text className="font-poppins text-lg text-black/50 mt-2">Categories</Text>
          <CategoryPicker 
            selectedCategories={foundItem.categories}
            onCategorySelect={handleCategorySelect}
          />
          
          <Text className="font-poppins text-lg text-black/50 mt-2">Location</Text>
          <LocationPicker onLocationSelect={handleLocationSelect} />
          
          <Text className="font-poppins text-lg text-black/50 mt-2">Images</Text>
          <ImagePickerComponent onImagesSelected={handleImagesSelected} />
          
          <Button 
            title={loading ? "Adding..." : "Add Item"} 
            onPress={handleSubmit}
            disabled={loading}
            className="mt-4"
          />
        </ScrollView>
      </ModalView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowedView: {
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

export default AddFoundItem;
