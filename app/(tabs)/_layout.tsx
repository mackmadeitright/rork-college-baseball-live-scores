import { Tabs } from "expo-router";
import { Activity, Trophy, Heart, Newspaper, Menu, DollarSign } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="scores" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="news" />
      <Tabs.Screen name="picks" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
