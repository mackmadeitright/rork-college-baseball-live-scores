import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavoritesProvider } from "@/providers/FavoritesProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { PremiumProvider } from "@/providers/PremiumProvider";

SplashScreen.preventAutoHideAsync();

const CACHE_KEY = "rq_cache";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60,
      staleTime: 1000 * 30,
    },
  },
});

let persistTimeout: ReturnType<typeof setTimeout> | null = null;
let isPersisting = false;

function schedulePersistCache() {
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    if (isPersisting) return;
    isPersisting = true;
    persistCache().finally(() => {
      isPersisting = false;
    });
  }, 2000);
}

async function persistCache() {
  try {
    const cache = queryClient.getQueryCache().getAll();
    const serializable = cache
      .filter((q) => q.state.data !== undefined)
      .slice(0, 15)
      .map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
        dataUpdatedAt: q.state.dataUpdatedAt,
      }));
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(serializable));
    console.log(`[Cache] Persisted ${serializable.length} queries`);
  } catch (e) {
    console.log("[Cache] Failed to persist:", e);
  }
}

async function restoreCache() {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    if (!stored) return;
    const entries = JSON.parse(stored) as Array<{ queryKey: unknown[]; data: unknown; dataUpdatedAt: number }>;
    for (const entry of entries) {
      queryClient.setQueryData(entry.queryKey, entry.data, {
        updatedAt: entry.dataUpdatedAt,
      });
    }
    console.log(`[Cache] Restored ${entries.length} queries`);
  } catch (e) {
    console.log("[Cache] Failed to restore:", e);
  }
}

function RootLayoutNav() {
  const { theme, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="game/[id]"
        options={{
          title: "",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="team/[id]"
        options={{
          title: "",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    restoreCache().then(() => {
      SplashScreen.hideAsync();
    });

    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      schedulePersistCache();
    });

    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <ThemeProvider>
          <FavoritesProvider>
            <PremiumProvider>
              <NotificationsProvider>
                <RootLayoutNav />
              </NotificationsProvider>
            </PremiumProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
