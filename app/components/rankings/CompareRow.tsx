import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";

export interface CompareTeamEntry {
  id: string;
  name: string;
  logoUrl: string;
  rankings: { pollIndex: number; pollName: string; rank: number | null }[];
  avgRank: number;
  highestRank: number;
}

export default function CompareRow({ team, pollCount, isLast }: { team: CompareTeamEntry; pollCount: number; isLast: boolean }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.compareRow}
      onPress={() => router.push(`/team/${team.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.compareLeft}>
        <Text style={[styles.compareAvgRank, { color: theme.textSecondary }]}>{Math.round(team.avgRank)}</Text>
        <Image source={{ uri: team.logoUrl }} style={styles.compareLogo} contentFit="contain" />
        <Text style={[styles.compareName, { color: theme.text }]} numberOfLines={1}>{team.name}</Text>
      </View>
      <View style={styles.compareRanks}>
        {team.rankings.map((r, i) => (
          <View
            key={i}
            style={[
              styles.compareRankCell,
              r.rank === team.highestRank && r.rank !== null && { backgroundColor: theme.liveBg },
            ]}
          >
            <Text
              style={[
                styles.compareRankNum,
                { color: theme.textSecondary },
                r.rank === null && { color: theme.textMuted, fontSize: 11, fontWeight: "400" as const },
                r.rank === team.highestRank && r.rank !== null && { color: theme.live, fontWeight: "700" as const },
              ]}
            >
              {r.rank ?? "NR"}
            </Text>
          </View>
        ))}
      </View>
      {!isLast && <View style={[styles.compareSeparator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  compareLeft: {
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compareAvgRank: {
    fontSize: 13,
    fontWeight: "700",
    width: 22,
    textAlign: "center",
  },
  compareLogo: {
    width: 24,
    height: 24,
  },
  compareName: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  compareRanks: {
    flex: 1,
    flexDirection: "row",
  },
  compareRankCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  compareRankNum: {
    fontSize: 13,
    fontWeight: "600",
  },
  compareSeparator: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: StyleSheet.hairlineWidth,
  },
});
