import React from "react";
import { View, ImageBackground } from "react-native";
import LoginWithEmailPassword from "@/components/LoginWithEmailPassword";

const AuthScreen = () => {
  return (
    <ImageBackground
      source={require("../../assets/background-1763006249568.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.85)" }}>
        <LoginWithEmailPassword />
      </View>
    </ImageBackground>
  );
};

export default AuthScreen;
