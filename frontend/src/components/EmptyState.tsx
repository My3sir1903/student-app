import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  testID?: string;
}

export function EmptyState({ icon, title, message, testID }: EmptyStateProps) {
  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={34} color={colors.brandPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display.semibold,
    fontSize: fontSize["2xl"],
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    fontFamily: fonts.text.regular,
    fontSize: fontSize.base,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    lineHeight: 20,
  },
});
