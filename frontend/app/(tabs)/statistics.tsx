import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { ACHIEVEMENTS } from "@/src/store/defaults";
import { useApp } from "@/src/store/AppContext";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";
import { formatDuration } from "@/src/utils/time";

type Tab = "metrics" | "achievements";

export default function StatisticsScreen() {
  const { stats, profile } = useApp();
  const [tab, setTab] = useState<Tab>("metrics");

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - spacing.lg * 2 - spacing.lg * 2;

  const maxWeekly = Math.max(30, ...stats.weekly.map((w) => w.value));
  const barData = stats.weekly.map((w) => ({
    value: w.value,
    label: w.label,
    frontColor: w.value > 0 ? colors.brandPrimary : colors.surfaceTertiary,
  }));
  const totalBySubject = stats.bySubject.reduce((a, b) => a + b.minutes, 0);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Statistics" />

      {/* Segmented tabs (chrome) */}
      <View style={styles.segmentWrap}>
        <View style={styles.segment}>
          {(["metrics", "achievements"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <Text
                key={t}
                onPress={() => setTab(t)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                testID={`stats-tab-${t}`}
              >
                {t === "metrics" ? "Metrics" : "Achievements"}
              </Text>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === "metrics" ? (
          <>
            {/* Summary grid */}
            <View style={styles.grid}>
              <SummaryCard icon="today" color="#4F86C6" value={formatDuration(stats.todayMinutes)} label="Today" />
              <SummaryCard icon="calendar" color={colors.brandPrimary} value={formatDuration(stats.weekMinutes)} label="This Week" />
              <SummaryCard icon="albums" color={colors.success} value={formatDuration(stats.totalMinutes)} label="Total Studied" />
              <SummaryCard icon="flame" color="#E0A458" value={`${stats.streak}`} label="Current Streak" />
              <SummaryCard icon="checkmark-done" color="#C15C8A" value={`${stats.completedTasksTotal}`} label="Tasks Done" />
              <SummaryCard icon="school" color="#6C7BC4" value={`${stats.level}`} label="Level" />
            </View>

            {/* Weekly chart */}
            <View style={styles.card} testID="weekly-chart-card">
              <Text style={styles.cardTitle}>Last 7 Days</Text>
              <Text style={styles.cardSub}>Minutes studied per day</Text>
              <View style={{ marginTop: spacing.lg, marginLeft: -spacing.sm }}>
                <BarChart
                  data={barData}
                  width={chartWidth}
                  height={160}
                  barWidth={20}
                  barBorderRadius={4}
                  spacing={(chartWidth - 20 * 7) / 7}
                  initialSpacing={spacing.sm}
                  maxValue={Math.ceil(maxWeekly / 30) * 30}
                  noOfSections={4}
                  hideRules
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={styles.axisText}
                  xAxisLabelTextStyle={styles.axisText}
                  isAnimated
                />
              </View>
            </View>

            {/* Subject breakdown */}
            <View style={styles.card} testID="subject-breakdown-card">
              <Text style={styles.cardTitle}>Study Time by Subject</Text>
              {stats.bySubject.length === 0 ? (
                <Text style={styles.emptyText}>No sessions recorded yet.</Text>
              ) : (
                <View style={{ marginTop: spacing.md, gap: spacing.md }}>
                  {stats.bySubject.map((s) => {
                    const pct = totalBySubject > 0 ? s.minutes / totalBySubject : 0;
                    return (
                      <View key={s.subjectId ?? "none"} testID={`breakdown-${s.subjectId ?? "none"}`}>
                        <View style={styles.breakRow}>
                          <View style={styles.breakLabelRow}>
                            <View style={[styles.breakDot, { backgroundColor: s.color }]} />
                            <Text style={styles.breakName}>{s.name}</Text>
                          </View>
                          <Text style={styles.breakValue}>{formatDuration(s.minutes)}</Text>
                        </View>
                        <View style={styles.breakTrack}>
                          <View style={[styles.breakFill, { width: `${pct * 100}%`, backgroundColor: s.color }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.achGrid}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = profile.unlockedAchievements.includes(a.id);
              return (
                <View
                  key={a.id}
                  style={[styles.achCard, unlocked ? styles.achUnlocked : styles.achLocked]}
                  testID={`achievement-${a.id}`}
                >
                  <View
                    style={[
                      styles.achIcon,
                      { backgroundColor: unlocked ? colors.brandTertiary : colors.surfaceTertiary },
                    ]}
                  >
                    <Ionicons
                      name={(unlocked ? a.icon : "lock-closed") as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={unlocked ? colors.brandPrimary : colors.onSurfaceTertiary}
                    />
                  </View>
                  <Text style={[styles.achTitle, !unlocked && styles.achTextLocked]}>{a.title}</Text>
                  <Text style={[styles.achDesc, !unlocked && styles.achTextLocked]}>{a.description}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryCard({
  icon,
  color,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  segmentWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
  },
  segmentItem: {
    flex: 1,
    textAlign: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    fontFamily: fonts.text.bold,
    fontSize: fontSize.base,
    color: colors.onSurfaceTertiary,
    overflow: "hidden",
  },
  segmentItemActive: { backgroundColor: colors.brandPrimary, color: colors.onBrandPrimary },

  content: { paddingHorizontal: spacing.lg, paddingBottom: 120, gap: spacing.lg },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  summaryCard: {
    width: "31%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  summaryValue: { fontFamily: fonts.display.bold, fontSize: fontSize["2xl"], color: colors.onSurface },
  summaryLabel: { fontFamily: fonts.text.medium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },

  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTitle: { fontFamily: fonts.display.semibold, fontSize: fontSize.xl, color: colors.onSurface, letterSpacing: 0.3 },
  cardSub: { fontFamily: fonts.text.regular, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  axisText: { color: colors.onSurfaceTertiary, fontFamily: fonts.text.medium, fontSize: 11 },
  emptyText: { fontFamily: fonts.text.regular, fontSize: fontSize.base, color: colors.onSurfaceTertiary, marginTop: spacing.md },

  breakRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  breakLabelRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  breakDot: { width: 10, height: 10, borderRadius: 5 },
  breakName: { fontFamily: fonts.text.semibold, fontSize: fontSize.base, color: colors.onSurface },
  breakValue: { fontFamily: fonts.text.bold, fontSize: fontSize.base, color: colors.onSurfaceSecondary },
  breakTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceTertiary, overflow: "hidden" },
  breakFill: { height: "100%", borderRadius: radius.pill },

  achGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  achCard: {
    width: "47.5%",
    flexGrow: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  achUnlocked: { backgroundColor: colors.surfaceSecondary, borderColor: colors.brandPrimary },
  achLocked: { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: 0.75 },
  achIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  achTitle: { fontFamily: fonts.text.bold, fontSize: fontSize.lg, color: colors.onSurface, marginBottom: 2 },
  achDesc: { fontFamily: fonts.text.regular, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, lineHeight: 18 },
  achTextLocked: { color: colors.onSurfaceTertiary },
});
