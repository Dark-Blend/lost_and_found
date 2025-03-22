import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const LocationPicker = ({ onLocationSelect }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setLocation({
      ...location,
      coords: coordinate
    });
    onLocationSelect(coordinate);
  };

  if (errorMsg) {
    return <View />;
  }

  if (!location) {
    return <View />;
  }

  return (
    <View style={styles.container} className="w-full">
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Selected Location"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 200,
    
  },
  map: {
    width: 315,
    height: '100%',

  },
});

export default LocationPicker; 