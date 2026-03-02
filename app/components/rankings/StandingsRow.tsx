import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { StandingsTeamEntry } from "@/types/baseball";

export default function StandingsRow({ team, isLast }: { team: StandingsTeamEntry; isLast: boolean }) {
  const router = useRouter();
  const { theme } = useTheme();
  const diffNum = parseInt(team.runDifferential.replace("+", ""), 10) || 0;

  return (
    <TouchableOpacity
      style={styles.standingsRow}
      onPress={() => router.push(`/team/${team.id}` as any)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: team.logoUrl }} style={styles.standingsLogo} contentFit="contain" />
      <View style={styles.standingsTeamInfo}>
        <Text style={[styles.standingsTeamName, { color: theme.text }]} numberOfLines={1}>{team.name}</Text>
        <Text style={[styles.standingsRecord, { color: theme.textMuted }]}>{team.wins}-{team.losses}</Text>
      </View>
      <Text style={[styles.standingsStatCol, { color: theme.textSecondary }]}>{team.winPct}</Text>
      <Text style={[styles.standingsStatCol, { color: theme.textSecondary }]}>{team.gamesBehind}</Text>
      <Text style={[
        styles.standingsStatCol,
        { color: theme.textSecondary },
        team.streak.startsWith("W") && { color: theme.live, fontWeight: "600" as const },
        team.streak.startsWith("L") && { color: theme.accent, fontWeight: "600" as const },
      ]}>{team.streak}</Text>
      <Text style={[
        styles.standingsStatCol,
        { color: theme.textSecondary },
        diffNum > 0 && { color: theme.live },
        diffNum < 0 && { color: theme.accent },
      ]}>{team.runDifferential}</Text>
      <View style={styles.chevronContainer}>
        <ChevronRight size={12} color={theme.textMuted} />
      </View>
      {!isLast && <View style={[styles.standingsSeparator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  standingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  standingsLogo: {
    width: 24,
    height: 24,
  },
  standingsTeamInfo: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  standingsTeamName: {
    fontSize: 13,
    fontWeight: "600",
  },
  standingsRecord: {
    fontSize: 11,
  },
  standingsStatCol: {
    fontSize: 12,
    fontWeight: "500",
    width: 36,
    textAlign: "center",
  },
  chevronContainer: {
    width: 12,
    alignItems: "center",
  },
  standingsSeparator: {
    position: "absolute",
    bottom: 0,
    left: 54,
    right: 16,
    height: StyleSheet.hairlineWidth,
  },
});
