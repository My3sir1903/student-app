import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { ProgressRing } from "@/src/components/ProgressRing";
import { useApp } from "@/src/store/AppContext";
import { colors, fonts, fontSize, images, radius, spacing } from "@/src/theme";
import { formatDuration } from "@/src/utils/time";

function greeting(): string {
  const h = dayjs().hour();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stats, profile } = useApp();

  const goal = profile.dailyGoalMinutes;
  const goalProgress = goal > 0 ? stats.todayMinutes / goal : 0;
  const goalPct = Math.round(Math.min(1, goalProgress) * 100);
  const xpProgress = stats.xpForLevel > 0 ? stats.xpIntoLevel / stats.xpForLevel : 0;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: images.homeHeaderBg }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["rgba(15,17,21,0.55)", "rgba(15,17,21,0.85)", colors.surface]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroContent, { paddingTop: insets.top + spacing.lg }]}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.brand}>StudyFlow</Text>

            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNum}>{stats.level}</Text>
              </View>
              <View style={styles.xpWrap}>
                <View style={styles.xpLabelRow}>
                  <Text style={styles.xpLabel}>Level {stats.level}</Text>
                  <Text style={styles.xpValue}>
                    {stats.xpIntoLevel}/{stats.xpForLevel} XP
                  </Text>
                </View>
                <View style={styles.xpTrack}>
                  <View style={[styles.xpFill, { width: `${Math.min(100, xpProgress * 100)}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Daily goal ring */}
        <View style={styles.section}>
          <View style={styles.goalCard} testID="daily-goal-card">
            <ProgressRing size={148} strokeWidth={12} progress={goalProgress}>
              <Text style={styles.goalMinutes}>{formatDuration(stats.todayMinutes)}</Text>
              <Text style={styles.goalOf}>of {formatDuration(goal)}</Text>
            </ProgressRing>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Daily Goal</Text>
              <Text style={styles.goalPct}>{goalPct}%</Text>
              <Text style={styles.goalSub}>
                {stats.todayMinutes >= goal
                  ? "Goal reached — great work!"
                  : `${formatDuration(Math.max(0, goal - stats.todayMinutes))} to go`}
              </Text>
            </View>
          </View>
        </View>

        {/* Metrics grid */}
        <View style={styles.grid}>
          <MetricCard
            icon="flame"
            iconColor={colors.brandPrimary}
            value={`${stats.streak}`}
            label={stats.streak === 1 ? "Day Streak" : "Day Streak"}
            testID="metric-streak"
          />
          <MetricCard
            icon="checkmark-done"
            iconColor={colors.success}
            value={`${stats.completedTasksToday}`}
            label="Tasks Today"
            testID="metric-tasks-today"
          />
          <MetricCard
            icon="time"
            iconColor="#4F86C6"
            value={formatDuration(stats.todayMinutes)}
            label="Studied Today"
            testID="metric-today"
          />
          <MetricCard
            icon="flash"
            iconColor="#E0A458"
            value={`${stats.sessionsToday}`}
            label="Sessions Today"
            testID="metric-sessions"
          />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: spacing.lg }]}>
        <LinearGradient
          colors={["rgba(15,17,21,0)", colors.surface]}
          style={styles.ctaScrim}
        />
        <PrimaryButton
          label="Start Studying"
          icon="play"
          onPress={() => router.push("/timer")}
          testID="start-studying-button"
        />
      </View>
    </View>
  );
}

function MetricCard({
  icon,
  iconColor,
  value,
  label,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
  testID: string;
}) {
  return (
    <View style={styles.metricCard} testID={testID}>
      <View style={[styles.metricIcon, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 240, overflow: "hidden" },
  heroContent: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: "flex-end", paddingBottom: spacing.lg },
  greeting: {
    fontFamily: fonts.text.medium,
    fontSize: fontSize.base,
    color: colors.onSurfaceSecondary,
  },
  brand: {
    fontFamily: fonts.display.bold,
    fontSize: fontSize["4xl"],
    color: colors.onSurface,
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  levelRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  levelNum: {
    fontFamily: fonts.display.bold,
    fontSize: fontSize["2xl"],
    color: colors.onBrandPrimary,
  },
  xpWrap: { flex: 1 },
  xpLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  xpLabel: { fontFamily: fonts.text.bold, fontSize: fontSize.base, color: colors.onSurface },
  xpValue: { fontFamily: fonts.text.medium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  xpTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
  },
  xpFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.brandPrimary },

  section: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  goalMinutes: { fontFamily: fonts.display.bold, fontSize: fontSize["2xl"], color: colors.onSurface },
  goalOf: { fontFamily: fonts.text.medium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  goalInfo: { flex: 1 },
  goalTitle: { fontFamily: fonts.text.semibold, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  goalPct: { fontFamily: fonts.display.bold, fontSize: fontSize["4xl"], color: colors.brandPrimary, marginVertical: 2 },
  goalSub: { fontFamily: fonts.text.medium, fontSize: fontSize.sm, color: colors.onSurfaceSecondary },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metricCard: {
    width: "47.5%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  metricValue: { fontFamily: fonts.display.bold, fontSize: fontSize["3xl"], color: colors.onSurface },
  metricLabel: { fontFamily: fonts.text.medium, fontSize: fontSize.base, color: colors.onSurfaceTertiary },

  ctaWrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 0,
  },
  ctaScrim: {
    position: "absolute",
    left: -spacing.lg,
    right: -spacing.lg,
    bottom: 0,
    height: 120,
    pointerEvents: "none",
  },
});
