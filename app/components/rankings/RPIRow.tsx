import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { RankedTeam } from "@/types/baseball";

export default function RPIRow({ team, isLast }: { team: RankedTeam; isLast: boolean }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.rpiRow}
      onPress={() => {
        if (!team.id.startsWith("rpi-")) {
          router.push(`/team/${team.id}` as any);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.rpiRank}>
        <Text style={[
          styles.rpiRankText,
          { color: theme.textSecondary },
          team.ranking <= 10 && { color: theme.gold, fontWeight: "700" as const },
          team.ranking <= 25 && team.ranking > 10 && { color: theme.text, fontWeight: "600" as const },
        ]}>{team.ranking}</Text>
      </View>
      {team.logoUrl ? (
        <Image source={{ uri: team.logoUrl }} style={styles.rpiLogo} contentFit="contain" />
      ) : (
        <View style={[styles.rpiLogoPlaceholder, { backgroundColor: theme.surface }]}>
          <Text style={[styles.rpiLogoText, { color: theme.textMuted }]}>
            {team.shortName?.substring(0, 2) ?? "?"}
          </Text>
        </View>
      )}
      <View style={styles.rpiInfo}>
        <Text style={[styles.rpiName, { color: theme.text }]} numberOfLines={1}>{team.name}</Text>
        <Text style={[styles.rpiConf, { color: theme.textMuted }]} numberOfLines={1}>
          {team.conference || team.record}
        </Text>
      </View>
      <View style={styles.rpiStats}>
        <Text style={[styles.rpiRecord, { color: theme.textSecondary }]}>{team.record}</Text>
        {team.rpiValue ? (
          <View style={[styles.rpiBadge, { backgroundColor: theme.surface }]}>
            <Text style={[styles.rpiBadgeText, { color: team.ranking <= 25 ? theme.live : theme.textSecondary }]}>
              {team.rpiValue}
            </Text>
          </View>
        ) : null}
      </View>
      {team.sosRank ? (
        <View style={styles.rpiSosCol}>
          <Text style={[styles.rpiSosLabel, { color: theme.textMuted }]}>SOS</Text>
          <Text style={[styles.rpiSosValue, { color: theme.textSecondary }]}>#{team.sosRank}</Text>
        </View>
      ) : null}
      <ChevronRight size={12} color={theme.textMuted} />
      {!isLast && <View style={[styles.rpiSeparator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rpiRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
  },
  rpiRank: {
    width: 28,
    alignItems: "center",
  },
  rpiRankText: {
    fontSize: 14,
    fontWeight: "600",
  },
  rpiLogo: {
    width: 28,
    height: 28,
  },
  rpiLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rpiLogoText: {
    fontSize: 10,
    fontWeight: "700",
  },
  rpiInfo: {
    flex: 1,
    gap: 1,
  },
  rpiName: {
    fontSize: 14,
    fontWeight: "600",
  },
  rpiConf: {
    fontSize: 11,
  },
  rpiStats: {
    alignItems: "flex-end",
    gap: 3,
  },
  rpiRecord: {
    fontSize: 12,
    fontWeight: "500",
  },
  rpiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rpiBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  rpiSosCol: {
    width: 40,
    alignItems: "center",
    gap: 1,
  },
  rpiSosLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
  rpiSosValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  rpiSeparator: {
    position: "absolute",
    bottom: 0,
    left: 52,
    right: 16,
    height: StyleSheet.hairlineWidth,
  },
});
