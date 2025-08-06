// app/_layout.tsx
import { Stack } from 'expo-router';
import { DrawerProvider } from './components/DrawerContext';
import DrawerMenu from './components/DrawerMenu';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/AuthContext';
import { CartProvider } from './src/CartContext';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <CartProvider>
          <DrawerProvider drawerContent={<DrawerMenu />}>
            <Stack screenOptions={{ headerShown: false }} />
          </DrawerProvider>
        </CartProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

