import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { useEffect } from "react";

export default function App() {
  const { currentUser, isLoading } = useGlobalContext();

  useEffect(() => {
    if (!isLoading) {
      console.log("Index routing check:", {
        currentUser: currentUser?.email,
        userRole: currentUser?.role,
        isLoading
      });

      if (currentUser) {
        if (currentUser.role === "admin") {
          router.replace("/admin/users");
        } else {
          router.replace("/home");
        }
      } else {
        router.replace("/(auth)/signin");
      }
    }
  }, [currentUser, isLoading]);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}