import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import {
  Award,
  ArrowUpDown,
  Trophy,
  Hash,
  Search,
  X,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import RankingRow from "@/components/RankingRow";
import RPIRow from "@/components/rankings/RPIRow";
import MoverRow, { MoverTeam } from "@/components/rankings/MoverRow";
import StandingsRow from "@/components/rankings/StandingsRow";
import PollChip, { getPollColor } from "@/components/rankings/PollChip";
import ConferenceChip from "@/components/rankings/ConferenceChip";
import { useAllRankings, useConferenceList, useConferenceStandings, useNCAAFullRPI } from "@/hooks/useESPNData";
import { useTheme } from "@/providers/ThemeProvider";
import { useNotifications } from "@/providers/NotificationsProvider";

type RankingView = "top25" | "rpi" | "movers" | "standings";

const VIEWS: { key: RankingView; label: string }[] = [
  { key: "top25", label: "Poll" },
  { key: "rpi", label: "RPI" },
  { key: "standings", label: "Standings" },
  { key: "movers", label: "Movers" },
];

export default function RankingsScreen() {
  const [view, setView] = useState<RankingView>("top25");
  const [selectedPollIndex, setSelectedPollIndex] = useState<number>(0);
  const [selectedConferenceId, setSelectedConferenceId] = useState<string | undefined>(undefined);
  const [rpiSearch, setRpiSearch] = useState("");
  const [showRpiSearch, setShowRpiSearch] = useState(false);
  const { theme, isDark } = useTheme();
  const { data: polls, isLoading, error, refetch, isRefetching } = useAllRankings();
  const { processRankingUpdates } = useNotifications();

  useEffect(() => {
    if (polls && polls.length > 0) {
      processRankingUpdates(polls);
    }
  }, [polls, processRankingUpdates]);

  const { data: conferences } = useConferenceList();
  const { data: standings, isLoading: standingsLoading, refetch: refetchStandings, isRefetching: standingsRefetching } = useConferenceStandings(selectedConferenceId);
  const { data: fullRpiTeams, isLoading: rpiLoading, refetch: refetchRpi, isRefetching: rpiRefetching } = useNCAAFullRPI();

  const filteredRpiTeams = useMemo(() => {
    if (!fullRpiTeams) return [];
    if (!rpiSearch.trim()) return fullRpiTeams;
    const q = rpiSearch.toLowerCase().trim();
    return fullRpiTeams.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      (t.conference && t.conference.toLowerCase().includes(q))
    );
  }, [fullRpiTeams, rpiSearch]);

  const handleConferenceSelect = useCallback((id: string) => {
    setSelectedConferenceId(id);
  }, []);

  useEffect(() => {
    if (conferences && conferences.length > 0 && !selectedConferenceId) {
      setSelectedConferenceId(conferences[0].id);
    }
  }, [conferences, selectedConferenceId]);

  const activePoll = polls?.[selectedPollIndex];
  const rankedTeams = activePoll?.teams ?? [];

  const movers = useMemo((): MoverTeam[] => {
    return rankedTeams
      .map((t): MoverTeam => {
        const prev = t.previousRanking ?? t.ranking;
        const change = prev - t.ranking;
        const direction = change > 0 ? "up" as const : change < 0 ? "down" as const : "same" as const;
        return { ...t, change, direction };
      })
      .filter((t) => t.direction !== "same")
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [rankedTeams]);


  const standingSections = useMemo(() => {
    return (standings?.divisions ?? []).map((div) => ({ title: div.name, data: div.teams }));
  }, [standings]);

  const handlePollSelect = useCallback((index: number) => {
    setSelectedPollIndex(index);
  }, []);

  const renderPollSelector = () => {
    if (!polls || polls.length === 0) return null;
    return (
      <View style={styles.pollSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pollScrollContent}>
          {polls.map((poll, index) => (
            <PollChip key={poll.id} poll={poll} index={index} isSelected={selectedPollIndex === index} onPress={() => handlePollSelect(index)} />
          ))}
        </ScrollView>
      </View>
    );
  };


  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoHeader}>
        <Image source={{ uri: 'https://r2-pub.rork.com/generated-images/bbaf6dbf-650b-4449-9291-44866d7ca7c7.png' }} style={styles.logoImage} contentFit="contain" />
      </View>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.text }]}>Rankings</Text>
        {polls && polls.length > 0 && (
          <View style={[styles.pollCountBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.pollCountText, { color: theme.textSecondary }]}>{polls.length} polls</Text>
          </View>
        )}
      </View>
      {activePoll && view !== "rpi" && (
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{activePoll.headline}</Text>
      )}
      {view === "rpi" && (
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {fullRpiTeams && fullRpiTeams.length > 0 ? `NCAA RPI — ${fullRpiTeams.length} teams ranked` : "NCAA Ratings Percentage Index"}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.viewToggle, { backgroundColor: theme.surface }]}
        contentContainerStyle={styles.viewToggleContent}
      >
        {VIEWS.map((v) => (
          <TouchableOpacity
            key={v.key}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setView(v.key); }}
            style={[styles.viewTab, view === v.key && { backgroundColor: theme.accent }]}
          >
            {v.key === "top25" && <Award size={12} color={view === v.key ? theme.white : theme.textMuted} />}
            {v.key === "rpi" && <Hash size={12} color={view === v.key ? theme.white : theme.textMuted} />}
            {v.key === "standings" && <Trophy size={12} color={view === v.key ? theme.white : theme.textMuted} />}
            {v.key === "movers" && <ArrowUpDown size={12} color={view === v.key ? theme.white : theme.textMuted} />}
            <Text style={[styles.viewTabText, { color: theme.textMuted }, view === v.key && { color: theme.white }]}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {view !== "rpi" && renderPollSelector()}

      {view === "rpi" && (
        <View style={styles.rpiSearchRow}>
          <TouchableOpacity style={[styles.rpiSearchToggle, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowRpiSearch(!showRpiSearch)}>
            <Search size={14} color={theme.textMuted} />
          </TouchableOpacity>
          {showRpiSearch && (
            <View style={[styles.rpiSearchContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Search size={14} color={theme.inputPlaceholder} />
              <TextInput
                style={[styles.rpiSearchInput, { color: theme.inputText }]}
                placeholder="Search teams or conferences..."
                placeholderTextColor={theme.inputPlaceholder}
                value={rpiSearch}
                onChangeText={setRpiSearch}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {rpiSearch.length > 0 && (
                <TouchableOpacity onPress={() => setRpiSearch("")} hitSlop={8}>
                  <X size={14} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {view === "rpi" && (
        <View style={[styles.rpiColHeaders, { borderBottomColor: theme.separator }]}>
          <Text style={[styles.colText, { width: 28, textAlign: "center" as const, color: theme.textMuted }]}>#</Text>
          <View style={{ width: 28 }} />
          <Text style={[styles.colText, { flex: 1, color: theme.textMuted }]}>TEAM</Text>
          <Text style={[styles.colText, { width: 70, textAlign: "center" as const, color: theme.textMuted }]}>REC / RPI</Text>
          <Text style={[styles.colText, { width: 40, textAlign: "center" as const, color: theme.textMuted }]}>SOS</Text>
          <View style={{ width: 12 }} />
        </View>
      )}

      {view === "top25" && (
        <View style={[styles.colHeaders, { borderBottomColor: theme.separator }]}>
          <Text style={[styles.colText, styles.colRank, { color: theme.textMuted }]}>#</Text>
          <View style={styles.colTeamSpacer} />
          <Text style={[styles.colText, styles.colTeam, { color: theme.textMuted }]}>Team</Text>
          <Text style={[styles.colText, styles.colRecord, { color: theme.textMuted }]}>Record</Text>
          <Text style={[styles.colText, styles.colConf, { color: theme.textMuted }]}>Conf</Text>
          <View style={styles.colHeart} />
        </View>
      )}

      {view === "standings" && (
        <>
          <View style={styles.confSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.confScrollContent}>
              {(conferences ?? []).map((conf) => (
                <ConferenceChip key={conf.id} conf={conf} isSelected={selectedConferenceId === conf.id} onPress={() => handleConferenceSelect(conf.id)} />
              ))}
            </ScrollView>
          </View>
          <View style={[styles.standingsColHeaders, { borderBottomColor: theme.separator }]}>
            <View style={styles.standingsLogoSpacer} />
            <View style={styles.standingsTeamInfo}>
              <Text style={[styles.colText, { color: theme.textMuted }]}>TEAM</Text>
            </View>
            <Text style={[styles.colText, styles.standingsStatCol, { color: theme.textMuted }]}>PCT</Text>
            <Text style={[styles.colText, styles.standingsStatCol, { color: theme.textMuted }]}>GB</Text>
            <Text style={[styles.colText, styles.standingsStatCol, { color: theme.textMuted }]}>STK</Text>
            <Text style={[styles.colText, styles.standingsStatCol, { color: theme.textMuted }]}>DIFF</Text>
            <View style={{ width: 12 }} />
          </View>
        </>
      )}

    </View>
  );

  if (view === "rpi") {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <FlatList
          data={filteredRpiTeams}
          keyExtractor={(item) => `rpi-${item.ranking}-${item.id}`}
          renderItem={({ item, index }) => <RPIRow team={item} isLast={index === filteredRpiTeams.length - 1} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={rpiRefetching} onRefresh={() => refetchRpi()} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              {rpiLoading ? (
                <ActivityIndicator size="large" color={theme.accent} />
              ) : rpiSearch.trim() ? (
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No teams match "{rpiSearch}"</Text>
              ) : (
                <View style={styles.errorContainer}>
                  <Hash size={32} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted, marginTop: 8 }]}>RPI rankings not yet available</Text>
                  <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>Rankings will appear as the season progresses</Text>
                  <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.accent }]} onPress={() => refetchRpi()}>
                    <Text style={[styles.retryText, { color: theme.white }]}>Check Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
        />
      </View>
    );
  }

  if (view === "standings") {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SectionList
          sections={standingSections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index, section }) => <StandingsRow team={item} isLast={index === section.data.length - 1} />}
          renderSectionHeader={({ section }) => (
            standingSections.length > 1 ? (
              <View style={[styles.standingsSectionHeader, { backgroundColor: theme.background }]}>
                <Text style={[styles.standingsSectionTitle, { color: theme.textSecondary }]}>{section.title}</Text>
              </View>
            ) : null
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews={true}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={<RefreshControl refreshing={standingsRefetching} onRefresh={() => refetchStandings()} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              {standingsLoading ? <ActivityIndicator size="large" color={theme.accent} /> : <Text style={[styles.emptyText, { color: theme.textMuted }]}>No standings available</Text>}
            </View>
          }
        />
      </View>
    );
  }

  if (view === "movers") {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <FlatList
          data={movers}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <MoverRow team={item} isLast={index === movers.length - 1} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              {isLoading ? <ActivityIndicator size="large" color={theme.accent} /> : <Text style={[styles.emptyText, { color: theme.textMuted }]}>No movers this week</Text>}
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        data={rankedTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <RankingRow team={item} index={index} isLast={index === rankedTeams.length - 1} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={theme.accent} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <ActivityIndicator size="large" color={theme.accent} />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>Unable to load rankings</Text>
                <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.accent }]} onPress={() => refetch()}>
                  <Text style={[styles.retryText, { color: theme.white }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No rankings available</Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 20 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  pollCountBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  pollCountText: { fontSize: 11, fontWeight: "600" },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 12 },
  viewToggle: { borderRadius: 10, padding: 3, marginBottom: 14, flexGrow: 0 },
  viewToggleContent: { flexDirection: "row", gap: 2 },
  viewTab: { paddingVertical: 8, paddingHorizontal: 12, alignItems: "center", borderRadius: 8, flexDirection: "row", justifyContent: "center", gap: 4 },
  viewTabText: { fontSize: 12, fontWeight: "600" },
  pollSelectorContainer: { marginBottom: 12 },
  pollScrollContent: { gap: 8, paddingRight: 4 },
  colHeaders: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  colText: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  colRank: { width: 24, textAlign: "center" },
  colTeamSpacer: { width: 44 },
  colTeam: { flex: 1 },
  colRecord: { width: 52, textAlign: "center" },
  colConf: { width: 44, textAlign: "center" },
  colHeart: { width: 32 },

  empty: { alignItems: "center", paddingTop: 60 },
  errorContainer: { alignItems: "center", gap: 12 },
  emptyText: { fontSize: 15 },
  emptySubtext: { fontSize: 13, marginTop: 4, textAlign: "center" },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: "600" },
  confSelectorContainer: { marginBottom: 12 },
  confScrollContent: { gap: 8, paddingRight: 4 },
  standingsColHeaders: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  standingsLogoSpacer: { width: 24, height: 24 },
  standingsTeamInfo: { flex: 1, gap: 1, minWidth: 0 },
  standingsStatCol: { fontSize: 12, fontWeight: "500", width: 36, textAlign: "center" },
  standingsSectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  standingsSectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  rpiSearchRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  rpiSearchToggle: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  rpiSearchContainer: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 10, gap: 6, borderWidth: 1 },
  rpiSearchInput: { flex: 1, fontSize: 14, paddingVertical: 8 },
  rpiColHeaders: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  logoHeader: { alignItems: "center", paddingTop: 4, paddingBottom: 8 },
  logoImage: { width: 120, height: 60 },
});
