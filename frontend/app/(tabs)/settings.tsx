import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/src/components/BottomSheet";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useApp } from "@/src/store/AppContext";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";
import { formatDuration } from "@/src/utils/time";

const GOAL_OPTIONS = [30, 60, 90, 120, 180, 240];

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, subjects, setDailyGoal, resetAllData } = useApp();
  const [goalOpen, setGoalOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="PREFERENCES">
          <Row
            icon="flag"
            label="Daily Study Goal"
            value={formatDuration(profile.dailyGoalMinutes)}
            onPress={() => setGoalOpen(true)}
            testID="row-daily-goal"
          />
        </Section>

        <Section title="SUBJECTS">
          <Row
            icon="library"
            label="Manage Subjects"
            value={`${subjects.length}`}
            onPress={() => router.push("/subjects")}
            testID="row-manage-subjects"
          />
        </Section>

        <Section title="DATA">
          <Row
            icon="trash"
            label="Reset All Data"
            danger
            onPress={() => setResetOpen(true)}
            testID="row-reset-data"
          />
        </Section>

        <Section title="ABOUT">
          <Row icon="information-circle" label="Version" value="1.0.0" testID="row-version" />
          <View style={styles.aboutNote}>
            <Text style={styles.aboutText}>
              StudyFlow stores all data locally on your device. No account needed.
            </Text>
          </View>
        </Section>
      </ScrollView>

      {/* Goal sheet */}
      <BottomSheet visible={goalOpen} onClose={() => setGoalOpen(false)} title="Daily Study Goal" testID="goal-sheet">
        <Text style={styles.sheetHint}>Choose your target study time per day.</Text>
        <View style={styles.goalGrid}>
          {GOAL_OPTIONS.map((m) => {
            const active = profile.dailyGoalMinutes === m;
            return (
              <Pressable
                key={m}
                onPress={() => setDailyGoal(m)}
                style={[styles.goalOption, active && styles.goalOptionActive]}
                testID={`goal-option-${m}`}
              >
                <Text style={[styles.goalOptionText, active && styles.goalOptionTextActive]}>
                  {formatDuration(m)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton label="Done" onPress={() => setGoalOpen(false)} style={{ marginTop: spacing.lg }} testID="goal-done" />
      </BottomSheet>

      {/* Reset confirm */}
      <BottomSheet visible={resetOpen} onClose={() => setResetOpen(false)} title="Reset All Data?" testID="reset-sheet">
        <Text style={styles.sheetHint}>
          This permanently deletes all sessions, tasks, XP and streaks, and restores default subjects.
          This cannot be undone.
        </Text>
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          <PrimaryButton
            label="Reset Everything"
            icon="trash"
            variant="danger"
            onPress={() => {
              resetAllData();
              setResetOpen(false);
            }}
            testID="reset-confirm"
          />
          <PrimaryButton label="Cancel" variant="ghost" onPress={() => setResetOpen(false)} testID="reset-cancel" />
        </View>
      </BottomSheet>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  testID: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}
      testID={testID}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? "rgba(244,63,94,0.14)" : colors.surfaceTertiary }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.onSurfaceSecondary} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontFamily: fonts.text.bold,
    fontSize: fontSize.sm,
    color: colors.onSurfaceTertiary,
    letterSpacing: 1.2,
    marginLeft: spacing.xs,
  },
  sectionBody: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.surfaceTertiary },
  rowIcon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontFamily: fonts.text.semibold, fontSize: fontSize.lg, color: colors.onSurface },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowValue: { fontFamily: fonts.text.medium, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  aboutNote: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.xs },
  aboutText: { fontFamily: fonts.text.regular, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, lineHeight: 18 },

  sheetHint: { fontFamily: fonts.text.regular, fontSize: fontSize.base, color: colors.onSurfaceTertiary, lineHeight: 20 },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.lg },
  goalOption: {
    width: "30%",
    flexGrow: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  goalOptionActive: { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary },
  goalOptionText: { fontFamily: fonts.display.bold, fontSize: fontSize.xl, color: colors.onSurfaceTertiary },
  goalOptionTextActive: { color: colors.onSurface },
});
