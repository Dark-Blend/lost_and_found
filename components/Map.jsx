import MapView, { Marker, Callout } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { getAllFoundItems } from '../services/databaseService';

const Map = ({ latitude, longitude }) => {
  const router = useRouter();
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoundItems();
  }, []);

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

  const handleMarkerPress = (itemId) => {
    router.push(`/post/${itemId}`);
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation
      showsMyLocationButton={false}
    >
      {foundItems.map((item) => (
        <Marker
          key={item.id}
          coordinate={{
            latitude: item.location.latitude,
            longitude: item.location.longitude,
          }}
          pinColor="red"
          onPress={() => handleMarkerPress(item.id)}
          title={item.itemName}
          description={item.description}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  }
});

export default Map;