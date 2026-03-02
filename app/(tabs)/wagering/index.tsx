import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
} from "react-native";
import { ExternalLink } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import {
  TrendingUp,
  Newspaper,
  Tag,
  BarChart3,
  Lock,
  Gift,
} from "lucide-react-native";

interface PromoItem {
  name: string;
  logo: string;
  url: string;
  bgColor: string;
}

const PROMO_CODES: PromoItem[] = [
  {
    name: "FanDuel",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/7c/07/96/7c0796d2-634b-e225-c9a5-e8e68c3fc428/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp",
    url: "https://account.sportsbook.fanduel.com/join?raf=52bdcb8d-6b74-4fc4-886e-f5346f13b55c&referrerUserId=1170315&external-referrer=https://sportsbook.fanduel.com&ampSessionId=1771714234227&ampDeviceId=ccd49100-d63b-4e8a-9bfe-4aa64aad743d",
    bgColor: "#1493FF",
  },
  {
    name: "DraftKings",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e4/4d/c6/e44dc6d4-2e3a-c9c4-3a2e-67a2600be5c1/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp",
    url: "https://sportsbook.draftkings.com/r/sb/Cnoteizhere/US-MD-SB/US-MD",
    bgColor: "#61B510",
  },
  {
    name: "BetMGM",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/40/04/4c/40044c0e-d35e-5d56-c705-ee6eb5bcb2bf/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp",
    url: "https://promo.betmgm.com/en/promo/geolocating",
    bgColor: "#C8A96E",
  },
  {
    name: "Caesars",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1e/2c/07/1e2c0785-8369-b999-c4c8-e4eb66be40d5/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp",
    url: "https://caesars.com/sportsbook-and-casino/referral?AR=RAF-D2C-B5E",
    bgColor: "#0A3624",
  },
  {
    name: "Fanatics",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1c/50/80/1c508048-78e7-75db-d430-1e3d6f448498/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp",
    url: "https://fanatics.onelink.me/5kut/92bkdz2r",
    bgColor: "#000000",
  },
  {
    name: "Novig",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/d1/5d/d8/d15dd849-1a40-3f50-3cc0-2119902c2479/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp",
    url: "https://novig.onelink.me/JHQQ/9p9fk4s6",
    bgColor: "#6C3BF5",
  },
];

function PromoCard({ promo, theme, delay }: { promo: PromoItem; theme: ReturnType<typeof useTheme>["theme"]; delay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Linking.openURL(promo.url).catch((err) => {
      console.log("Failed to open URL:", err);
    });
  };

  return (
    <Animated.View
      style={[
        styles.promoCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.promoCardInner}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.promoLogoContainer, { backgroundColor: promo.bgColor }]}>
          <Image
            source={{ uri: promo.logo }}
            style={styles.promoLogo}
            resizeMode="cover"
          />
        </View>
        <View style={styles.promoTextContainer}>
          <Text style={[styles.promoName, { color: theme.text }]}>{promo.name}</Text>
          <Text style={[styles.promoLabel, { color: theme.accent }]}>Claim Bonus</Text>
        </View>
        <View style={[styles.promoArrow, { backgroundColor: theme.accentGlow }]}>
          <ExternalLink size={16} color={theme.accent} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  theme: ReturnType<typeof useTheme>["theme"];
  delay: number;
}

function FeatureCard({ icon, title, description, theme, delay }: FeatureCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: theme.accentGlow }]}>
        {icon}
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      <View style={[styles.featureLock, { backgroundColor: theme.cardHighlight }]}>
        <Lock size={14} color={theme.textMuted} />
      </View>
    </Animated.View>
  );
}

export default function WageringScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const features = [
    {
      icon: <BarChart3 size={22} color={theme.accent} />,
      title: "Live Odds & Lines",
      description: "Real-time betting lines from top sportsbooks for every college baseball game.",
    },
    {
      icon: <Newspaper size={22} color={theme.accent} />,
      title: "Betting Articles & Picks",
      description: "Expert analysis, game previews, and betting breakdowns from trusted writers.",
    },

    {
      icon: <TrendingUp size={22} color={theme.accent} />,
      title: "Trends & Stats",
      description: "ATS records, over/under trends, and historical betting data for every team.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Wagering</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroSection, { opacity: headerFade }]}>
          <View style={[styles.heroBackground, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.heroPattern}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.patternDot,
                    {
                      backgroundColor: theme.accent,
                      opacity: 0.06 + i * 0.02,
                      left: `${15 + i * 14}%` as unknown as number,
                      top: `${10 + (i % 3) * 30}%` as unknown as number,
                      width: 40 + i * 10,
                      height: 40 + i * 10,
                      borderRadius: 20 + i * 5,
                    },
                  ]}
                />
              ))}
            </View>

            <Animated.View style={[styles.heroIconWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <View style={[styles.heroIconCircle, { backgroundColor: theme.accentGlow }]}>
                <View style={[styles.heroIconInner, { backgroundColor: theme.accent }]}>
                  <TrendingUp size={32} color="#FFFFFF" />
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.comingSoonBadge, { backgroundColor: theme.accent, transform: [{ scale: badgeScale }] }]}>
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </Animated.View>

            <Text style={[styles.heroTitle, { color: theme.text }]}>
              Your Edge in College Baseball Betting
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              We're building the ultimate wagering hub — odds, picks, promos, and more. Stay tuned.
            </Text>
          </View>
        </Animated.View>

        <View style={styles.promosSection}>
          <View style={styles.promosSectionHeader}>
            <View style={[styles.promosSectionIcon, { backgroundColor: theme.accentGlow }]}>
              <Gift size={18} color={theme.accent} />
            </View>
            <Text style={[styles.promosSectionTitle, { color: theme.text }]}>Exclusive Promo Codes</Text>
          </View>
          <Text style={[styles.promosSectionSubtitle, { color: theme.textSecondary }]}>
            Sign up with our partner links and score bonus offers.
          </Text>
          {PROMO_CODES.map((promo, index) => (
            <PromoCard
              key={promo.name}
              promo={promo}
              theme={theme}
              delay={600 + index * 100}
            />
          ))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>WHAT'S COMING</Text>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              theme={theme}
              delay={300 + index * 150}
            />
          ))}
        </View>

        <View style={[styles.footerNote, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Must be 21+ and in a legal sports betting state. Please gamble responsibly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heroSection: {
    marginBottom: 28,
  },
  heroBackground: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center" as const,
    overflow: "hidden" as const,
  },
  heroPattern: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: "absolute" as const,
  },
  heroIconWrapper: {
    marginBottom: 20,
  },
  heroIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  comingSoonBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  comingSoonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800" as const,
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center" as const,
    paddingHorizontal: 8,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    marginBottom: 14,
    marginLeft: 4,
  },
  featureCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  featureLock: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  footerNote: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center" as const,
    lineHeight: 18,
  },
  promosSection: {
    marginBottom: 24,
  },
  promosSectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 6,
    marginLeft: 4,
  },
  promosSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 10,
  },
  promosSectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: -0.2,
  },
  promosSectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    marginLeft: 4,
  },
  promoCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden" as const,
  },
  promoCardInner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 14,
  },
  promoLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  },
  promoLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  promoTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  promoName: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 2,
  },
  promoLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  promoArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
