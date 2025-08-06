// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'SplashScreen',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
