import MapView from 'react-native-maps';
import React from 'react';
import { StyleSheet } from 'react-native';

const Map = ({ latitude, longitude }) => {
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

    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

export default Map;