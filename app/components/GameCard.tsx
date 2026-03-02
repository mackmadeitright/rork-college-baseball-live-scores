import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Game } from "@/types/baseball";
import { useTheme } from "@/providers/ThemeProvider";

interface GameCardProps {
  game: Game;
  showSeparator?: boolean;
}

function LiveDot() {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View style={[styles.liveDot, { opacity, backgroundColor: theme.live }]} />;
}

function GameStatusInfo({ game }: { game: Game }) {
  const { theme } = useTheme();

  if (game.status === "live") {
    return (
      <View style={styles.statusContainer}>
        <View style={styles.liveRow}>
          <LiveDot />
          <Text style={[styles.liveInning, { color: theme.live }]}>
            {game.inningHalf === "top" ? "Top" : "Bot"} {game.inning}
          </Text>
        </View>
        {game.outs !== undefined && (
          <Text style={[styles.outsText, { color: theme.textMuted }]}>{game.outs} Out</Text>
        )}
      </View>
    );
  }
  if (game.status === "final") {
    return (
      <View style={styles.statusContainer}>
        <Text style={[styles.finalText, { color: theme.final }]}>Final</Text>
      </View>
    );
  }
  return (
    <View style={styles.statusContainer}>
      <Text style={[styles.timeText, { color: theme.scheduled }]}>{game.startTime}</Text>
      {game.broadcast && (
        <Text style={[styles.broadcastTextInline, { color: theme.textMuted }]}>{game.broadcast}</Text>
      )}
    </View>
  );
}

function TeamLine({
  team,
  score,
  isWinner,
  isScheduled,
  isLive,
  isHome,
}: {
  team: Game["awayTeam"];
  score: number;
  isWinner: boolean;
  isScheduled: boolean;
  isLive: boolean;
  isHome: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.teamLine}>
      <Image
        source={{ uri: team.logoUrl }}
        style={styles.teamLogo}
        contentFit="contain"
      />
      <View style={styles.teamNameBlock}>
        {team.ranking && (
          <Text style={[styles.rankNum, { color: theme.textMuted }]}>{team.ranking}</Text>
        )}
        <Text
          style={[
            styles.teamName,
            { color: theme.textSecondary },
            isHome && { fontWeight: "700" as const, color: theme.text },
            isWinner && { color: theme.text, fontWeight: "700" as const },
          ]}
          numberOfLines={1}
        >
          {team.name}
        </Text>
      </View>
      <Text style={[styles.recordText, { color: theme.textMuted }]}>{team.record}</Text>
      {!isScheduled && (
        <Text
          style={[
            styles.scoreText,
            { color: theme.textSecondary },
            isWinner && { color: theme.text, fontWeight: "700" as const },
            isLive && { color: theme.text },
          ]}
        >
          {score}
        </Text>
      )}
      {isWinner && <Text style={[styles.winArrow, { color: theme.text }]}>◀</Text>}
    </View>
  );
}

export default React.memo(function GameCard({ game, showSeparator = true }: GameCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isScheduled = game.status === "scheduled";
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const awayWins = isFinal && game.awayScore > game.homeScore;
  const homeWins = isFinal && game.homeScore > game.awayScore;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => router.push(`/game/${game.id}` as any)}
      testID={`game-card-${game.id}`}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] },
          isLive && { backgroundColor: theme.liveBg },
        ]}
      >
        <View style={styles.gameContent}>
          <View style={styles.teamsBlock}>
            <TeamLine
              team={game.awayTeam}
              score={game.awayScore}
              isWinner={awayWins}
              isScheduled={isScheduled}
              isLive={isLive}
              isHome={false}
            />
            <TeamLine
              team={game.homeTeam}
              score={game.homeScore}
              isWinner={homeWins}
              isScheduled={isScheduled}
              isLive={isLive}
              isHome={true}
            />
          </View>
          <View style={[styles.dividerVert, { backgroundColor: theme.separator }]} />
          <GameStatusInfo game={game} />
        </View>
        {game.broadcast && !isScheduled && (
          <View style={[styles.footerRow, { borderTopColor: theme.separator }]}>
            <Text style={[styles.broadcastText, { color: theme.textMuted }]}>{game.broadcast}</Text>
            <Text style={[styles.venueText, { color: theme.textMuted }]} numberOfLines={1}>{game.venue}</Text>
          </View>
        )}
      </Animated.View>
      {showSeparator && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gameContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamsBlock: {
    flex: 1,
    gap: 6,
  },
  teamLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamLogo: {
    width: 24,
    height: 24,
  },
  teamNameBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 5,
  },
  rankNum: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  teamName: {
    fontSize: 15,
    fontWeight: "500" as const,
    flexShrink: 1,
  },
  recordText: {
    fontSize: 11,
    fontWeight: "400" as const,
    marginLeft: 4,
    textAlign: "right" as const,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "500" as const,
    width: 32,
    textAlign: "right" as const,
  },
  winArrow: {
    fontSize: 8,
    marginLeft: 2,
  },
  dividerVert: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  statusContainer: {
    width: 70,
    alignItems: "flex-start" as const,
    gap: 2,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveInning: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  outsText: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginLeft: 12,
  },
  finalText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  broadcastTextInline: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  broadcastText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  venueText: {
    fontSize: 11,
    flex: 1,
    textAlign: "right" as const,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
