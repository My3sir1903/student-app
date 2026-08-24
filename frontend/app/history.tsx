import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/EmptyState";
import { useApp } from "@/src/store/AppContext";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";
import { StudySession } from "@/src/types";
import { formatDuration } from "@/src/utils/time";

function dayHeader(key: string): string {
  const d = dayjs(key);
  const today = dayjs().startOf("day");
  const diff = d.startOf("day").diff(today, "day");
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return d.format("dddd, MMM D");
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions, subjectById, deleteSession } = useApp();

  const sections = useMemo(() => {
    const sorted = [...sessions].sort(
      (a, b) => dayjs(b.startedAt).valueOf() - dayjs(a.startedAt).valueOf(),
    );
    const map = new Map<string, StudySession[]>();
    for (const s of sorted) {
      const key = dayjs(s.startedAt).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([key, data]) => ({
      title: dayHeader(key),
      total: data.reduce((a, b) => a + b.durationMinutes, 0),
      data,
    }));
  }, [sessions]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} testID="history-back">
          <Ionicons name="arrow-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Session History</Text>
        <View style={{ width: 26 }} />
      </View>

      {sessions.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No sessions yet"
          message="Finish a focus session on the Timer to see it logged here."
          testID="history-empty"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionTotal}>{formatDuration(section.total)}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const subj = subjectById(item.subjectId);
            const color = subj?.color ?? colors.onSurfaceTertiary;
            return (
              <View style={styles.row} testID={`session-${item.id}`}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={styles.info}>
                  <Text style={styles.subject}>{subj?.name ?? "General"}</Text>
                  <Text style={styles.time}>{dayjs(item.startedAt).format("h:mm A")}</Text>
                </View>
                <Text style={styles.duration}>{formatDuration(item.durationMinutes)}</Text>
                <Pressable
                  onPress={() => deleteSession(item.id)}
                  hitSlop={8}
                  style={styles.delete}
                  testID={`session-delete-${item.id}`}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.onSurfaceTertiary} />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontFamily: fonts.display.bold, fontSize: fontSize["2xl"], color: colors.onSurface, letterSpacing: 0.5 },
  content: { padding: spacing.lg, paddingBottom: 120 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontFamily: fonts.text.bold, fontSize: fontSize.base, color: colors.onSurface },
  sectionTotal: { fontFamily: fonts.text.semibold, fontSize: fontSize.sm, color: colors.brandPrimary },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  info: { flex: 1 },
  subject: { fontFamily: fonts.text.semibold, fontSize: fontSize.lg, color: colors.onSurface },
  time: { fontFamily: fonts.text.regular, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  duration: { fontFamily: fonts.display.bold, fontSize: fontSize.xl, color: colors.onSurfaceSecondary },
  delete: { padding: spacing.xs },
});
