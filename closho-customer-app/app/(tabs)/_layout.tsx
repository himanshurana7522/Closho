import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { StoreSelector } from '../../src/components/shop/StoreSelector';
import { useCartStore } from '../../src/store/cartStore';

export default function TabsLayout() {
  const { items } = useCartStore();
  return (
    <Tabs
      initialRouteName="reels"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        headerTintColor: colors.text.primary,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        headerLeft: () => <StoreSelector />,
        headerTitle: '', // We use left component for store selector
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: 'Reels',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={size + 6} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cart" : "cart-outline"} size={size + 2} color={color} />
          ),
          tabBarBadge: items.length > 0 ? items.length : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.status.error },
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size + 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
