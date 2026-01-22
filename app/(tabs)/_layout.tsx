import { Tabs } from 'expo-router';
import { Newspaper, Users, BookOpen } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'Cairo-Bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الأخبار',
          tabBarIcon: ({ size, color }) => (
            <Newspaper size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="martyrs"
        options={{
          title: 'الشهداء',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sheikh"
        options={{
          title: 'الشيخ راغب حرب',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
