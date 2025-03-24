import MapView, { Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { getAllFoundItems } from '../services/databaseService';
import ItemDetailsBox from './ItemDetailsBox';
import SearchBar from './SearchBar';

const { width, height } = Dimensions.get('window');

const Map = ({ latitude, longitude, searchQuery: initialSearchQuery, selectedCategories: initialSelectedCategories }) => {
  const router = useRouter();
  const [foundItems, setFoundItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories || []);

  useEffect(() => {
    loadFoundItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategories, foundItems]);

  const loadFoundItems = async () => {
    try {
      const items = await getAllFoundItems();
      setFoundItems(items);
    } catch (error) {
      console.error('Error loading found items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...foundItems];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.itemName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item =>
        selectedCategories.includes(item.category)
      );
    }

    setFilteredItems(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categories) => {
    setSelectedCategories(categories);
  };

  const handleMarkerPress = (itemId) => {
    setSelectedItemId(itemId === selectedItemId ? null : itemId);
  };

  if (!latitude || !longitude) return null;

  return (
    <View style={styles.container}>
      <SearchBar 
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
      />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredItems.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.location.latitude,
              longitude: item.location.longitude,
            }}
            pinColor="red"
            onPress={() => handleMarkerPress(item.id)}
            title={item.itemName}
          />
        ))}
      </MapView>
      {filteredItems.length > 0 && (
        <ItemDetailsBox 
          items={filteredItems} 
          selectedItemId={selectedItemId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  }
});

export default Map;