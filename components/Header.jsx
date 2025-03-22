import { View, Text, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import images from "../constants/images";
import { getUser } from "../services/databaseService";
import { useGlobalContext } from "../context/GlobalProvider";

const Header = () => {
  const { currentUser } = useGlobalContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      console.log("Fetching user data for:", currentUser.uid);
      getUser(currentUser.uid)
        .then((userData) => {
          console.log("User data fetched:", userData);
          setUser(userData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
    } else {
      console.log("No current user");
      setUser(null);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    console.log("user :", user);
  }, [user]);

  if (loading) {
    return <View className="w-full h-20 "></View>;
  }

  const imageUrl =
    user?.avatar ||
    "https://ui-avatars.com/api/?name=A&background=8a524d&color=fff&format=png"; // Provide a default avatar if none is available

  return (
    <View className="py-3 px-4 flex-row justify-between items-center">
      <Image source={images.logo} className="w-16 h-16" resizeMode="contain" />
      <Image
        source={{ uri: imageUrl }}
        className="w-12 h-12 rounded-full border"
        resizeMode="cover"
      />
    </View>
  );
};

export default Header;
