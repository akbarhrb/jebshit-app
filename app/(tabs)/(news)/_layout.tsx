import { Stack } from 'expo-router';

export default function NewsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'الأخبار' }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
