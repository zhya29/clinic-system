import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen    from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PatientsScreen  from './src/screens/PatientsScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import PaymentsScreen  from './src/screens/PaymentsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'داشبۆرد',    component: DashboardScreen,    icon: '▦' },
  { name: 'نەخۆشەکان',  component: PatientsScreen,     icon: '♡' },
  { name: 'کاتژمێرەکان', component: AppointmentsScreen, icon: '◷' },
  { name: 'پارەدان',    component: PaymentsScreen,      icon: '$' },
];

export default function App() {
  const [authed, setAuthed]   = useState(false);
  const [checked, setChecked] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem('access_token').then(t => {
      setAuthed(!!t);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!authed)  return <LoginScreen onLogin={() => setAuthed(true)} />;

  const MyTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: '#534AB7',
      background: scheme === 'dark' ? '#0f0f1a' : '#f0f4f8',
      card:       scheme === 'dark' ? '#1e1e2e' : '#ffffff',
      text:       scheme === 'dark' ? '#e8e8f0' : '#1a1a2e',
      border:     scheme === 'dark' ? '#2e2e3e' : '#e2e8f0',
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: scheme === 'dark' ? '#1e1e2e' : '#534AB7',
          },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          tabBarActiveTintColor:   '#534AB7',
          tabBarInactiveTintColor: scheme === 'dark' ? '#666' : '#999',
          tabBarStyle: {
            backgroundColor: scheme === 'dark' ? '#1e1e2e' : '#fff',
            borderTopColor:  scheme === 'dark' ? '#2e2e3e' : '#e2e8f0',
            paddingBottom: 6,
            height: 62,
          },
          tabBarIcon: ({ color, focused }) => {
            const tab = TABS.find(t => t.name === route.name);
            return (
              <Text style={{ fontSize: focused ? 22 : 18, color }}>
                {tab?.icon ?? '•'}
              </Text>
            );
          },
        })}
      >
        {TABS.map(tab => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
