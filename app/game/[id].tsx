import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { MapPin, Radio, Clock, Users, ChevronDown, ChevronUp, Eye, EyeOff, Bell } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useScoreboard, useGameSummary, useBoxScore, useGameFromSummary } from "@/hooks/useESPNData";
import { useTheme } from "@/providers/ThemeProvider";
import { Game, BoxScoreCategory } from "@/types/baseball";

function PulsingDot() {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);
  return <Animated.View style={[styles.pulseDot, { opacity, backgroundColor: theme.live }]} />;
}

function LinescoreTable({ game }: { game: Game }) {
  const { theme } = useTheme();
  const innings = game.inningScores ?? [];
  if (innings.length === 0) return null;

  return (
    <View style={styles.linescoreSection}>
      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>LINESCORE</Text>
      <View style={[styles.linescoreCard, { backgroundColor: theme.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.linescoreRow}>
              <View style={styles.linescoreTeamCell} />
              {innings.map((inn) => (
                <View key={inn.inning} style={styles.linescoreCell}>
                  <Text style={[styles.linescoreHeader, { color: theme.textMuted }]}>{inn.inning}</Text>
                </View>
              ))}
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoreHeaderBold, { color: theme.textSecondary }]}>R</Text>
              </View>
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoreHeaderBold, { color: theme.textSecondary }]}>H</Text>
              </View>
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoreHeaderBold, { color: theme.textSecondary }]}>E</Text>
              </View>
            </View>

            <View style={[styles.linescoreRow, styles.linescoreDataRow, { borderTopColor: theme.separator }]}>
              <View style={styles.linescoreTeamCell}>
                <Text style={[styles.linescoreTeamText, { color: theme.text }]}>{game.awayTeam.shortName}</Text>
              </View>
              {innings.map((inn) => (
                <View key={inn.inning} style={styles.linescoreCell}>
                  <Text style={[styles.linescoreValue, { color: theme.textSecondary }]}>
                    {inn.away !== null ? inn.away : "-"}
                  </Text>
                </View>
              ))}
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoretotalValue, { color: theme.text }]}>{game.awayScore}</Text>
              </View>
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoretotalValue, { color: theme.text }]}>{game.awayHits ?? 0}</Text>
              </View>
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoretotalValue, { color: theme.text }]}>{game.awayErrors ?? 0}</Text>
              </View>
            </View>

            <View style={[styles.linescoreRow, styles.linescoreDataRow, { borderTopColor: theme.separator }]}>
              <View style={styles.linescoreTeamCell}>
                <Text style={[styles.linescoreTeamText, { color: theme.text }]}>{game.homeTeam.shortName}</Text>
              </View>
              {innings.map((inn) => (
                <View key={inn.inning} style={styles.linescoreCell}>
                  <Text style={[styles.linescoreValue, { color: theme.textSecondary }]}>
                    {inn.home !== null ? inn.home : "-"}
                  </Text>
                </View>
              ))}
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoretotalValue, { color: theme.text }]}>{game.homeScore}</Text>
              </View>
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoretotalValue, { color: theme.text }]}>{game.homeHits ?? 0}</Text>
              </View>
              <View style={[styles.linescoretotalCell, { backgroundColor: theme.surfaceLight }]}>
                <Text style={[styles.linescoretotalValue, { color: theme.text }]}>{game.homeErrors ?? 0}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function BoxScoreSection({ categories, game }: { categories: BoxScoreCategory[]; game: Game }) {
  const { theme } = useTheme();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (categories.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>BOX SCORE</Text>
      {categories.map((cat) => {
        const isExpanded = expandedCat === cat.name;
        const displayLabels = cat.labels.slice(0, 6);

        return (
          <View key={cat.name} style={[styles.boxScoreCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.boxScoreHeader}
              onPress={() => setExpandedCat(isExpanded ? null : cat.name)}
              activeOpacity={0.7}
            >
              <Users size={13} color={theme.textMuted} />
              <Text style={[styles.boxScoreCatName, { color: theme.text }]}>{cat.name}</Text>
              {isExpanded ? (
                <ChevronUp size={14} color={theme.textMuted} />
              ) : (
                <ChevronDown size={14} color={theme.textMuted} />
              )}
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.boxScoreContent}>
                {cat.awayPlayers.length > 0 && (
                  <View style={styles.boxTeamBlock}>
                    <Text style={[styles.boxTeamName, { color: theme.accent }]}>{game.awayTeam.shortName}</Text>
                    <View style={[styles.boxLabelRow, { borderBottomColor: theme.separator }]}>
                      <Text style={[styles.boxPlayerCell, styles.boxPlayerNameCell, { color: theme.textMuted }]}>Player</Text>
                      {displayLabels.map((l) => (
                        <Text key={l} style={[styles.boxStatCell, { color: theme.textSecondary }]}>{l}</Text>
                      ))}
                    </View>
                    {cat.awayPlayers.slice(0, 12).map((p, idx) => (
                      <View key={`${p.name}-${idx}`} style={[styles.boxPlayerRow, { borderBottomColor: theme.separator }]}>
                        <View style={styles.boxPlayerNameCell}>
                          <Text style={[styles.boxPlayerName, { color: theme.text }]} numberOfLines={1}>
                            {p.name}
                          </Text>
                          {p.position ? (
                            <Text style={[styles.boxPlayerPos, { color: theme.textMuted }]}>{p.position}</Text>
                          ) : null}
                        </View>
                        {p.stats.slice(0, 6).map((s, si) => (
                          <Text key={si} style={[styles.boxStatCell, { color: theme.textSecondary }]}>{s}</Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )}

                {cat.homePlayers.length > 0 && (
                  <View style={styles.boxTeamBlock}>
                    <Text style={[styles.boxTeamName, { color: theme.accent }]}>{game.homeTeam.shortName}</Text>
                    <View style={[styles.boxLabelRow, { borderBottomColor: theme.separator }]}>
                      <Text style={[styles.boxPlayerCell, styles.boxPlayerNameCell, { color: theme.textMuted }]}>Player</Text>
                      {displayLabels.map((l) => (
                        <Text key={l} style={[styles.boxStatCell, { color: theme.textSecondary }]}>{l}</Text>
                      ))}
                    </View>
                    {cat.homePlayers.slice(0, 12).map((p, idx) => (
                      <View key={`${p.name}-${idx}`} style={[styles.boxPlayerRow, { borderBottomColor: theme.separator }]}>
                        <View style={styles.boxPlayerNameCell}>
                          <Text style={[styles.boxPlayerName, { color: theme.text }]} numberOfLines={1}>
                            {p.name}
                          </Text>
                          {p.position ? (
                            <Text style={[styles.boxPlayerPos, { color: theme.textMuted }]}>{p.position}</Text>
                          ) : null}
                        </View>
                        {p.stats.slice(0, 6).map((s, si) => (
                          <Text key={si} style={[styles.boxStatCell, { color: theme.textSecondary }]}>{s}</Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function TeamScoreRow({
  team,
  score,
  isWinner,
  isScheduled,
  onTeamPress,
}: {
  team: Game["awayTeam"];
  score: number;
  isWinner: boolean;
  isScheduled: boolean;
  onTeamPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity style={[styles.teamScoreRow, { backgroundColor: theme.card }]} onPress={onTeamPress} activeOpacity={0.7}>
      <Image source={{ uri: team.logoUrl }} style={styles.bigLogo} contentFit="contain" />
      <View style={styles.teamMeta}>
        <View style={styles.teamNameRow}>
          {team.ranking && <Text style={[styles.rankBadge, { color: theme.gold }]}>#{team.ranking}</Text>}
          <Text style={[styles.teamNameBig, { color: theme.text }, isWinner && styles.winnerName]} numberOfLines={1}>
            {team.name}
          </Text>
        </View>
        <Text style={[styles.teamRecord, { color: theme.textMuted }]}>{team.record}{team.conference ? ` · ${team.conference}` : ""}</Text>
      </View>
      <Text style={[styles.bigScore, { color: theme.textSecondary }, isWinner && { color: theme.text, fontWeight: "700" as const }]}>
        {!isScheduled ? score : "-"}
      </Text>
    </TouchableOpacity>
  );
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [isWatching, setIsWatching] = useState(false);

  const { data: games = [], isLoading: scoreboardLoading, refetch: refetchScoreboard } = useScoreboard(new Date());
  const scoreboardGame = useMemo(() => games.find((g) => g.id === id), [games, id]);
  const { data: summaryGame, isLoading: summaryLoading, refetch: refetchSummaryGame } = useGameFromSummary(
    !scoreboardGame && !scoreboardLoading ? id : undefined
  );
  const { data: summary, refetch: refetchSummary } = useGameSummary(id);
  const { data: boxScoreCategories = [] } = useBoxScore(id);

  const game = scoreboardGame ?? summaryGame ?? null;
  const isLoadingGame = scoreboardLoading || (!scoreboardGame && summaryLoading);

  const onRefresh = () => {
    refetchScoreboard();
    refetchSummary();
    if (!scoreboardGame) refetchSummaryGame();
  };

  if (isLoadingGame && !game) {
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

  if (!game) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: "Game" }} />
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.textMuted }]}>Game not found</Text>
          <Text style={[styles.notFoundSubtext, { color: theme.textMuted }]}>This game may not be available yet</Text>
        </View>
      </View>
    );
  }

  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled";
  const awayWins = isFinal && game.awayScore > game.homeScore;
  const homeWins = isFinal && game.homeScore > game.awayScore;

  const statusDetail = game.statusDetail ?? "";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
          tintColor={theme.accent}
        />
      }
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.watchRow}>
        <TouchableOpacity
          style={[styles.watchBtn, { backgroundColor: theme.surface, borderColor: theme.border }, isWatching && { backgroundColor: theme.watchBg, borderColor: theme.watchActive }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsWatching(!isWatching);
          }}
          activeOpacity={0.7}
        >
          {isWatching ? (
            <Eye size={15} color={theme.watchActive} />
          ) : (
            <EyeOff size={15} color={theme.textMuted} />
          )}
          <Text style={[styles.watchBtnText, { color: theme.textMuted }, isWatching && { color: theme.watchActive }]}>
            {isWatching ? "Watching" : "Watch Game"}
          </Text>
        </TouchableOpacity>
        {isWatching && isLive && (
          <View style={styles.watchingIndicator}>
            <Bell size={11} color={theme.blue} />
            <Text style={[styles.watchingText, { color: theme.blue }]}>Live updates on</Text>
          </View>
        )}
      </View>

      {isLive && (
        <View style={[styles.liveBar, { backgroundColor: theme.liveBg }]}>
          <PulsingDot />
          <Text style={[styles.liveBarText, { color: theme.live }]}>
            {statusDetail || `${game.inningHalf === "top" ? "Top" : "Bottom"} ${game.inning}`}
          </Text>
        </View>
      )}
      {isFinal && (
        <View style={[styles.finalBar, { backgroundColor: theme.surface }]}>
          <Text style={[styles.finalBarText, { color: theme.final }]}>
            {statusDetail?.toUpperCase() || "FINAL"}
          </Text>
        </View>
      )}
      {isScheduled && (
        <View style={[styles.scheduledBar, { backgroundColor: theme.scheduledBg }]}>
          <Text style={[styles.scheduledBarText, { color: theme.scheduled }]}>{game.startTime}</Text>
        </View>
      )}

      <View style={styles.scoreBoard}>
        <TeamScoreRow
          team={game.awayTeam}
          score={game.awayScore}
          isWinner={awayWins}
          isScheduled={isScheduled}
          onTeamPress={() => router.push(`/team/${game.awayTeam.id}` as any)}
        />
        <View style={styles.vsRow}>
          <View style={[styles.vsDivider, { backgroundColor: theme.separator }]} />
          <View style={[styles.vsCircle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.vsText, { color: theme.textMuted }]}>@</Text>
          </View>
          <View style={[styles.vsDivider, { backgroundColor: theme.separator }]} />
        </View>
        <TeamScoreRow
          team={game.homeTeam}
          score={game.homeScore}
          isWinner={homeWins}
          isScheduled={isScheduled}
          onTeamPress={() => router.push(`/team/${game.homeTeam.id}` as any)}
        />
      </View>

      <LinescoreTable game={game} />

      {boxScoreCategories.length > 0 && (
        <BoxScoreSection categories={boxScoreCategories} game={game} />
      )}

      {(game.awayPitcher || game.homePitcher) && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>PITCHERS</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            {game.awayPitcher && (
              <View style={styles.pitcherRow}>
                <View style={[styles.pitcherTeamBadge, { backgroundColor: theme.surfaceLight }]}>
                  <Text style={[styles.pitcherTeamText, { color: theme.textMuted }]}>{game.awayTeam.shortName}</Text>
                </View>
                <Text style={[styles.pitcherName, { color: theme.text }]}>{game.awayPitcher}</Text>
              </View>
            )}
            {game.awayPitcher && game.homePitcher && <View style={[styles.pitcherDivider, { backgroundColor: theme.separator }]} />}
            {game.homePitcher && (
              <View style={styles.pitcherRow}>
                <View style={[styles.pitcherTeamBadge, { backgroundColor: theme.surfaceLight }]}>
                  <Text style={[styles.pitcherTeamText, { color: theme.textMuted }]}>{game.homeTeam.shortName}</Text>
                </View>
                <Text style={[styles.pitcherName, { color: theme.text }]}>{game.homePitcher}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>GAME INFO</Text>
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: theme.surfaceLight }]}>
              <Clock size={13} color={theme.textMuted} />
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{game.startTime}</Text>
          </View>
          {game.venue ? (
            <View style={styles.infoRow}>
              <View style={[styles.infoIconCircle, { backgroundColor: theme.surfaceLight }]}>
                <MapPin size={13} color={theme.textMuted} />
              </View>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>{game.venue}</Text>
            </View>
          ) : null}
          {game.broadcast && (
            <View style={styles.infoRow}>
              <View style={[styles.infoIconCircle, { backgroundColor: theme.surfaceLight }]}>
                <Radio size={13} color={theme.textMuted} />
              </View>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>{game.broadcast}</Text>
            </View>
          )}
        </View>
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
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  notFoundText: {
    fontSize: 16,
  },
  notFoundSubtext: {
    fontSize: 13,
  },
  liveBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveBarText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  finalBar: {
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
  },
  finalBarText: {
    fontSize: 13,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  scheduledBar: {
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
  },
  scheduledBarText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  scoreBoard: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  teamScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  bigLogo: {
    width: 44,
    height: 44,
  },
  teamMeta: {
    flex: 1,
    gap: 2,
  },
  teamNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rankBadge: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  teamNameBig: {
    fontSize: 17,
    fontWeight: "600" as const,
    flexShrink: 1,
  },
  winnerName: {
    fontWeight: "800" as const,
  },
  teamRecord: {
    fontSize: 12,
  },
  bigScore: {
    fontSize: 34,
    fontWeight: "300" as const,
    minWidth: 40,
    textAlign: "right" as const,
  },
  vsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 20,
  },
  vsDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  vsCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    borderWidth: 1,
  },
  vsText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  linescoreSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  linescoreCard: {
    borderRadius: 10,
    padding: 10,
  },
  linescoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  linescoreDataRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  linescoreTeamCell: {
    width: 46,
    paddingVertical: 9,
  },
  linescoreTeamText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  linescoreCell: {
    width: 26,
    alignItems: "center",
    paddingVertical: 9,
  },
  linescoreHeader: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  linescoreHeaderBold: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  linescoreValue: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  linescoretotalCell: {
    width: 30,
    alignItems: "center",
    paddingVertical: 9,
  },
  linescoretotalValue: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  infoCard: {
    borderRadius: 10,
    padding: 12,
    gap: 0,
  },
  pitcherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  pitcherTeamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: 42,
    alignItems: "center" as const,
  },
  pitcherTeamText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  pitcherName: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  pitcherDivider: {
    height: StyleSheet.hairlineWidth,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  infoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    fontWeight: "500" as const,
    flex: 1,
  },
  boxScoreCard: {
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
  },
  boxScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  boxScoreCatName: {
    fontSize: 14,
    fontWeight: "600" as const,
    flex: 1,
    textTransform: "capitalize" as const,
  },
  boxScoreContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  boxTeamBlock: {
    marginBottom: 12,
  },
  boxTeamName: {
    fontSize: 12,
    fontWeight: "700" as const,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  boxLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  boxPlayerCell: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  boxPlayerNameCell: {
    flex: 1,
    minWidth: 90,
  },
  boxStatCell: {
    width: 32,
    textAlign: "center" as const,
    fontSize: 11,
    fontWeight: "500" as const,
  },
  boxPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  boxPlayerName: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  boxPlayerPos: {
    fontSize: 9,
    fontWeight: "500" as const,
  },
  watchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  watchBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  watchingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  watchingText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
});
