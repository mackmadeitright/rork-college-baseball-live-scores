import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { X, Sparkles, ShieldCheck, Zap, Heart, Star, Trophy } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePremium } from "@/providers/PremiumProvider";
import { useTheme } from "@/providers/ThemeProvider";

interface AdContent {
  title: string;
  subtitle: string;
  cta: string;
  bgColor: string;
  accentColor: string;
  iconBg: string;
  icon: "sparkles" | "shield" | "zap" | "heart" | "star" | "trophy";
  type: "promo";
}

const ICON_MAP = {
  sparkles: Sparkles,
  shield: ShieldCheck,
  zap: Zap,
  heart: Heart,
  star: Star,
  trophy: Trophy,
};

const ADS: AdContent[] = [
  {
    title: "Go Ad-Free",
    subtitle: "Just $3.99/year \u2022 No distractions",
    cta: "Upgrade",
    bgColor: "#14281D",
    accentColor: "#34D399",
    iconBg: "rgba(52, 211, 153, 0.15)",
    icon: "sparkles",
    type: "promo",
  },
  {
    title: "Support Dugout",
    subtitle: "$3.99/year \u2022 Ad-free always",
    cta: "Get Premium",
    bgColor: "#172032",
    accentColor: "#60A5FA",
    iconBg: "rgba(96, 165, 250, 0.15)",
    icon: "shield",
    type: "promo",
  },
  {
    title: "Unlock Premium",
    subtitle: "No ads \u2022 Just pure college baseball",
    cta: "Upgrade Now",
    bgColor: "#2D1515",
    accentColor: "#F87171",
    iconBg: "rgba(248, 113, 113, 0.15)",
    icon: "heart",
    type: "promo",
  },
  {
    title: "Love the App?",
    subtitle: "Remove banners with a single purchase",
    cta: "Go Pro",
    bgColor: "#1F1B2E",
    accentColor: "#C084FC",
    iconBg: "rgba(192, 132, 252, 0.15)",
    icon: "star",
    type: "promo",
  },
  {
    title: "Level Up",
    subtitle: "Ad-free experience \u2022 $3.99/year",
    cta: "Upgrade",
    bgColor: "#1A1A0E",
    accentColor: "#FACC15",
    iconBg: "rgba(250, 204, 21, 0.15)",
    icon: "trophy",
    type: "promo",
  },
  {
    title: "Go Premium",
    subtitle: "Fast \u2022 Clean \u2022 No distractions",
    cta: "Buy Now",
    bgColor: "#0F1D2D",
    accentColor: "#38BDF8",
    iconBg: "rgba(56, 189, 248, 0.15)",
    icon: "zap",
    type: "promo",
  },
];

export default function BannerAd() {
  const { isPremium } = usePremium();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [adIndex] = useState(() => Math.floor(Math.random() * ADS.length));

  useEffect(() => {
    if (!isPremium && !dismissed) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [isPremium, dismissed]);

  const handleDismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setDismissed(true));
  }, [slideAnim]);

  const handleUpgrade = useCallback(() => {
    router.push("/paywall" as any);
  }, [router]);

  if (isPremium || dismissed) return null;

  const ad = ADS[adIndex];
  const IconComponent = ICON_MAP[ad.icon];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? ad.bgColor : theme.card,
          borderColor: isDark ? `${ad.accentColor}22` : theme.border,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleUpgrade}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrap, { backgroundColor: isDark ? ad.iconBg : `${ad.accentColor}18` }]}>
          <IconComponent size={18} color={ad.accentColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isDark ? "#FFFFFF" : theme.text }]}>
            {ad.title}
          </Text>
          <Text
            style={[styles.subtitle, { color: isDark ? "rgba(255,255,255,0.55)" : theme.textMuted }]}
            numberOfLines={1}
          >
            {ad.subtitle}
          </Text>
        </View>
        <View style={[styles.ctaButton, { backgroundColor: ad.accentColor }]}>
          <Text style={styles.ctaText}>{ad.cta}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={handleDismiss}
        hitSlop={12}
      >
        <X size={12} color={isDark ? "rgba(255,255,255,0.35)" : theme.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingLeft: 12,
    paddingRight: 32,
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontSize: 11,
  },
  ctaButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    flexShrink: 0,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
