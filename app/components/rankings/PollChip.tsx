import React, { useRef } from "react";
import { Text, StyleSheet, TouchableOpacity, Animated, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";
import { RankingPoll } from "@/hooks/useESPNData";
import Colors from "@/constants/colors";

const POLL_COLORS: Record<string, string> = {
  "0": Colors.dark.accent,
  "1": Colors.dark.blue,
  "2": Colors.dark.orange,
  "3": Colors.dark.purple,
  "4": Colors.dark.teal,
  "5": Colors.dark.gold,
  "6": "#EC4899",
};

export function getPollColor(index: number): string {
  return POLL_COLORS[String(index)] ?? Colors.dark.textSecondary;
}

export default function PollChip({
  poll,
  index,
  isSelected,
  onPress,
}: {
  poll: RankingPoll;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const color = getPollColor(index);
  const scaleRef = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleRef, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleRef, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleRef }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.pollChip,
          { backgroundColor: theme.surface, borderColor: theme.border },
          isSelected && { backgroundColor: color, borderColor: color },
        ]}
      >
        <View style={[styles.pollDot, { backgroundColor: isSelected ? theme.white : color }]} />
        <Text
          style={[styles.pollChipText, { color: theme.textSecondary }, isSelected && { color: theme.white }]}
          numberOfLines={1}
        >
          {poll.shortName}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pollChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pollDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pollChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
