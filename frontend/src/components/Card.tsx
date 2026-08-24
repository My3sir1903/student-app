import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export function Card({ children, style, testID }: CardProps) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
