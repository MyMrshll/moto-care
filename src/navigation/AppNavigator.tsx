/**
 * AppNavigator — Stack + Bottom Tab Navigation 🧭
 * Fitur 1.1.0: 4 Main Tabs (Beranda, Garasi Motor, Detail & Riwayat, Pengaturan)
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { notificationService } from '../services/notificationService';
import { useAppStore } from '../store/useAppStore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

import { SplashScreen } from '../screens/SplashScreen';
import { AddVehicleScreen } from '../screens/AddVehicleScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VehicleListScreen } from '../screens/VehicleListScreen';
import { VehicleDetailScreen } from '../screens/VehicleDetailScreen';
import { OilChangeScreen } from '../screens/OilChangeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TourGuidePopup } from '../components/TourGuidePopup';

import { Home, Bike, ClipboardList, Settings } from 'lucide-react-native';

type RootStackParamList = {
  Splash: undefined;
  AddVehicle: { isModal?: boolean } | undefined;
  MainTabs: { screen?: string } | undefined;
  VehicleDetailStack: { vehicleId: string };
  OilChange: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ IconComponent, label, focused }: { IconComponent: any; label: string; focused: boolean }) {
  return (
    <View style={tabStyles.container}>
      <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperFocused]}>
        <IconComponent
          size={19}
          color={focused ? colors.primary : colors.textTertiary}
          strokeWidth={focused ? 2.3 : 1.8}
        />
      </View>
      <Text
        style={[tabStyles.label, focused && tabStyles.labelFocused]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
      {focused ? (
        <View style={tabStyles.activeDot} />
      ) : (
        <View style={tabStyles.activeDotPlaceholder} />
      )}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapperFocused: {
    backgroundColor: '#E6F4EA',
  },
  label: {
    fontSize: 9.5,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
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
    marginTop: 2,
  },
  activeDotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
});

function MainTabs({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom + 6, 12);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          position: 'absolute',
          bottom: bottomInset,
          left: 14,
          right: 14,
          borderRadius: 24,
          height: 66,
          paddingBottom: 4,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
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
        name="VehicleList"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={Bike} label="Garasi" focused={focused} />,
        }}
      >
        {() => (
          <VehicleListScreen
            onAddVehicle={() => navigation.navigate('AddVehicle', { isModal: true })}
            onViewDetail={(vehicleId: string) =>
              navigation.navigate('VehicleDetailStack', { vehicleId })
            }
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
            onAddVehicle={() => navigation.navigate('AddVehicle', { isModal: true })}
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
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (showSplash) return;

    const unsubscribe = notificationService.setupResponseListener((data) => {
      if (data?.vehicleId) {
        useAppStore.getState().setActiveVehicle(data.vehicleId);
      }

      if (navigationRef.isReady()) {
        if (data?.screen === 'OilChange') {
          navigationRef.navigate('OilChange' as never);
        } else {
          navigationRef.navigate('MainTabs' as never);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showSplash, navigationRef]);

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
      <NavigationContainer ref={navigationRef}>
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

          <Stack.Screen name="VehicleDetailStack">
            {({ navigation, route }) => (
              <VehicleDetailScreen
                vehicleId={route.params?.vehicleId}
                onOilChange={() => navigation.navigate('OilChange')}
                onBack={() => navigation.goBack()}
                onAddVehicle={() => navigation.navigate('AddVehicle', { isModal: true })}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="OilChange"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          >
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
