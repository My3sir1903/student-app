import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled,
  loading,
  style,
  testID,
}: PrimaryButtonProps) {
  const bg =
    variant === "primary"
      ? colors.brandPrimary
      : variant === "danger"
        ? "rgba(244, 63, 94, 0.14)"
        : variant === "secondary"
          ? colors.surfaceTertiary
          : "transparent";
  const fg =
    variant === "primary"
      ? colors.onBrandPrimary
      : variant === "danger"
        ? colors.error
        : colors.onSurface;

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        variant === "ghost" && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  ghost: { borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  label: {
    fontFamily: fonts.text.bold,
    fontSize: fontSize.lg,
  },
});
