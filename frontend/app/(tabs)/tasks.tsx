import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BottomSheet } from "@/src/components/BottomSheet";
import { EmptyState } from "@/src/components/EmptyState";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { SubjectSelect } from "@/src/components/SubjectSelect";
import { useApp } from "@/src/store/AppContext";
import { colors, fonts, fontSize, images, radius, spacing } from "@/src/theme";
import { Task } from "@/src/types";
import { formatDueDate, isOverdue } from "@/src/utils/time";

type Filter = "all" | "active" | "completed";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const DUE_OPTIONS: { label: string; value: () => string | null }[] = [
  { label: "No date", value: () => null },
  { label: "Today", value: () => dayjs().format("YYYY-MM-DD") },
  { label: "Tomorrow", value: () => dayjs().add(1, "day").format("YYYY-MM-DD") },
  { label: "This weekend", value: () => dayjs().day(6).format("YYYY-MM-DD") },
  { label: "Next week", value: () => dayjs().add(7, "day").format("YYYY-MM-DD") },
];

export default function TasksScreen() {
  const { tasks, subjectById, addTask, toggleTask, deleteTask } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [dueIdx, setDueIdx] = useState(0);

  const filtered = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const openSheet = () => {
    setTitle("");
    setSubjectId(null);
    setDueIdx(0);
    setSheetOpen(true);
  };

  const submit = () => {
    if (!title.trim()) return;
    addTask(title, subjectId, DUE_OPTIONS[dueIdx].value());
    setSheetOpen(false);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Tasks" subtitle={`${tasks.filter((t) => !t.completed).length} active`} />

      {/* Filter chips (chrome) */}
      <View style={styles.chipRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                testID={`filter-${f.key}`}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          <Image source={{ uri: images.tasksEmpty }} style={styles.emptyImage} contentFit="cover" />
          <EmptyState
            icon="clipboard-outline"
            title="No tasks here"
            message={
              filter === "completed"
                ? "Complete a task to see it here."
                : "Add a task to plan your study and earn XP."
            }
            testID="tasks-empty"
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TaskRow
              task={item}
              subjectName={subjectById(item.subjectId)?.name}
              subjectColor={subjectById(item.subjectId)?.color}
              onToggle={() => toggleTask(item.id)}
              onDelete={() => deleteTask(item.id)}
            />
          )}
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={openSheet} testID="add-task-fab">
        <Ionicons name="add" size={30} color={colors.onBrandPrimary} />
      </Pressable>

      {/* Add task sheet */}
      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="New Task"
        testID="add-task-sheet"
      >
        <Text style={styles.fieldLabel}>TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Finish calculus problem set"
          placeholderTextColor={colors.onSurfaceTertiary}
          style={styles.input}
          testID="task-title-input"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Text style={styles.fieldLabel}>SUBJECT</Text>
        <SubjectSelect selectedId={subjectId} onSelect={setSubjectId} testIDPrefix="task-subject" />

        <Text style={styles.fieldLabel}>DUE DATE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={{ flexGrow: 0, marginBottom: spacing.md }}
        >
          {DUE_OPTIONS.map((o, i) => {
            const active = dueIdx === i;
            return (
              <Pressable
                key={o.label}
                onPress={() => setDueIdx(i)}
                style={[styles.dueChip, active && styles.dueChipActive]}
                testID={`due-${i}`}
              >
                <Text style={[styles.dueChipText, active && styles.dueChipTextActive]}>
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <PrimaryButton
          label="Add Task"
          icon="add"
          onPress={submit}
          disabled={!title.trim()}
          testID="task-submit"
        />
      </BottomSheet>
    </View>
  );
}

function TaskRow({
  task,
  subjectName,
  subjectColor,
  onToggle,
  onDelete,
}: {
  task: Task;
  subjectName?: string;
  subjectColor?: string;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const overdue = !task.completed && isOverdue(task.dueDate);
  return (
    <View style={styles.taskRow} testID={`task-${task.id}`}>
      <Pressable onPress={onToggle} hitSlop={8} testID={`task-toggle-${task.id}`}>
        <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed ? (
            <Ionicons name="checkmark" size={18} color={colors.onBrandPrimary} />
          ) : null}
        </View>
      </Pressable>

      <View style={styles.taskInfo}>
        <Text
          style={[styles.taskTitle, task.completed && styles.taskTitleDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          {subjectName ? (
            <View style={[styles.subjectPill, { backgroundColor: `${subjectColor}22` }]}>
              <View style={[styles.subjectDot, { backgroundColor: subjectColor }]} />
              <Text style={[styles.subjectPillText, { color: subjectColor }]}>{subjectName}</Text>
            </View>
          ) : null}
          {task.dueDate ? (
            <View style={styles.dueBadge}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={overdue ? colors.error : colors.onSurfaceTertiary}
              />
              <Text style={[styles.dueText, overdue && { color: colors.error }]}>
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Pressable onPress={onDelete} hitSlop={8} style={styles.delete} testID={`task-delete-${task.id}`}>
        <Ionicons name="trash-outline" size={20} color={colors.onSurfaceTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  chipRowWrap: {
    height: 56,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  filterChip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  filterChipText: { fontFamily: fonts.text.semibold, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  filterChipTextActive: { color: colors.onBrandPrimary },

  listContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  emptyScroll: { paddingBottom: 120 },
  emptyImage: {
    width: "100%",
    height: 180,
    opacity: 0.5,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  taskInfo: { flex: 1 },
  taskTitle: { fontFamily: fonts.text.semibold, fontSize: fontSize.lg, color: colors.onSurface },
  taskTitleDone: { color: colors.onSurfaceTertiary, textDecorationLine: "line-through" },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" },
  subjectPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  subjectDot: { width: 6, height: 6, borderRadius: 3 },
  subjectPillText: { fontFamily: fonts.text.semibold, fontSize: fontSize.sm },
  dueBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  dueText: { fontFamily: fonts.text.medium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  delete: { padding: spacing.xs },

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
  dueChip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  dueChipActive: { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary },
  dueChipText: { fontFamily: fonts.text.semibold, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  dueChipTextActive: { color: colors.onSurface },
});
