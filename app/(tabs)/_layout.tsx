import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="home" size={24} color={focused ? '#fff' : '#FFD6D6'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="chatbubble-ellipses" size={24} color={focused ? '#fff' : '#FFD6D6'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Add"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.plusIcon}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="bag-handle" size={24} color={focused ? '#fff' : '#FFD6D6'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="person" size={24} color={focused ? '#fff' : '#FFD6D6'} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f66',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 75,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 10, 
  },
  plusIcon: {
    backgroundColor: '#000',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: '#fff',
  },
});
