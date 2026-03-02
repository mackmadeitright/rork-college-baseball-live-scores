import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Shield, Zap, Eye, Star, Check, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { usePremium } from "@/providers/PremiumProvider";
import { useTheme } from "@/providers/ThemeProvider";

const FEATURES = [
  { icon: Eye, label: "Ad-free experience", desc: "No banner ads anywhere" },
  { icon: Zap, label: "Clean interface", desc: "Distraction-free scores" },
  { icon: Star, label: "Support development", desc: "Help us keep improving" },
];

export default function PaywallScreen() {
  const {
    isPremium,
    premiumPackage,
    purchasePremium,
    restorePurchases,
    isPurchasing,
    isRestoring,
    isLoadingOfferings,
  } = usePremium();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isPremium) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Welcome to Premium!",
        "You now have an ad-free experience. Enjoy!",
        [{ text: "Awesome", onPress: () => router.back() }]
      );
    }
  }, [isPremium]);

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await purchasePremium();
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    restorePurchases();
  };

  const priceLabel = premiumPackage?.product?.priceString ?? "$3.99";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.closeBtn, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        testID="paywall-close-btn"
      >
        <X size={20} color={theme.text} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? "#1B4332" : "#DCFCE7" }]}>
            <Shield size={36} color={isDark ? "#52B788" : "#16A34A"} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Dugout Premium
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
            $3.99/year. Ad-free experience.
          </Text>
        </View>

        <View style={[styles.featuresCard, { backgroundColor: theme.card }]}>
          {FEATURES.map((feature, index) => (
            <View key={index}>
              {index > 0 && (
                <View style={[styles.featureDivider, { backgroundColor: theme.separator }]} />
              )}
              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: isDark ? "rgba(82,183,136,0.12)" : "rgba(22,163,74,0.08)" }]}>
                  <feature.icon size={18} color={isDark ? "#52B788" : "#16A34A"} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureLabel, { color: theme.text }]}>
                    {feature.label}
                  </Text>
                  <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                    {feature.desc}
                  </Text>
                </View>
                <Check size={16} color={isDark ? "#52B788" : "#16A34A"} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.purchaseSection}>
          <View style={[styles.priceCard, { backgroundColor: isDark ? "#1B4332" : "#F0FDF4", borderColor: isDark ? "#2D6A4F" : "#BBF7D0" }]}>
            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>
              Annual subscription
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                {priceLabel}
              </Text>
              <View style={[styles.priceBadge, { backgroundColor: isDark ? "#2D6A4F" : "#BBF7D0" }]}>
                <Text style={[styles.priceBadgeText, { color: isDark ? "#A7F3D0" : "#166534" }]}>
                  Per Year
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.purchaseBtn,
              { backgroundColor: isDark ? "#52B788" : "#16A34A" },
              (isPurchasing || isLoadingOfferings) && styles.purchaseBtnDisabled,
            ]}
            onPress={handlePurchase}
            disabled={isPurchasing || isLoadingOfferings || !premiumPackage}
            activeOpacity={0.8}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.purchaseBtnText}>
                {isLoadingOfferings ? "Loading..." : `Remove Ads — ${priceLabel}/year`}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={isRestoring}
            activeOpacity={0.7}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={theme.textMuted} />
            ) : (
              <Text style={[styles.restoreBtnText, { color: theme.textMuted }]}>
                Restore Purchase
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeBtn: {
    position: "absolute",
    top: 54,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
  },
  featuresCard: {
    borderRadius: 14,
    marginBottom: 28,
    overflow: "hidden",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  featureDesc: {
    fontSize: 12,
  },
  purchaseSection: {
    gap: 12,
  },
  priceCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  purchaseBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseBtnDisabled: {
    opacity: 0.6,
  },
  purchaseBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  restoreBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  restoreBtnText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
});
