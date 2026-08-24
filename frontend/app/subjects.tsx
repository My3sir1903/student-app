import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheet } from "@/src/components/BottomSheet";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { SUBJECT_COLORS } from "@/src/store/defaults";
import { useApp } from "@/src/store/AppContext";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";
import { Subject } from "@/src/types";
import { formatDuration } from "@/src/utils/time";

const WEEKLY_GOAL_OPTIONS = [0, 60, 120, 180, 300, 420, 600];
function goalLabel(m: number): string {
  return m === 0 ? "No goal" : formatDuration(m);
}

export default function SubjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { subjects, addSubject, updateSubject, deleteSubject } = useApp();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(0);

  const openNew = () => {
    setEditing(null);
    setName("");
    setColor(SUBJECT_COLORS[0]);
    setWeeklyGoal(0);
    setSheetOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setName(s.name);
    setColor(s.color);
    setWeeklyGoal(s.weeklyGoalMinutes ?? 0);
    setSheetOpen(true);
  };

  const submit = () => {
    if (!name.trim()) return;
    if (editing) updateSubject(editing.id, name, color, weeklyGoal);
    else addSubject(name, color, weeklyGoal);
    setSheetOpen(false);
  };

  const remove = () => {
    if (editing) deleteSubject(editing.id);
    setSheetOpen(false);
  };

  return (
    <View style={styles.root}>
      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} testID="subjects-back">
          <Ionicons name="arrow-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Subjects</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {subjects.map((s) => (
          <Pressable
            key={s.id}
            style={styles.subjectRow}
            onPress={() => openEdit(s)}
            testID={`subject-row-${s.id}`}
          >
            <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{s.name}</Text>
              {s.weeklyGoalMinutes ? (
                <Text style={styles.subjectGoal}>{formatDuration(s.weeklyGoalMinutes)} / week</Text>
              ) : null}
            </View>
            <Ionicons name="pencil" size={18} color={colors.onSurfaceTertiary} />
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={openNew} testID="add-subject-fab">
        <Ionicons name="add" size={30} color={colors.onBrandPrimary} />
      </Pressable>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? "Edit Subject" : "New Subject"}
        testID="subject-sheet"
      >
        <Text style={styles.fieldLabel}>NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Computer Science"
          placeholderTextColor={colors.onSurfaceTertiary}
          style={styles.input}
          autoFocus
          testID="subject-name-input"
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Text style={styles.fieldLabel}>COLOR</Text>
        <View style={styles.colorRow}>
          {SUBJECT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
              testID={`color-${c}`}
            >
              {color === c ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>WEEKLY STUDY GOAL</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.goalRow}
          style={{ flexGrow: 0 }}
        >
          {WEEKLY_GOAL_OPTIONS.map((m) => {
            const active = weeklyGoal === m;
            return (
              <Pressable
                key={m}
                onPress={() => setWeeklyGoal(m)}
                style={[styles.goalChip, active && styles.goalChipActive]}
                testID={`weekly-goal-${m}`}
              >
                <Text style={[styles.goalChipText, active && styles.goalChipTextActive]}>
                  {goalLabel(m)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <PrimaryButton
          label={editing ? "Save Changes" : "Add Subject"}
          icon={editing ? "checkmark" : "add"}
          onPress={submit}
          disabled={!name.trim()}
          style={{ marginTop: spacing.lg }}
          testID="subject-submit"
        />
        {editing ? (
          <PrimaryButton
            label="Delete Subject"
            icon="trash"
            variant="danger"
            onPress={remove}
            style={{ marginTop: spacing.md }}
            testID="subject-delete"
          />
        ) : null}
      </BottomSheet>
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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  subjectDot: { width: 14, height: 14, borderRadius: 7 },
  subjectInfo: { flex: 1 },
  subjectName: { fontFamily: fonts.text.semibold, fontSize: fontSize.lg, color: colors.onSurface },
  subjectGoal: {
    fontFamily: fonts.text.medium,
    fontSize: fontSize.sm,
    color: colors.brandPrimary,
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    fontFamily: fonts.text.bold,
    fontSize: fontSize.sm,
    color: colors.onSurfaceTertiary,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 52,
    fontFamily: fonts.text.medium,
    fontSize: fontSize.lg,
    color: colors.onSurface,
  },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotActive: { borderColor: colors.onSurface },
  goalRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  goalChip: {
    height: 40,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  goalChipActive: { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary },
  goalChipText: { fontFamily: fonts.text.semibold, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  goalChipTextActive: { color: colors.onSurface },
});
