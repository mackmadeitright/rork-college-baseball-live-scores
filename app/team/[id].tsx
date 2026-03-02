import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Heart, Calendar, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTeamSchedule } from "@/hooks/useESPNData";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useTheme } from "@/providers/ThemeProvider";

interface ScheduleGame {
  id: string;
  date: string;
  opponent: string;
  opponentLogo: string;
  isHome: boolean;
  score?: string;
  result?: "W" | "L" | "T";
  status: "pre" | "in" | "post";
  statusText: string;
  opponentRank?: number;
}

function parseScheduleEvents(events: any[], teamId: string): ScheduleGame[] {
  return events.map((event) => {
    const comp = event.competitions?.[0];
    const status = comp?.status ?? event.status;
    const state = status?.type?.state ?? "pre";

    const competitors = comp?.competitors ?? [];
    const home = competitors.find((c: any) => c.homeAway === "home");
    const away = competitors.find((c: any) => c.homeAway === "away");

    const thisTeamIsHome = home?.team?.id === teamId || home?.team?.abbreviation === teamId;
    const thisTeam = thisTeamIsHome ? home : away;
    const opponent = thisTeamIsHome ? away : home;
    const isHome = thisTeamIsHome;

    const opponentName = opponent?.team?.displayName ?? event.shortName ?? "TBD";
    const opponentLogo = opponent?.team?.logos?.[0]?.href ?? opponent?.team?.logo ?? "";
    const opponentRank = opponent?.curatedRank?.current;

    let score: string | undefined;
    let result: "W" | "L" | "T" | undefined;

    if (state === "post" && home?.score && away?.score) {
      const homeScore = home.score.displayValue ?? home.score;
      const awayScore = away.score.displayValue ?? away.score;
      score = `${awayScore} - ${homeScore}`;
      if (thisTeam?.winner === true) result = "W";
      else if (opponent?.winner === true) result = "L";
      else result = "T";
    } else if (state === "in" && home?.score && away?.score) {
      const homeScore = home.score.displayValue ?? home.score;
      const awayScore = away.score.displayValue ?? away.score;
      score = `${awayScore} - ${homeScore}`;
    }

    let dateStr = "";
    try {
      const d = new Date(event.date);
      dateStr = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      dateStr = event.date ?? "";
    }

    let statusText = "";
    if (state === "post") {
      statusText = status?.type?.shortDetail ?? "Final";
    } else if (state === "in") {
      statusText = status?.type?.shortDetail ?? "Live";
    } else {
      try {
        const d = new Date(event.date);
        statusText = d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      } catch {
        statusText = "TBD";
      }
    }

    return {
      id: event.id,
      date: dateStr,
      opponent: opponentName,
      opponentLogo,
      isHome,
      score,
      result,
      status: state,
      statusText,
      opponentRank: opponentRank && opponentRank <= 25 ? opponentRank : undefined,
    };
  });
}

function ScheduleRow({
  game,
  isLast,
  onPress,
}: {
  game: ScheduleGame;
  isLast: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const isLive = game.status === "in";

  return (
    <TouchableOpacity style={styles.scheduleRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.scheduleDate}>
        <Text style={[styles.scheduleDateText, { color: theme.textMuted }]}>{game.date}</Text>
      </View>
      <View style={styles.scheduleMain}>
        <View style={styles.scheduleOpponent}>
          {game.opponentLogo ? (
            <Image
              source={{ uri: game.opponentLogo }}
              style={styles.opponentLogo}
              contentFit="contain"
            />
          ) : (
            <View style={[styles.opponentLogo, styles.opponentLogoPlaceholder, { backgroundColor: theme.surface }]} />
          )}
          <View style={styles.opponentInfo}>
            <View style={styles.opponentNameRow}>
              {game.opponentRank && (
                <Text style={[styles.opponentRank, { color: theme.gold }]}>#{game.opponentRank}</Text>
              )}
              <Text style={[styles.opponentName, { color: theme.text }]} numberOfLines={1}>
                {game.opponent}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.scheduleResult}>
          {game.result && (
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: theme.surface },
                game.result === "W" && { backgroundColor: theme.liveBg },
                game.result === "L" && { backgroundColor: theme.accentSoft },
              ]}
            >
              <Text
                style={[
                  styles.resultText,
                  { color: theme.textMuted },
                  game.result === "W" && { color: theme.live },
                  game.result === "L" && { color: theme.accent },
                ]}
              >
                {game.result}
              </Text>
            </View>
          )}
          {isLive && (
            <View style={[styles.liveBadge, { backgroundColor: theme.liveBg }]}>
              <View style={[styles.liveDotSmall, { backgroundColor: theme.live }]} />
              <Text style={[styles.liveSmallText, { color: theme.live }]}>LIVE</Text>
            </View>
          )}
          <Text style={[styles.scheduleScore, { color: theme.textSecondary }, isLive && { color: theme.live, fontWeight: "700" as const }]}>
            {game.score ?? game.statusText}
          </Text>
        </View>
      </View>
      <ChevronRight size={14} color={theme.textMuted} />
      {!isLast && <View style={[styles.rowSeparator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
}

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data, isLoading, refetch } = useTeamSchedule(id);

  const teamInfo = data?.team;
  const scheduleGames = useMemo(
    () => parseScheduleEvents(data?.events ?? [], id ?? ""),
    [data?.events, id]
  );
  const favorited = isFavorite(id ?? "");

  const overallRecord = teamInfo?.record?.items?.find(
    (r: any) => r.type === "total"
  )?.summary;

  const handleToggleFav = () => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(id);
  };

  const teamLogo = teamInfo?.logos?.[0]?.href ?? teamInfo?.logo ?? "";

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            title: "",
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={theme.accent} />
      }
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: teamInfo?.displayName ?? "Team",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <View style={[styles.teamHeader, { borderBottomColor: theme.separator }]}>
        {teamLogo ? (
          <Image source={{ uri: teamLogo }} style={styles.teamBigLogo} contentFit="contain" />
        ) : null}
        <Text style={[styles.teamBigName, { color: theme.text }]}>{teamInfo?.displayName ?? "Team"}</Text>
        {overallRecord && <Text style={[styles.teamRecord, { color: theme.textSecondary }]}>{overallRecord}</Text>}
        {teamInfo?.standingSummary && (
          <Text style={[styles.teamStanding, { color: theme.textMuted }]}>{teamInfo.standingSummary}</Text>
        )}
        <TouchableOpacity
          style={[styles.followBtn, { borderColor: theme.accent }, favorited && { backgroundColor: theme.accent, borderColor: theme.accent }]}
          onPress={handleToggleFav}
        >
          <Heart
            size={16}
            color={favorited ? theme.white : theme.accent}
            fill={favorited ? theme.white : "transparent"}
          />
          <Text style={[styles.followBtnText, { color: theme.accent }, favorited && { color: theme.white }]}>
            {favorited ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scheduleSection}>
        <View style={styles.scheduleSectionHeader}>
          <Calendar size={14} color={theme.textMuted} />
          <Text style={[styles.scheduleSectionTitle, { color: theme.text }]}>Schedule</Text>
          <Text style={[styles.scheduleCount, { color: theme.textMuted }]}>
            {scheduleGames.length} game{scheduleGames.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {scheduleGames.length === 0 ? (
          <Text style={[styles.noGames, { color: theme.textMuted }]}>No games on schedule</Text>
        ) : (
          scheduleGames.map((g, idx) => (
            <ScheduleRow
              key={g.id}
              game={g}
              isLast={idx === scheduleGames.length - 1}
              onPress={() => router.push(`/game/${g.id}` as any)}
            />
          ))
        )}
      </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  teamHeader: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  teamBigLogo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  teamBigName: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  teamRecord: {
    fontSize: 16,
    fontWeight: "500" as const,
    marginTop: 4,
  },
  teamStanding: {
    fontSize: 13,
    marginTop: 2,
    textAlign: "center",
  },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  scheduleSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  scheduleSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  scheduleSectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    flex: 1,
  },
  scheduleCount: {
    fontSize: 12,
  },
  noGames: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 30,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  scheduleDate: {
    width: 70,
  },
  scheduleDateText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  scheduleMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  scheduleOpponent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  opponentLogo: {
    width: 24,
    height: 24,
  },
  opponentLogoPlaceholder: {
    borderRadius: 12,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  opponentRank: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  opponentName: {
    fontSize: 14,
    fontWeight: "500" as const,
    flexShrink: 1,
  },
  scheduleResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  resultText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  scheduleScore: {
    fontSize: 12,
    fontWeight: "500" as const,
    minWidth: 50,
    textAlign: "right" as const,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  liveDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  liveSmallText: {
    fontSize: 8,
    fontWeight: "700" as const,
  },
  rowSeparator: {
    position: "absolute",
    bottom: 0,
    left: 70,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
