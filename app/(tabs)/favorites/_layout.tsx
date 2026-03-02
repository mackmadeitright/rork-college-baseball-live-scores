import { Stack } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";

export default function FavoritesLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: "700" as const },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Teams" }} />
    </Stack>
  );
}
