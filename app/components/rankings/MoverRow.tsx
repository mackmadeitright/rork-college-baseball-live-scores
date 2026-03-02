import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { RankedTeam } from "@/types/baseball";

export interface MoverTeam extends RankedTeam {
  change: number;
  direction: "up" | "down" | "same";
}

export default function MoverRow({ team, isLast }: { team: MoverTeam; isLast: boolean }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.moverRow}
      onPress={() => router.push(`/team/${team.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.moverRank}>
        <Text style={[styles.moverRankText, { color: theme.textSecondary }, team.ranking <= 5 && { color: theme.gold, fontWeight: "700" as const }]}>
          {team.ranking}
        </Text>
      </View>
      <Image source={{ uri: team.logoUrl }} style={styles.moverLogo} contentFit="contain" />
      <View style={styles.moverInfo}>
        <Text style={[styles.moverName, { color: theme.text }]} numberOfLines={1}>{team.name}</Text>
        <Text style={[styles.moverRecord, { color: theme.textMuted }]}>{team.record}</Text>
      </View>
      <View style={[
        styles.moverBadge,
        { backgroundColor: theme.surface },
        team.direction === "up" && { backgroundColor: theme.liveBg },
        team.direction === "down" && { backgroundColor: theme.accentSoft },
      ]}>
        {team.direction === "up" ? (
          <TrendingUp size={12} color={theme.live} />
        ) : team.direction === "down" ? (
          <TrendingDown size={12} color={theme.accent} />
        ) : (
          <Minus size={12} color={theme.textMuted} />
        )}
        <Text style={[
          styles.moverChangeText,
          { color: theme.textMuted },
          team.direction === "up" && { color: theme.live },
          team.direction === "down" && { color: theme.accent },
        ]}>
          {team.direction === "same" ? "—" : Math.abs(team.change)}
        </Text>
      </View>
      <ChevronRight size={14} color={theme.textMuted} />
      {!isLast && <View style={[styles.moverSeparator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  moverRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  moverRank: {
    width: 28,
    alignItems: "center",
  },
  moverRankText: {
    fontSize: 14,
    fontWeight: "600",
  },
  moverLogo: {
    width: 32,
    height: 32,
  },
  moverInfo: {
    flex: 1,
    gap: 2,
  },
  moverName: {
    fontSize: 15,
    fontWeight: "600",
  },
  moverRecord: {
    fontSize: 12,
  },
  moverBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moverChangeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  moverSeparator: {
    position: "absolute",
    bottom: 0,
    left: 54,
    right: 16,
    height: StyleSheet.hairlineWidth,
  },
});
