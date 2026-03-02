import React, { useRef } from "react";
import { Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";
import { ConferenceOption } from "@/types/baseball";

export default function ConferenceChip({
  conf,
  isSelected,
  onPress,
}: {
  conf: ConferenceOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scaleRef = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleRef, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleRef, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    requestAnimationFrame(() => {
      onPress();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleRef }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.confChip,
          { backgroundColor: theme.surface, borderColor: theme.border },
          isSelected && { backgroundColor: theme.blue, borderColor: theme.blue },
        ]}
      >
        <Text
          style={[styles.confChipText, { color: theme.textSecondary }, isSelected && { color: theme.white }]}
          numberOfLines={1}
        >
          {conf.shortName}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  confChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  confChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
