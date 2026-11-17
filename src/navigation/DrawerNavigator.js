import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import CardsScreen from '../screens/CardsScreen';
import TransferScreen from '../screens/TransferScreen';
import ActivityScreen from '../screens/ActivityScreen';
import CameraScreen from '../screens/CameraScreen';
import LocationScreen from '../screens/LocationScreen';
import SensorScreen from '../screens/SensorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BankDrawerContent from '../components/BankDrawerContent';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

const screenIcons = {
  Inicio: 'grid-outline',
  Tarjetas: 'card-outline',
  Transferir: 'swap-horizontal-outline',
  Actividad: 'receipt-outline',
  'Escáner QR': 'scan-outline',
  Sucursales: 'location-outline',
  Seguridad: 'shield-checkmark-outline',
  Perfil: 'person-outline',
};

function drawerOptions(route) {
  return {
    title: route.name,
    drawerLabel: route.name,
    drawerIcon: ({ color, size }) => (
      <Ionicons name={screenIcons[route.name]} size={size} color={color} />
    ),
  };
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      drawerContent={(props) => <BankDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        ...drawerOptions(route),
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        sceneStyle: { backgroundColor: colors.background },
        drawerStyle: { width: 300, backgroundColor: colors.background },
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: '#B8B8C5',
        drawerActiveBackgroundColor: 'rgba(255,255,255,0.09)',
        drawerItemStyle: { borderRadius: 12, marginHorizontal: 10, marginVertical: 2 },
        drawerLabelStyle: { fontSize: 14, fontWeight: '600', marginLeft: -14 },
        overlayColor: 'rgba(13, 14, 24, 0.55)',
      })}
    >
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen name="Tarjetas" component={CardsScreen} />
      <Drawer.Screen name="Transferir" component={TransferScreen} />
      <Drawer.Screen name="Actividad" component={ActivityScreen} />
      <Drawer.Screen name="Escáner QR" component={CameraScreen} />
      <Drawer.Screen name="Sucursales" component={LocationScreen} />
      <Drawer.Screen name="Seguridad" component={SensorScreen} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
