import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/src/store/AppContext";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";

interface SubjectSelectProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  includeNone?: boolean;
  testIDPrefix?: string;
}

// Horizontal, single-line scroller of subject chips (chrome, not content).
export function SubjectSelect({
  selectedId,
  onSelect,
  includeNone = true,
  testIDPrefix = "subject",
}: SubjectSelectProps) {
  const { subjects } = useApp();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {includeNone ? (
        <Chip
          label="General"
          color={colors.onSurfaceTertiary}
          selected={selectedId === null}
          onPress={() => onSelect(null)}
          testID={`${testIDPrefix}-chip-none`}
        />
      ) : null}
      {subjects.map((s) => (
        <Chip
          key={s.id}
          label={s.name}
          color={s.color}
          selected={selectedId === s.id}
          onPress={() => onSelect(s.id)}
          testID={`${testIDPrefix}-chip-${s.id}`}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  color,
  selected,
  onPress,
  testID,
}: {
  label: string;
  color: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={[
        styles.chip,
        selected && { borderColor: color, backgroundColor: `${color}22` },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.chipText, selected && { color: colors.onSurface }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    height: 40,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipText: {
    fontFamily: fonts.text.semibold,
    fontSize: fontSize.base,
    color: colors.onSurfaceTertiary,
  },
});
