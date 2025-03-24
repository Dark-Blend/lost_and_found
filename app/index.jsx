import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import images from "../constants/images";
import Button from "../components/Button";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { ActivityIndicator } from "react-native";
import { useEffect } from "react";

export default function App() {
  const { currentUser, isLoading } = useGlobalContext();

  useEffect(() => {
    if (!isLoading && currentUser) {
      console.log("User authenticated:", currentUser.uid);
      console.log("User role:", currentUser.role);
      console.log("User data:", JSON.stringify(currentUser, null, 2));
      
      // Check if user has admin role
      if (currentUser.role === "admin") {
        console.log("Routing to admin dashboard");
        router.replace("/admin/users");
      } else {
        console.log("Routing to home page");
        router.replace("/home");
      }
    } else {
      console.log("Loading:", isLoading, "CurrentUser:", currentUser);
    }
  }, [currentUser, isLoading]);

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ImageBackground
          source={images.background}
          className="h-screen w-screen relative"
          resizeMode="cover"
        >
          <StatusBar hidden />
          {/* Logo */}
          <Image
            source={images.logo}
            className="w-28 h-28 absolute top-20 left-1/2 -translate-x-1/2"
            resizeMode="contain"
          />

          {/* Button to continue */}
          <View className="absolute -bottom-20 w-screen h-[280px] bg-primary rounded-t-3xl px-10 py-8 grid gap-4">
            <View>
              <Text className="font-poppins-light text-black/60 text-5xl pt-1">
                Lost It?
              </Text>
              <Text className="font-poppins-bold text-black/60 text-5xl">
                Found It
              </Text>
              <Text className="font-poppins-light text-black/60 text-lg">
                Your Items, always within reach
              </Text>
            </View>
            <Button title="Continue" onPress={() => router.push("/signin")} />
          </View>
        </ImageBackground>
      )}
    </View>
  );
}