import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { ExternalLink, Clock } from "lucide-react-native";
import { useNews } from "@/hooks/useESPNData";
import { useTheme } from "@/providers/ThemeProvider";
import { NewsArticle } from "@/types/baseball";

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

const FeaturedArticle = React.memo(function FeaturedArticle({ article }: { article: NewsArticle }) {
  const { theme } = useTheme();
  const handlePress = async () => {
    if (article.link) {
      try {
        if (Platform.OS === "web") {
          window.open(article.link, "_blank");
        } else {
          const supported = await Linking.canOpenURL(article.link);
          if (supported) {
            await Linking.openURL(article.link);
          } else {
            console.log("Cannot open URL:", article.link);
          }
        }
      } catch (e) {
        console.log("Error opening URL:", e);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.featuredCard, { backgroundColor: theme.card }]}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={`featured-article-${article.id}`}
    >
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.featuredImage} contentFit="cover" />
      ) : (
        <View style={[styles.featuredImage, styles.featuredImagePlaceholder, { backgroundColor: theme.surface }]}>
          <Text style={[styles.featuredImagePlaceholderText, { color: theme.textMuted }]}>NCAA</Text>
        </View>
      )}
      <View style={styles.featuredOverlay} />
      <View style={styles.featuredContent}>
        <View style={[styles.featuredBadge, { backgroundColor: theme.accent }]}>
          <Text style={[styles.featuredBadgeText, { color: theme.white }]}>FEATURED</Text>
        </View>
        <Text style={[styles.featuredHeadline, { color: theme.white }]} numberOfLines={3}>
          {article.headline}
        </Text>
        <View style={styles.featuredMeta}>
          <Clock size={11} color="rgba(255,255,255,0.6)" />
          <Text style={styles.featuredTime}>{formatTimeAgo(article.published)}</Text>
          {article.source ? (
            <View style={styles.featuredSourceBadge}>
              <Text style={styles.featuredSourceText}>{article.source}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const ArticleRow = React.memo(function ArticleRow({
  article,
  isLast,
}: {
  article: NewsArticle;
  isLast: boolean;
}) {
  const { theme } = useTheme();
  const handlePress = async () => {
    if (article.link) {
      try {
        if (Platform.OS === "web") {
          window.open(article.link, "_blank");
        } else {
          const supported = await Linking.canOpenURL(article.link);
          if (supported) {
            await Linking.openURL(article.link);
          } else {
            console.log("Cannot open URL:", article.link);
          }
        }
      } catch (e) {
        console.log("Error opening URL:", e);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.articleRow}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`article-${article.id}`}
    >
      <View style={styles.articleContent}>
        <Text style={[styles.articleHeadline, { color: theme.text }]} numberOfLines={2}>
          {article.headline}
        </Text>
        {article.description ? (
          <Text style={[styles.articleDesc, { color: theme.textSecondary }]} numberOfLines={2}>
            {article.description}
          </Text>
        ) : null}
        <View style={styles.articleMeta}>
          <Clock size={10} color={theme.textMuted} />
          <Text style={[styles.articleTime, { color: theme.textMuted }]}>{formatTimeAgo(article.published)}</Text>
          {article.source ? (
            <View style={[styles.sourceBadge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sourceText, { color: theme.textSecondary }]}>{article.source}</Text>
            </View>
          ) : null}
          <ExternalLink size={10} color={theme.textMuted} />
        </View>
      </View>
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={[styles.articleThumb, { backgroundColor: theme.surface }]} contentFit="cover" />
      ) : null}
      {!isLast && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
    </TouchableOpacity>
  );
});

export default function NewsScreen() {
  const { theme, isDark } = useTheme();
  const { data: articles = [], isLoading, isRefetching, refetch, error } = useNews();

  const featured = articles[0];
  const rest = articles.slice(1);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderHeader = useCallback(() => {
    if (!featured) return null;
    return (
      <View>
        <View style={styles.logoHeader}>
          <Image source={{ uri: 'https://r2-pub.rork.com/generated-images/bbaf6dbf-650b-4449-9291-44866d7ca7c7.png' }} style={styles.logoImage} contentFit="contain" />
        </View>
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Dugout News</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Latest college baseball headlines & stories</Text>
        </View>
        <FeaturedArticle article={featured} />
        {rest.length > 0 && (
          <View style={styles.latestHeader}>
            <Text style={[styles.latestTitle, { color: theme.text }]}>Latest</Text>
          </View>
        )}
      </View>
    );
  }, [featured, rest.length, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ArticleRow article={item} isLast={index === rest.length - 1} />
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
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>Unable to load news</Text>
                <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.accent }]} onPress={() => refetch()}>
                  <Text style={[styles.retryText, { color: theme.white }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No news available</Text>
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
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  featuredCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: "hidden",
    height: 220,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  featuredImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  featuredImagePlaceholderText: {
    fontSize: 24,
    fontWeight: "700" as const,
    letterSpacing: 4,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  featuredContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: "flex-end",
  },
  featuredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: "800" as const,
    letterSpacing: 1,
  },
  featuredHeadline: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  featuredTime: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  latestHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 4,
  },
  latestTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
  },
  articleRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 12,
  },
  articleContent: {
    flex: 1,
    gap: 4,
  },
  articleHeadline: {
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 20,
  },
  articleDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  articleTime: {
    fontSize: 11,
    flex: 1,
  },
  articleThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  separator: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: StyleSheet.hairlineWidth,
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
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  featuredSourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  featuredSourceText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.8)",
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
});
