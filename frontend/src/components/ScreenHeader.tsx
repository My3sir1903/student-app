import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, fontSize, spacing } from "@/src/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title} testID="screen-title">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textWrap: { flex: 1 },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: fontSize["3xl"],
    color: colors.onSurface,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fonts.text.medium,
    fontSize: fontSize.base,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
});
