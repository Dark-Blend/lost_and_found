import { View, Text, Alert, Image, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import images from "../../constants/images";
import FormField from "../../components/FormField";
import Button from "../../components/Button";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignIn } from "../../services/authService";
import { useGlobalContext } from "../../context/GlobalProvider";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

const signin = () => {
  const { setCurrentUser } = useGlobalContext();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChangeText = (text, field) => {
    setForm({ ...form, [field]: text });
  };

  const handleSignin = async () => {
    if(form.email === "" || form.password === ""){
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await SignIn(form.email, form.password);
      if (userCredential) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Merge Firebase Auth user with Firestore data
          const userWithRole = {
            ...userCredential.user,
            role: userData.role || 'user'
          };
          console.log("User signed in with role:", userWithRole.role);
          setCurrentUser(userWithRole);
          Alert.alert("Success", "Sign in successful");
          
          // Redirect based on role
          if (userData.role === 'admin') {
            router.replace("/admin/users");
          } else {
            router.replace("/home");
          }
        } else {
          console.error("User document not found in Firestore");
          setCurrentUser(userCredential.user);
          router.replace("/home");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <StatusBar hidden />
      {loading ? (
        <View className="flex h-screen items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View className="flex h-screen items-center justify-center gap-5 p-7">
          <Image
            source={images.logo}
            className="w-28 h-28 mb-2"
            resizeMode="contain"
          />
          <Text className="text-3xl font-poppins-light text-center text-black">
            Sign in to <Text className="font-poppins-bold">Lost & Found</Text>
          </Text>
          <FormField
            title="Email"
            placeholder="Enter your email"
            value={form.email}
            setValue={(text) => handleChangeText(text, "email")}
            secureTextEntry={false}
          />
          <FormField
            title="Password"
            placeholder="............."
            value={form.password}
            setValue={(text) => handleChangeText(text, "password")}
            secureTextEntry={true}
          />
          <Button title="Sign in" onPress={handleSignin} className={"mt-2"} />
          <Text className="text-center text-black/70 font-poppins-light text-base">
            Don't have an account?{" "}
            <Link href="/signup">
              <Text className="font-poppins-bold">Sign up</Text>
            </Link>
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default signin;
