/**
 * AppNavigator — Stack + Bottom Tab Navigation
 */

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

import { SplashScreen } from '../screens/SplashScreen';
import { AddVehicleScreen } from '../screens/AddVehicleScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VehicleDetailScreen } from '../screens/VehicleDetailScreen';
import { OilChangeScreen } from '../screens/OilChangeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TourGuidePopup } from '../components/TourGuidePopup';

import { Home, ClipboardList, Settings } from 'lucide-react-native';

type RootStackParamList = {
  Splash: undefined;
  AddVehicle: { isModal?: boolean } | undefined;
  MainTabs: undefined;
  OilChange: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ IconComponent, label, focused }: { IconComponent: any; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.container, focused && tabStyles.containerFocused]}>
      <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperFocused]}>
        <IconComponent
          size={focused ? 20 : 21}
          color={focused ? colors.primary : colors.textTertiary}
          strokeWidth={focused ? 2.4 : 1.8}
        />
      </View>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
      {focused && <View style={tabStyles.activeDot} />}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    minWidth: 64,
  },
  containerFocused: {
    transform: [{ translateY: -2 }],
  },
  iconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  iconWrapperFocused: {
    backgroundColor: colors.surfaceDim,
  },
  label: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
});

function MainTabs({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? bottomInset : 12,
          left: 16,
          right: 16,
          borderRadius: 28,
          height: 66,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 12,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={Home} label="Beranda" focused={focused} />,
        }}
      >
        {() => (
          <DashboardScreen
            onAddVehicle={() => navigation.navigate('AddVehicle', { isModal: true })}
            onOilChange={() => navigation.navigate('OilChange')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Detail"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={ClipboardList} label="Riwayat" focused={focused} />,
        }}
      >
        {() => (
          <VehicleDetailScreen
            onOilChange={() => navigation.navigate('OilChange')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={Settings} label="Pengaturan" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'AddVehicle' | 'MainTabs'>('AddVehicle');

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={(hasVehicle) => {
          setInitialRoute(hasVehicle ? 'MainTabs' : 'AddVehicle');
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="AddVehicle">
            {({ navigation, route }) => (
              <AddVehicleScreen
                onComplete={() => navigation.replace('MainTabs')}
                onBack={route.params?.isModal ? () => navigation.goBack() : undefined}
                isModal={route.params?.isModal}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="OilChange" options={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
            {({ navigation }) => (
              <OilChangeScreen
                onComplete={() => navigation.goBack()}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <TourGuidePopup />
    </>
  );
}

