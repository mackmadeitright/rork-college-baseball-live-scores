import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Image } from "expo-image";
import { Heart } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Team } from "@/types/baseball";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useTheme } from "@/providers/ThemeProvider";

interface RankingRowProps {
  team: Team;
  index: number;
  isLast?: boolean;
}

export default React.memo(function RankingRow({ team, index, isLast }: RankingRowProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme } = useTheme();
  const router = useRouter();
  const favorited = isFavorite(team.id);
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    toggleFavorite(team.id);
  };

  return (
    <TouchableOpacity
      testID={`ranking-row-${team.id}`}
      onPress={() => router.push(`/team/${team.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, { color: theme.textSecondary }, index < 5 && { color: theme.gold, fontWeight: "700" as const }]}>{team.ranking}</Text>
        </View>
        <Image source={{ uri: team.logoUrl }} style={styles.logo} contentFit="contain" />
        <View style={styles.info}>
          <Text style={[styles.teamName, { color: theme.text }]} numberOfLines={1}>{team.name}</Text>
          <Text style={[styles.conference, { color: theme.textMuted }]}>{team.conference}</Text>
        </View>
        <Text style={[styles.recordText, { color: theme.textSecondary }]}>{team.record}</Text>
        <Text style={[styles.confRecord, { color: theme.textMuted }]}>{team.conferenceRecord}</Text>
        <TouchableOpacity onPress={handleFavorite} hitSlop={12} style={styles.heartBtn}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Heart
              size={16}
              color={favorited ? theme.accent : theme.textMuted}
              fill={favorited ? theme.accent : "transparent"}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      {!isLast && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  rankContainer: {
    width: 24,
    alignItems: "center",
  },
  rank: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  logo: {
    width: 30,
    height: 30,
  },
  info: {
    flex: 1,
    gap: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  conference: {
    fontSize: 11,
  },
  recordText: {
    fontSize: 13,
    fontWeight: "500" as const,
    width: 46,
    textAlign: "center" as const,
    marginLeft: 8,
  },
  confRecord: {
    fontSize: 12,
    fontWeight: "400" as const,
    width: 40,
    textAlign: "center" as const,
  },
  heartBtn: {
    padding: 4,
    width: 32,
    alignItems: "center" as const,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
    marginRight: 16,
  },
});
