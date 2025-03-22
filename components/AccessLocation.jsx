import { View, Text, ActivityIndicator , StyleSheet} from "react-native";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import Map from "./Map";

const AccessLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
    } catch (error) {
      setErrorMsg("Error fetching location");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex justify-center items-center " style={styles.activity}>
        <ActivityIndicator color="#0000ff" size="large" />
      </View>
    );
  }

  return (
    <View>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : (
        location && (
          <Map
            latitude={location.coords.latitude}
            longitude={location.coords.longitude}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    activity: {
      width: '100%', 
      height: '100%', 
    },
  });
export default AccessLocation;
