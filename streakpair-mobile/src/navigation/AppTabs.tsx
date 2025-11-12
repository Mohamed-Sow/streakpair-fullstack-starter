import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';

// Import screens (we'll create these later)
import DashboardScreen from '@/screens/app/DashboardScreen';
import StreaksScreen from '@/screens/app/StreaksScreen';
import ProfileScreen from '@/screens/app/ProfileScreen';

const Tab = createBottomTabNavigator();

const AppTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon: string;

          switch (route.name) {
            case 'Dashboard':
              icon = '🏠';
              break;
            case 'Streaks':
              icon = '🔥';
              break;
            case 'Profile':
              icon = '👤';
              break;
            default:
              icon = '❓';
          }

          return <Text style={{ fontSize: size, color }}>{icon}</Text>;
        },
        tabBarActiveTintColor: '#0891b2',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTintColor: '#1e293b',
        headerTitleStyle: styles.headerTitle,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Streaks"
        component={StreaksScreen}
        options={{
          title: 'My Streaks',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 8,
    paddingTop: 8,
    height: 80,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
});

export default AppTabs;