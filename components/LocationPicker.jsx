import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const LocationPicker = forwardRef(({ onLocationSelect }, ref) => {
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

  useImperativeHandle(ref, () => ({
    reset: () => {
      setLocation(null);
    }
  }));

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
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default LocationPicker; 