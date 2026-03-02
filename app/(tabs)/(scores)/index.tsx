import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { Filter as FilterIcon, Search, Star, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import GameCard from "@/components/GameCard";
import BannerAd from "@/components/BannerAd";
import { useScoreboard } from "@/hooks/useESPNData";
import { useTheme } from "@/providers/ThemeProvider";
import { useNotifications } from "@/providers/NotificationsProvider";
import { GameStatus, Game } from "@/types/baseball";

type StatusFilter = "top25" | "live" | "final" | "scheduled";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "top25", label: "Top 25" },
  { key: "live", label: "Live" },
  { key: "scheduled", label: "Upcoming" },
  { key: "final", label: "Final" },
];

const CONFERENCES = [
  "All",
  "SEC",
  "ACC",
  "Big 12",
  "Big Ten",
  "Pac-12",
  "Big East",
  "AAC",
  "Sun Belt",
  "C-USA",
  "MWC",
  "MAC",
  "WCC",
  "A-10",
  "MVC",
  "CAA",
  "Ivy",
  "Patriot",
  "SOCON",
] as const;

function matchesConference(game: Game, conf: string): boolean {
  if (conf === "All") return true;
  const lowerConf = conf.toLowerCase();
  const awayConf = (game.awayTeam.conference || "").toLowerCase();
  const homeConf = (game.homeTeam.conference || "").toLowerCase();
  if (!awayConf && !homeConf) return false;
  const awayMatch = awayConf.length > 0 && (
    awayConf === lowerConf || awayConf.includes(lowerConf) || lowerConf.includes(awayConf)
  );
  const homeMatch = homeConf.length > 0 && (
    homeConf === lowerConf || homeConf.includes(lowerConf) || lowerConf.includes(homeConf)
  );
  return awayMatch || homeMatch;
}

function matchesSearch(game: Game, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return (
    game.awayTeam.name.toLowerCase().includes(q) ||
    game.homeTeam.name.toLowerCase().includes(q) ||
    game.awayTeam.shortName.toLowerCase().includes(q) ||
    game.homeTeam.shortName.toLowerCase().includes(q)
  );
}

function buildDateList() {
  const dates: { label: string; shortDay: string; dayNum: number; isToday: boolean; date: Date }[] = [];
  const today = new Date();
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    dates.push({
      label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      shortDay: i === 0 ? "TODAY" : dayNames[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  return dates;
}

function getTopGames(games: Game[]): Game[] {
  return games
    .filter((g) => {
      const awayRanked = g.awayTeam.ranking && g.awayTeam.ranking <= 25;
      const homeRanked = g.homeTeam.ranking && g.homeTeam.ranking <= 25;
      return awayRanked || homeRanked;
    })
    .sort((a, b) => {
      const aLive = a.status === "live" ? 0 : 1;
      const bLive = b.status === "live" ? 0 : 1;
      if (aLive !== bLive) return aLive - bLive;
      const aBothRanked = (a.awayTeam.ranking && a.homeTeam.ranking) ? 0 : 1;
      const bBothRanked = (b.awayTeam.ranking && b.homeTeam.ranking) ? 0 : 1;
      return aBothRanked - bBothRanked;
    })
    .slice(0, 5);
}

const TopGameCard = React.memo(function TopGameCard({ game }: { game: Game }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <TouchableOpacity
      style={[styles.topGameCard, { backgroundColor: theme.topGameBg, borderColor: theme.topGameBorder }]}
      onPress={() => router.push(`/game/${game.id}` as any)}
      activeOpacity={0.7}
    >
      {isLive && (
        <View style={[styles.topGameLiveBadge, { backgroundColor: theme.liveBg }]}>
          <View style={[styles.topGameLiveDot, { backgroundColor: theme.live }]} />
          <Text style={[styles.topGameLiveText, { color: theme.live }]}>LIVE</Text>
        </View>
      )}
      <View style={styles.topGameTeams}>
        <View style={styles.topGameTeam}>
          <Image source={{ uri: game.awayTeam.logoUrl }} style={styles.topGameLogo} contentFit="contain" />
          <View style={styles.topGameTeamInfo}>
            {game.awayTeam.ranking && (
              <Text style={[styles.topGameRank, { color: theme.gold }]}>#{game.awayTeam.ranking}</Text>
            )}
            <Text style={[styles.topGameName, { color: theme.text }]} numberOfLines={1}>{game.awayTeam.shortName}</Text>
          </View>
          {!game.status.includes("scheduled") && (
            <Text style={[
              styles.topGameScore,
              { color: theme.textSecondary },
              isFinal && game.awayScore > game.homeScore && { color: theme.text, fontWeight: "700" as const },
              isLive && { color: theme.live, fontWeight: "700" as const },
            ]}>{game.awayScore}</Text>
          )}
        </View>
        <View style={[styles.topGameDivider, { backgroundColor: theme.separator }]} />
        <View style={styles.topGameTeam}>
          <Image source={{ uri: game.homeTeam.logoUrl }} style={styles.topGameLogo} contentFit="contain" />
          <View style={styles.topGameTeamInfo}>
            {game.homeTeam.ranking && (
              <Text style={[styles.topGameRank, { color: theme.gold }]}>#{game.homeTeam.ranking}</Text>
            )}
            <Text style={[styles.topGameName, { color: theme.text }]} numberOfLines={1}>{game.homeTeam.shortName}</Text>
          </View>
          {!game.status.includes("scheduled") && (
            <Text style={[
              styles.topGameScore,
              { color: theme.textSecondary },
              isFinal && game.homeScore > game.awayScore && { color: theme.text, fontWeight: "700" as const },
              isLive && { color: theme.live, fontWeight: "700" as const },
            ]}>{game.homeScore}</Text>
          )}
        </View>
      </View>
      <View style={[styles.topGameFooter, { borderTopColor: theme.separator }]}>
        <Text style={[
          styles.topGameStatus,
          { color: theme.textMuted },
          isLive && { color: theme.live, fontWeight: "600" as const },
        ]}>
          {isLive
            ? `${game.inningHalf === "top" ? "Top" : "Bot"} ${game.inning}`
            : isFinal
            ? "Final"
            : game.startTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default function ScoresScreen() {
  const [filter, setFilter] = useState<StatusFilter>("top25");
  const [confFilter, setConfFilter] = useState("All");
  const [showConfFilter, setShowConfFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const dateList = useMemo(() => buildDateList(), []);
  const todayIndex = useMemo(() => dateList.findIndex((d) => d.isToday), [dateList]);
  const [selectedDate, setSelectedDate] = useState(0);
  const dateScrollRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);

  const { theme, isDark } = useTheme();
  const currentDate = dateList[selectedDate]?.date ?? new Date();
  const hasScrolledToToday = useRef(false);

  const scrollDateToIndex = useCallback((idx: number, animated: boolean = true) => {
    const itemWidth = 58;
    const scrollX = Math.max(0, idx * itemWidth - 20);
    console.log(`[DateScroll] Scrolling to index ${idx}, x=${scrollX}, animated=${animated}`);
    dateScrollRef.current?.scrollTo({ x: scrollX, animated });
  }, []);

  useEffect(() => {
    if (todayIndex >= 0) {
      const timers = [0, 50, 150, 300, 500].map((delay) =>
        setTimeout(() => {
          console.log(`[DateScroll] useEffect scroll attempt after ${delay}ms`);
          scrollDateToIndex(todayIndex, false);
        }, delay)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [todayIndex, scrollDateToIndex]);

  const handleDateScrollLayout = useCallback(() => {
    if (!hasScrolledToToday.current && todayIndex >= 0) {
      hasScrolledToToday.current = true;
      setTimeout(() => scrollDateToIndex(todayIndex, false), 0);
      setTimeout(() => scrollDateToIndex(todayIndex, false), 100);
    }
  }, [todayIndex, scrollDateToIndex]);

  const handleDateSelect = useCallback((idx: number) => {
    setSelectedDate(idx);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    scrollDateToIndex(idx);
  }, [scrollDateToIndex]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  }, []);

  const { data: games = [], isLoading, isRefetching, refetch, error } = useScoreboard(currentDate);
  const { processGameUpdates } = useNotifications();

  useEffect(() => {
    if (games.length > 0) {
      processGameUpdates(games);
    }
  }, [games, processGameUpdates]);

  const topGames = useMemo(() => getTopGames(games), [games]);

  const filteredGames = useMemo(() => {
    let result = games;
    const beforeCount = result.length;
    if (filter === "top25") {
      result = result.filter((g) => {
        const awayRanked = g.awayTeam.ranking && g.awayTeam.ranking <= 25;
        const homeRanked = g.homeTeam.ranking && g.homeTeam.ranking <= 25;
        if (!awayRanked && !homeRanked) return false;
        return g.status === "live" || g.status === "scheduled";
      });
      console.log(`[Filter] Top 25 (live+upcoming): ${beforeCount} -> ${result.length} games`);
    } else if (filter === "scheduled") {
      const nowMs = Date.now();
      result = result.filter((g) => {
        if (g.status !== "scheduled") return false;
        if (g.sortEpoch && g.sortEpoch > 0 && g.sortEpoch < nowMs - 30 * 60 * 1000) {
          console.log(`[Filter] Excluding stale scheduled game: ${g.awayTeam.shortName} vs ${g.homeTeam.shortName} (started ${Math.round((nowMs - g.sortEpoch) / 60000)}m ago)`);
          return false;
        }
        return true;
      });
      console.log(`[Filter] Status '${filter}': ${beforeCount} -> ${result.length} games`);
    } else {
      result = result.filter((g) => g.status === (filter as GameStatus));
      console.log(`[Filter] Status '${filter}': ${beforeCount} -> ${result.length} games`);
    }
    if (confFilter !== "All") {
      const beforeCount = result.length;
      const withConf = result.filter((g) => g.awayTeam.conference || g.homeTeam.conference);
      console.log(`[Filter] Conference '${confFilter}': ${beforeCount} games, ${withConf.length} have conference data`);
      if (withConf.length < beforeCount && withConf.length < 5) {
        result.slice(0, 3).forEach((g) => {
          console.log(`[Filter] Sample: ${g.awayTeam.shortName} (conf: '${g.awayTeam.conference}') vs ${g.homeTeam.shortName} (conf: '${g.homeTeam.conference}') status: ${g.status}`);
        });
      }
      result = result.filter((g) => matchesConference(g, confFilter));
      console.log(`[Filter] After conference filter: ${result.length} games`);
    }
    if (debouncedSearch.trim()) {
      result = result.filter((g) => matchesSearch(g, debouncedSearch));
    }
    return result;
  }, [filter, confFilter, debouncedSearch, games]);

  const liveCount = useMemo(() => games.filter((g) => g.status === "live").length, [games]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderHeader = useCallback(
    () => (
      <View>
        <View style={styles.logoHeader}>
          <Image source={{ uri: 'https://r2-pub.rork.com/generated-images/bbaf6dbf-650b-4449-9291-44866d7ca7c7.png' }} style={styles.logoImage} contentFit="contain" />
        </View>
        <ScrollView
          ref={dateScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.dateRow, { borderBottomColor: theme.separator }]}
          onLayout={handleDateScrollLayout}
        >
          {dateList.map((date, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleDateSelect(idx)}
              style={[
                styles.dateItem,
                selectedDate === idx && { backgroundColor: theme.accent },
              ]}
            >
              <Text
                style={[
                  styles.dateDayText,
                  { color: theme.textMuted },
                  selectedDate === idx && { color: theme.white },
                  date.isToday && selectedDate !== idx && { color: theme.accent },
                ]}
              >
                {date.shortDay}
              </Text>
              <Text
                style={[
                  styles.dateLabelText,
                  { color: theme.textSecondary },
                  selectedDate === idx && { color: theme.white },
                ]}
              >
                {date.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {topGames.length > 0 && !searchQuery.trim() && (
          <View style={[styles.topGamesSection, { borderBottomColor: theme.separator }]}>
            <View style={styles.topGamesHeader}>
              <Star size={14} color={theme.gold} />
              <Text style={[styles.topGamesTitle, { color: theme.text }]}>Top Games</Text>
              <Text style={[styles.topGamesCount, { color: theme.textMuted }]}>{topGames.length}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topGamesRow}
            >
              {topGames.map((g) => (
                <TopGameCard key={g.id} game={g} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Scores</Text>
            {liveCount > 0 && (
              <View style={[styles.liveBadge, { backgroundColor: theme.liveBg }]}>
                <View style={[styles.liveBadgeDot, { backgroundColor: theme.live }]} />
                <Text style={[styles.liveBadgeText, { color: theme.live }]}>{liveCount} Live</Text>
              </View>
            )}
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            {isLoading ? "Loading..." : `${filteredGames.length} game${filteredGames.length !== 1 ? "s" : ""}`}
          </Text>
        </View>

        <View style={styles.searchBarRow}>
          <TouchableOpacity
            style={[styles.searchToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={14} color={theme.textMuted} />
          </TouchableOpacity>
          {showSearch && (
            <View style={[styles.searchBarContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Search size={14} color={theme.inputPlaceholder} />
              <TextInput
                style={[styles.searchBarInput, { color: theme.inputText }]}
                placeholder="Search teams..."
                placeholderTextColor={theme.inputPlaceholder}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} hitSlop={8}>
                  <X size={14} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {STATUS_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  filter === f.key && { backgroundColor: theme.accentSoft, borderColor: theme.accent },
                ]}
              >
                {f.key === "live" && filter === f.key && (
                  <View style={[styles.filterLiveDot, { backgroundColor: theme.live }]} />
                )}
                <Text
                  style={[
                    styles.filterText,
                    { color: theme.textMuted },
                    filter === f.key && { color: theme.accent },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowConfFilter(!showConfFilter)}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                confFilter !== "All" && { backgroundColor: theme.blueSoft, borderColor: theme.blue },
              ]}
            >
              <FilterIcon size={12} color={confFilter !== "All" ? theme.blue : theme.textMuted} />
              <Text
                style={[
                  styles.filterText,
                  { color: theme.textMuted },
                  confFilter !== "All" && { color: theme.blue },
                ]}
              >
                {confFilter === "All" ? "Conference" : confFilter}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {showConfFilter && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.confRow}
            >
              {CONFERENCES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setConfFilter(c);
                    if (c !== "All") setShowConfFilter(false);
                  }}
                  style={[
                    styles.confChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    confFilter === c && { backgroundColor: theme.blueSoft, borderColor: theme.blue },
                  ]}
                >
                  <Text
                    style={[
                      styles.confChipText,
                      { color: theme.textMuted },
                      confFilter === c && { color: theme.blue },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    ),
    [filter, confFilter, showConfFilter, liveCount, selectedDate, filteredGames.length, isLoading, dateList, topGames, searchQuery, showSearch, theme, handleSearchChange, clearSearch, handleDateSelect, handleDateScrollLayout]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        ref={flatListRef}
        data={filteredGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <GameCard game={item} showSeparator={index < filteredGames.length - 1} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <ActivityIndicator size="large" color={theme.accent} />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>Unable to load scores</Text>
                <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.accent }]} onPress={() => refetch()}>
                  <Text style={[styles.retryText, { color: theme.white }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : debouncedSearch.trim() ? (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No games match "{debouncedSearch}"</Text>
            ) : filter !== "top25" || confFilter !== "All" ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No {filter === "top25" ? "Top 25" : filter} games{confFilter !== "All" ? ` for ${confFilter}` : ""}
                </Text>
                <TouchableOpacity
                  style={[styles.retryBtn, { backgroundColor: theme.accent }]}
                  onPress={() => { setFilter("top25"); setConfFilter("All"); }}
                >
                  <Text style={[styles.retryText, { color: theme.white }]}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No games scheduled</Text>
            )}
          </View>
        }
      />
      <BannerAd />
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
  dateRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateItem: {
    alignItems: "center" as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateDayText: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  dateLabelText: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginTop: 2,
  },
  topGamesSection: {
    paddingTop: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 14,
  },
  topGamesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  topGamesTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    flex: 1,
  },
  topGamesCount: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  topGamesRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  topGameCard: {
    width: 160,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  topGameLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  topGameLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  topGameLiveText: {
    fontSize: 9,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  topGameTeams: {
    gap: 0,
  },
  topGameTeam: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
  },
  topGameLogo: {
    width: 20,
    height: 20,
  },
  topGameTeamInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  topGameRank: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  topGameName: {
    fontSize: 13,
    fontWeight: "600" as const,
    flexShrink: 1,
  },
  topGameScore: {
    fontSize: 15,
    fontWeight: "500" as const,
    minWidth: 20,
    textAlign: "right" as const,
  },
  topGameDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 1,
  },
  topGameFooter: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  topGameStatus: {
    fontSize: 11,
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "400" as const,
    marginTop: 2,
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  searchToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
  },
  errorContainer: {
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  logoHeader: {
    alignItems: "center" as const,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoImage: {
    width: 120,
    height: 60,
  },
  filterSection: {
    gap: 0,
  },
  confRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 6,
  },
  confChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  confChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
