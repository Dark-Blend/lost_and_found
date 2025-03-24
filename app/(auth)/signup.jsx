import { View, Text, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import images from "../../constants/images";
import FormField from "../../components/FormField";
import Button from "../../components/Button";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignUp } from "../../services/authService";
import { createUser } from "../../services/databaseService";
import { createAvatar } from "../../services/utilServices";
import { useGlobalContext } from "../../context/GlobalProvider";

const Signup = () => {
  const { setCurrentUser } = useGlobalContext();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChangeText = (text, field) => {
    setForm({ ...form, [field]: text });
  };

  const handleSignup = async () => {
    if(form.email === '' || form.username === '' || form.password === '' || form.confirmPassword === ''){
      Alert.alert('Error',"Please fill in all the fields" )
    }else{
      if (form.password !== form.confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
      setLoading(true);
      try {
        const authUser = await SignUp(form.email, form.password);

        // Auth success
        if (authUser) {
          Alert.alert("Success", "Sign up successful");
          console.log("auth user : " , authUser)
          
          // adding user to database
          try{
            const userData = {
              email: form.email,
              username: form.username,
              avatar: createAvatar(form.username),
              bio : '',
              createdAt : new Date(),
              role : 'user',
            };
            const userId = await createUser(userData , authUser.uid);
            if(userId){
              console.log("User created with ID: ", userId);
              setCurrentUser(authUser);
              setLoading(false);
              router.push('/home');
            }
          }catch(error){
            console.error("Error creating user: ", error);
            setLoading(false);
          }
        } else {
          throw new Error("Sign up failed");
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar hidden />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 items-center justify-center gap-4 p-7">
            <Image
              source={images.logo}
              className="w-28 h-28 mb-2"
              resizeMode="contain"
            />
            <Text className="text-3xl font-poppins-light text-center text-black">
              Sign up to <Text className="font-poppins-bold">Lost & Found</Text>
            </Text>
            <FormField
              title="Username"
              placeholder="Enter your username"
              value={form.username}
              setValue={(text) => handleChangeText(text, "username")}
              secureTextEntry={false}
            />
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
            <FormField
              title="Confirm Password"
              placeholder="............."
              value={form.confirmPassword}
              setValue={(text) => handleChangeText(text, "confirmPassword")}
              secureTextEntry={true}
            />
            <Button title="Sign up" onPress={handleSignup} className="mt-2" />
            <Text className="text-center text-black/70 font-poppins-light text-base">
              Already have an account?{" "}
              <Link href="/signin">
                <Text className="font-poppins-bold">Sign in</Text>
              </Link>
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Signup;