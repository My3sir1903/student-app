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
  const { stats, profile, subjects } = useApp();
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
  const goalSubjects = subjects.filter((s) => (s.weeklyGoalMinutes ?? 0) > 0);
  const insights = stats.insights;

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

            {/* Focus Insights recap */}
            <View style={styles.card} testID="focus-insights-card">
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={18} color={colors.brandPrimary} />
                <Text style={styles.cardTitle}>Focus Insights</Text>
              </View>
              {insights.thisWeekMinutes === 0 ? (
                <Text style={styles.emptyText}>
                  Study this week to unlock your personalised recap.
                </Text>
              ) : (
                <View style={styles.insightBody}>
                  <View style={styles.insightRow}>
                    <View style={[styles.insightIcon, { backgroundColor: "rgba(217,119,54,0.14)" }]}>
                      <Ionicons name="trending-up" size={18} color={colors.brandPrimary} />
                    </View>
                    <View style={styles.insightText}>
                      <Text style={styles.insightLabel}>Weekly trend</Text>
                      <Text style={styles.insightValue}>
                        {insights.trendPct === null
                          ? `${formatDuration(insights.thisWeekMinutes)} — your first week!`
                          : `${insights.trendPct >= 0 ? "+" : ""}${insights.trendPct}% vs last week`}
                      </Text>
                    </View>
                    {insights.trendPct !== null ? (
                      <Ionicons
                        name={insights.trendPct >= 0 ? "arrow-up" : "arrow-down"}
                        size={18}
                        color={insights.trendPct >= 0 ? colors.success : colors.error}
                      />
                    ) : null}
                  </View>

                  {insights.bestDayLabel ? (
                    <View style={styles.insightRow}>
                      <View style={[styles.insightIcon, { backgroundColor: "rgba(79,134,198,0.16)" }]}>
                        <Ionicons name="star" size={18} color="#4F86C6" />
                      </View>
                      <View style={styles.insightText}>
                        <Text style={styles.insightLabel}>Best day</Text>
                        <Text style={styles.insightValue}>
                          {insights.bestDayLabel} · {formatDuration(insights.bestDayMinutes)}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {insights.favouriteSubject ? (
                    <View style={styles.insightRow}>
                      <View
                        style={[
                          styles.insightIcon,
                          { backgroundColor: `${insights.favouriteSubject.color}22` },
                        ]}
                      >
                        <Ionicons name="heart" size={18} color={insights.favouriteSubject.color} />
                      </View>
                      <View style={styles.insightText}>
                        <Text style={styles.insightLabel}>Favourite subject</Text>
                        <Text style={styles.insightValue}>
                          {insights.favouriteSubject.name} ·{" "}
                          {formatDuration(insights.favouriteSubject.minutes)}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            {/* Weekly subject goals */}
            {goalSubjects.length > 0 ? (
              <View style={styles.card} testID="weekly-goals-card">
                <Text style={styles.cardTitle}>Weekly Subject Goals</Text>
                <Text style={styles.cardSub}>Progress toward this week&apos;s targets</Text>
                <View style={{ marginTop: spacing.md, gap: spacing.lg }}>
                  {goalSubjects.map((s) => {
                    const goal = s.weeklyGoalMinutes ?? 0;
                    const done = stats.weeklyBySubjectId[s.id] ?? 0;
                    const pct = goal > 0 ? Math.min(1, done / goal) : 0;
                    const reached = done >= goal;
                    return (
                      <View key={s.id} testID={`weekly-goal-${s.id}`}>
                        <View style={styles.breakRow}>
                          <View style={styles.breakLabelRow}>
                            <View style={[styles.breakDot, { backgroundColor: s.color }]} />
                            <Text style={styles.breakName}>{s.name}</Text>
                            {reached ? (
                              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            ) : null}
                          </View>
                          <Text style={styles.breakValue}>
                            {formatDuration(done)} / {formatDuration(goal)}
                          </Text>
                        </View>
                        <View style={styles.breakTrack}>
                          <View
                            style={[
                              styles.breakFill,
                              {
                                width: `${pct * 100}%`,
                                backgroundColor: reached ? colors.success : s.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

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
  insightHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  insightBody: { marginTop: spacing.md, gap: spacing.md },
  insightRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  insightText: { flex: 1 },
  insightLabel: { fontFamily: fonts.text.medium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  insightValue: { fontFamily: fonts.text.bold, fontSize: fontSize.base, color: colors.onSurface, marginTop: 1 },
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
