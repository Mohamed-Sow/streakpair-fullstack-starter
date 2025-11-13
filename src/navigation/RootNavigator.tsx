import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Flame, User } from "lucide-react-native";

import type { BottomTabParamList, RootStackParamList } from "@/navigation/types";
import HomeScreen from "@/screens/HomeScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import AuthScreen from "@/screens/AuthScreen";
import CreateStreakScreen from "@/screens/CreateStreakScreen";
import StreakDetailScreen from "@/screens/StreakDetailScreen";
import CheckInScreen from "@/screens/CheckInScreen";
import PhotoGalleryScreen from "@/screens/PhotoGalleryScreen";
import InsightsScreen from "@/screens/InsightsScreen";

/**
 * RootStackNavigator
 * The root navigator for the app, which contains the bottom tab navigator and all the screens inside it
 * Most of the new screens will go here
 */
const RootStack = createNativeStackNavigator<RootStackParamList>();
const RootNavigator = () => {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AuthScreen"
        component={AuthScreen}
        options={{ presentation: "modal", title: "Sign In" }}
      />
      <RootStack.Screen
        name="CreateStreakScreen"
        component={CreateStreakScreen}
        options={{ title: "Create Streak", presentation: "modal" }}
      />
      <RootStack.Screen
        name="StreakDetailScreen"
        component={StreakDetailScreen}
        options={{ title: "Streak Details" }}
      />
      <RootStack.Screen
        name="CheckInScreen"
        component={CheckInScreen}
        options={{ title: "Check In", presentation: "modal" }}
      />
      <RootStack.Screen
        name="PhotoGalleryScreen"
        component={PhotoGalleryScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
      <RootStack.Screen
        name="InsightsScreen"
        component={InsightsScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
    </RootStack.Navigator>
  );
};

/**
 * BottomTabNavigator
 * The bottom tab navigator for the app, which containers ONLY the bottom tab screens
 * If you want to add a new screen, you should add it here
 */
const BottomTab = createBottomTabNavigator<BottomTabParamList>();
const BottomTabNavigator = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
        },
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
        ),
      }}
      screenListeners={() => ({
        transitionStart: () => {
          Haptics.selectionAsync();
        },
      })}
    >
      <BottomTab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, size }) => <Flame size={size} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
};

export default RootNavigator;
