import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Heart, X, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useScoreboard, useRankings } from "@/hooks/useESPNData";
import { useTheme } from "@/providers/ThemeProvider";
import { Game } from "@/types/baseball";

interface FavoriteTeamData {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  ranking?: number;
  record: string;
  conference: string;
}

function FavoriteTeamCard({
  team,
  games,
  isLast,
}: {
  team: FavoriteTeamData;
  games: Game[];
  isLast: boolean;
}) {
  const { toggleFavorite } = useFavorites();
  const router = useRouter();
  const { theme } = useTheme();

  const teamGames = useMemo(
    () =>
      games.filter(
        (g) => g.awayTeam.id === team.id || g.homeTeam.id === team.id
      ),
    [team.id, games]
  );

  const liveGame = teamGames.find((g) => g.status === "live");
  const nextGame = teamGames.find((g) => g.status === "scheduled");
  const lastGame = teamGames.find((g) => g.status === "final");

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(team.id);
  };

  return (
    <View>
      <View style={styles.teamCard}>
        <View style={styles.teamCardTop}>
          <Image source={{ uri: team.logoUrl }} style={styles.logo} contentFit="contain" />
          <View style={styles.teamCardInfo}>
            <View style={styles.nameRow}>
              {team.ranking && <Text style={[styles.ranking, { color: theme.gold }]}>#{team.ranking}</Text>}
              <Text style={[styles.teamName, { color: theme.text }]} numberOfLines={1}>{team.name}</Text>
            </View>
            <Text style={[styles.record, { color: theme.textMuted }]}>
              {team.record}{team.conference ? ` · ${team.conference}` : ""}
            </Text>
          </View>
          <TouchableOpacity onPress={handleRemove} hitSlop={12} style={[styles.removeBtn, { backgroundColor: theme.surface }]}>
            <X size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {liveGame && (
          <TouchableOpacity
            style={[styles.gameRow, { borderTopColor: theme.separator }]}
            onPress={() => router.push(`/game/${liveGame.id}` as any)}
            activeOpacity={0.7}
          >
            <LiveGameRow game={liveGame} teamId={team.id} />
            <ChevronRight size={14} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        {!liveGame && nextGame && (
          <TouchableOpacity
            style={[styles.gameRow, { borderTopColor: theme.separator }]}
            onPress={() => router.push(`/game/${nextGame.id}` as any)}
            activeOpacity={0.7}
          >
            <ScheduledGameRow game={nextGame} teamId={team.id} />
            <ChevronRight size={14} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        {!liveGame && !nextGame && lastGame && (
          <TouchableOpacity
            style={[styles.gameRow, { borderTopColor: theme.separator }]}
            onPress={() => router.push(`/game/${lastGame.id}` as any)}
            activeOpacity={0.7}
          >
            <FinalGameRow game={lastGame} teamId={team.id} />
            <ChevronRight size={14} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {!isLast && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
    </View>
  );
}

function LiveGameRow({ game, teamId }: { game: Game; teamId: string }) {
  const { theme } = useTheme();
  const isAway = game.awayTeam.id === teamId;
  const opponent = isAway ? game.homeTeam : game.awayTeam;
  const myScore = isAway ? game.awayScore : game.homeScore;
  const oppScore = isAway ? game.homeScore : game.awayScore;

  return (
    <View style={styles.liveGameInfo}>
      <View style={[styles.liveBadge, { backgroundColor: theme.liveBg }]}>
        <View style={[styles.liveDot, { backgroundColor: theme.live }]} />
        <Text style={[styles.liveText, { color: theme.live }]}>LIVE</Text>
      </View>
      <Text style={[styles.gameInfoText, { color: theme.textSecondary }]}>
        {isAway ? "@ " : "vs "}
        {opponent.shortName}
      </Text>
      <Text style={[styles.gameScoreText, { color: theme.text }]}>{myScore} - {oppScore}</Text>
      {game.inning && (
        <Text style={[styles.gameInningText, { color: theme.textMuted }]}>
          {game.inningHalf === "top" ? "▲" : "▼"}{game.inning}
        </Text>
      )}
    </View>
  );
}

function ScheduledGameRow({ game, teamId }: { game: Game; teamId: string }) {
  const { theme } = useTheme();
  const isAway = game.awayTeam.id === teamId;
  const opponent = isAway ? game.homeTeam : game.awayTeam;

  return (
    <View style={styles.scheduledGameInfo}>
      <Text style={[styles.nextLabel, { color: theme.scheduled, backgroundColor: theme.scheduledBg }]}>NEXT</Text>
      <Text style={[styles.gameInfoText, { color: theme.textSecondary }]}>
        {isAway ? "@ " : "vs "}{opponent.shortName}
      </Text>
      <Text style={[styles.scheduledTime, { color: theme.textMuted }]}>{game.startTime}</Text>
    </View>
  );
}

function FinalGameRow({ game, teamId }: { game: Game; teamId: string }) {
  const { theme } = useTheme();
  const isAway = game.awayTeam.id === teamId;
  const opponent = isAway ? game.homeTeam : game.awayTeam;
  const myScore = isAway ? game.awayScore : game.homeScore;
  const oppScore = isAway ? game.homeScore : game.awayScore;
  const won = myScore > oppScore;

  return (
    <View style={styles.scheduledGameInfo}>
      <Text style={[
        styles.finalLabel,
        { color: theme.final, backgroundColor: theme.surface },
        won && { color: theme.live, backgroundColor: theme.liveBg },
      ]}>
        {won ? "W" : "L"}
      </Text>
      <Text style={[styles.gameInfoText, { color: theme.textSecondary }]}>
        {isAway ? "@ " : "vs "}{opponent.shortName}
      </Text>
      <Text style={[styles.gameScoreText, { color: theme.text }]}>{myScore} - {oppScore}</Text>
    </View>
  );
}

export default function FavoritesScreen() {
  const { favoriteIds } = useFavorites();
  const { theme, isDark } = useTheme();
  const { data: games = [], isLoading: gamesLoading } = useScoreboard(new Date());
  const { data: rankingsData } = useRankings();

  const favoriteTeams = useMemo(() => {
    const teamsMap = new Map<string, FavoriteTeamData>();

    for (const game of games) {
      for (const team of [game.awayTeam, game.homeTeam]) {
        if (favoriteIds.includes(team.id) && !teamsMap.has(team.id)) {
          teamsMap.set(team.id, {
            id: team.id,
            name: team.name,
            shortName: team.shortName,
            logoUrl: team.logoUrl,
            ranking: team.ranking,
            record: team.record,
            conference: team.conference,
          });
        }
      }
    }

    for (const rt of rankingsData?.teams ?? []) {
      if (favoriteIds.includes(rt.id) && !teamsMap.has(rt.id)) {
        teamsMap.set(rt.id, {
          id: rt.id,
          name: rt.name,
          shortName: rt.shortName,
          logoUrl: rt.logoUrl,
          ranking: rt.ranking,
          record: rt.record,
          conference: rt.conference,
        });
      }
    }

    for (const fId of favoriteIds) {
      if (!teamsMap.has(fId)) {
        teamsMap.set(fId, {
          id: fId,
          name: `Team ${fId}`,
          shortName: fId,
          logoUrl: "",
          record: "",
          conference: "",
        });
      }
    }

    return favoriteIds
      .map((id) => teamsMap.get(id))
      .filter((t): t is FavoriteTeamData => t != null);
  }, [favoriteIds, games, rankingsData]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        data={favoriteTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FavoriteTeamCard
            team={item}
            games={games}
            isLast={index === favoriteTeams.length - 1}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.header, { borderBottomColor: theme.separator }]}>
            <View style={styles.logoHeader}>
              <Image source={{ uri: 'https://r2-pub.rork.com/generated-images/bbaf6dbf-650b-4449-9291-44866d7ca7c7.png' }} style={styles.logoImage} contentFit="contain" />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>My Teams</Text>
            {favoriteTeams.length > 0 && (
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Following {favoriteTeams.length} team{favoriteTeams.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {gamesLoading ? (
              <ActivityIndicator size="large" color={theme.accent} />
            ) : (
              <>
                <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
                  <Heart size={32} color={theme.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No favorite teams</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                  Tap the heart on any team in Rankings to start following them
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  teamCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  teamCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
  },
  teamCardInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ranking: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600" as const,
    flexShrink: 1,
  },
  record: {
    fontSize: 12,
  },
  removeBtn: {
    padding: 6,
    borderRadius: 12,
  },
  gameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  liveGameInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  gameInfoText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  gameScoreText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  gameInningText: {
    fontSize: 12,
  },
  scheduledGameInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  finalLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  scheduledTime: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  logoHeader: {
    alignItems: "center" as const,
    paddingBottom: 8,
  },
  logoImage: {
    width: 120,
    height: 60,
  },
});
