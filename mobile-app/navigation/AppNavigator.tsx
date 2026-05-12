import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BrowseScreen from '../screens/BrowseScreen';
import ClosetDetailScreen from '../screens/ClosetDetailScreen';
import CoatsScreen from '../screens/CoatsScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedScreen from '../screens/SavedScreen';
import TrailerScreen from '../screens/TrailerScreen';

export type RootStackParamList = {
  Tabs: undefined;
  ClosetDetail: { closetId: string };
  Coats: { closetId: string };
  Trailer: { ytTrailerId: string };
};

export type TabParamList = {
  Home: undefined;
  Browse: undefined;
  Saved: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '#111' }, headerTintColor: '#fff', tabBarStyle: { backgroundColor: '#111' }, tabBarActiveTintColor: '#4eb8ff', tabBarInactiveTintColor: '#c9c9c9' }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#111' }, headerTintColor: '#fff', contentStyle: { backgroundColor: '#0a0a0a' } }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ClosetDetail" component={ClosetDetailScreen} options={{ title: 'Closet Details' }} />
        <Stack.Screen name="Coats" component={CoatsScreen} options={{ title: 'Items' }} />
        <Stack.Screen name="Trailer" component={TrailerScreen} options={{ title: 'Lookbook' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
