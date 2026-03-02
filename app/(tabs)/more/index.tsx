import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import {
  Search,
  Heart,
  Bell,
  ChevronRight,
  Star,
  Info,
  Shield,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useNotifications } from "@/providers/NotificationsProvider";
import { usePremium } from "@/providers/PremiumProvider";
import { useRouter } from "expo-router";
import { useAllTeams } from "@/hooks/useESPNData";
import { TeamSearchResult } from "@/types/baseball";

function TeamSearchRow({
  team,
  isFav,
  onToggle,
  theme,
}: {
  team: TeamSearchResult;
  isFav: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={[styles.searchRow, { borderBottomColor: theme.separator }]}>
      {team.logoUrl ? (
        <Image source={{ uri: team.logoUrl }} style={styles.searchLogo} contentFit="contain" />
      ) : (
        <View style={[styles.searchLogo, styles.searchLogoPlaceholder, { backgroundColor: theme.surface }]}>
          <Text style={[styles.searchLogoText, { color: theme.textMuted }]}>{team.shortName?.[0] ?? "?"}</Text>
        </View>
      )}
      <View style={styles.searchInfo}>
        <Text style={[styles.searchName, { color: theme.text }]} numberOfLines={1}>{team.name}</Text>
        <Text style={[styles.searchSub, { color: theme.textMuted }]}>{team.shortName}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={12}
        style={[styles.favBtn, { backgroundColor: isFav ? theme.accentSoft : theme.surface }]}
      >
        <Heart
          size={16}
          color={isFav ? theme.accent : theme.textMuted}
          fill={isFav ? theme.accent : "transparent"}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function MoreScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { data: allTeams = [], isLoading: teamsLoading, error: teamsError } = useAllTeams();
  const { mode, toggleTheme, isDark, theme } = useTheme();
  const { settings, updateSetting, sendTestNotification, permissionGranted } = useNotifications();
  const { isPremium } = usePremium();
  const router = useRouter();

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allTeams
      .filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.shortName?.toLowerCase().includes(q) ||
          (t.mascot?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, 30);
  }, [searchQuery, allTeams]);

  const handleToggleFav = useCallback(
    (teamId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleFavorite(teamId);
    },
    [toggleFavorite]
  );

  const handleOpenLink = (url: string) => {
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleThemeToggle} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? "#1E293B" : "#FEF3C7" }]}>
              {isDark ? (
                <Moon size={16} color="#60A5FA" />
              ) : (
                <Sun size={16} color="#F59E0B" />
              )}
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Theme</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>{isDark ? "Dark mode" : "Light mode"}</Text>
            </View>
            <View style={[styles.themePill, { backgroundColor: theme.surface }]}>
              <View style={[styles.themeOption, isDark && { backgroundColor: theme.surfaceLight }]}>
                <Moon size={12} color={isDark ? theme.white : theme.textMuted} />
              </View>
              <View style={[styles.themeOption, !isDark && { backgroundColor: "#FEF3C7" }]}>
                <Sun size={12} color={!isDark ? "#F59E0B" : theme.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>FIND TEAMS</Text>
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Search size={16} color={theme.inputPlaceholder} />
          <TextInput
            style={[styles.searchInput, { color: theme.inputText }]}
            placeholder="Search for a team..."
            placeholderTextColor={theme.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {hasQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
              <View style={[styles.clearBtn, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.clearBtnText, { color: theme.textMuted }]}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {hasQuery && (
          <View style={[styles.searchResults, { backgroundColor: theme.card }]}>
            {teamsLoading ? (
              <ActivityIndicator
                size="small"
                color={theme.accent}
                style={styles.searchLoading}
              />
            ) : teamsError ? (
              <Text style={[styles.noResults, { color: theme.accent }]}>Failed to load teams. Pull down to retry.</Text>
            ) : filteredTeams.length === 0 ? (
              <Text style={[styles.noResults, { color: theme.textMuted }]}>
                {allTeams.length === 0 ? "Loading teams..." : "No teams found"}
              </Text>
            ) : (
              filteredTeams.map((team) => (
                <TeamSearchRow
                  key={team.id}
                  team={team}
                  isFav={isFavorite(team.id)}
                  onToggle={() => handleToggleFav(team.id)}
                  theme={theme}
                />
              ))
            )}
          </View>
        )}

        {favoriteIds.length > 0 && (
          <View style={styles.favCount}>
            <Heart size={13} color={theme.accent} fill={theme.accent} />
            <Text style={[styles.favCountText, { color: theme.textMuted }]}>
              Following {favoriteIds.length} team{favoriteIds.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>NOTIFICATIONS</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.surfaceLight }]}>
              <Bell size={16} color={theme.live} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Live Game Alerts</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>When favorite teams start playing</Text>
            </View>
            <Switch
              value={settings.liveAlerts}
              onValueChange={(v) => updateSetting("liveAlerts", v)}
              trackColor={{ false: theme.switchTrack, true: theme.switchTrackActive }}
              thumbColor={theme.white}
            />
          </View>
          <View style={[styles.settingDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.surfaceLight }]}>
              <Star size={16} color={theme.gold} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Final Score Alerts</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>When favorite team games end</Text>
            </View>
            <Switch
              value={settings.finalAlerts}
              onValueChange={(v) => updateSetting("finalAlerts", v)}
              trackColor={{ false: theme.switchTrack, true: theme.switchTrackActive }}
              thumbColor={theme.white}
            />
          </View>
          <View style={[styles.settingDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.surfaceLight }]}>
              <Heart size={16} color={theme.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Favorite Team Updates</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Close game and scoring alerts</Text>
            </View>
            <Switch
              value={settings.favoriteAlerts}
              onValueChange={(v) => updateSetting("favoriteAlerts", v)}
              trackColor={{ false: theme.switchTrack, true: theme.switchTrackActive }}
              thumbColor={theme.white}
            />
          </View>
          <View style={[styles.settingDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.surfaceLight }]}>
              <Shield size={16} color={theme.blue} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Rankings Updates</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Weekly Top 25 changes</Text>
            </View>
            <Switch
              value={settings.rankingsAlerts}
              onValueChange={(v) => updateSetting("rankingsAlerts", v)}
              trackColor={{ false: theme.switchTrack, true: theme.switchTrackActive }}
              thumbColor={theme.white}
            />
          </View>
        </View>
        {favoriteIds.length === 0 && (
          <Text style={[styles.notifHint, { color: theme.textMuted }]}>
            Add favorite teams above to receive game notifications
          </Text>
        )}
        <TouchableOpacity
          style={[styles.testNotifBtn, { backgroundColor: theme.surface }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await sendTestNotification();
          }}
          activeOpacity={0.7}
        >
          <Bell size={14} color={theme.accent} />
          <Text style={[styles.testNotifText, { color: theme.accent }]}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>PREMIUM</Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: isDark ? "#1B4332" : "#F0FDF4" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/paywall" as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: isDark ? "#2D6A4F" : "#DCFCE7" }]}>
                <Shield size={16} color={isDark ? "#52B788" : "#16A34A"} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Remove Ads</Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Annual subscription • $3.99/year</Text>
              </View>
              <ChevronRight size={14} color={isDark ? "#52B788" : "#16A34A"} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {isPremium && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>PREMIUM</Text>
          <View style={[styles.card, { backgroundColor: isDark ? "#1B4332" : "#F0FDF4" }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: isDark ? "#2D6A4F" : "#DCFCE7" }]}>
                <Shield size={16} color={isDark ? "#52B788" : "#16A34A"} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Premium Active</Text>
                <Text style={[styles.settingDesc, { color: isDark ? "#52B788" : "#16A34A" }]}>Ad-free experience enabled</Text>
              </View>
              <Star size={16} color={isDark ? "#52B788" : "#16A34A"} fill={isDark ? "#52B788" : "#16A34A"} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenLink("https://www.espn.com/college-baseball/")}
          >
            <View style={[styles.settingIcon, { backgroundColor: theme.surfaceLight }]}>
              <ExternalLink size={16} color={theme.textMuted} />
            </View>
            <Text style={[styles.linkText, { color: theme.text }]}>ESPN College Baseball</Text>
            <ChevronRight size={14} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={[styles.settingDivider, { backgroundColor: theme.separator }]} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenLink("https://www.d1baseball.com/")}
          >
            <View style={[styles.settingIcon, { backgroundColor: theme.surfaceLight }]}>
              <ExternalLink size={16} color={theme.textMuted} />
            </View>
            <Text style={[styles.linkText, { color: theme.text }]}>D1Baseball.com</Text>
            <ChevronRight size={14} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={[styles.settingDivider, { backgroundColor: theme.separator }]} />
          <View style={styles.linkRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.surfaceLight }]}>
              <Info size={16} color={theme.textMuted} />
            </View>
            <Text style={[styles.linkText, { color: theme.text }]}>Version 1.0.0</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.footer, { color: theme.textMuted }]}>
        Dugout: College Baseball Live{"\n"}Data provided by ESPN. Not affiliated with NCAA or ESPN.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  searchResults: {
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 300,
    overflow: "hidden",
  },
  searchLoading: {
    padding: 20,
  },
  noResults: {
    fontSize: 13,
    padding: 16,
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchLogo: {
    width: 28,
    height: 28,
  },
  searchLogoPlaceholder: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchLogoText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  searchInfo: {
    flex: 1,
    gap: 1,
  },
  searchName: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  searchSub: {
    fontSize: 11,
  },
  favBtn: {
    padding: 6,
    borderRadius: 14,
  },
  favCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  favCountText: {
    fontSize: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  settingDesc: {
    fontSize: 11,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500" as const,
    flex: 1,
  },
  footer: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  notifHint: {
    fontSize: 11,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  testNotifBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  testNotifText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  themePill: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 3,
    gap: 2,
  },
  themeOption: {
    width: 30,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
