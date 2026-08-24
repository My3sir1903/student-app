import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheet } from "@/src/components/BottomSheet";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { ProgressRing } from "@/src/components/ProgressRing";
import { SubjectSelect } from "@/src/components/SubjectSelect";
import { useApp } from "@/src/store/AppContext";
import { useTimer } from "@/src/store/TimerContext";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";
import { formatClock, formatDuration } from "@/src/utils/time";

const PRESETS = [
  { study: 25, brk: 5, label: "25 / 5" },
  { study: 50, brk: 10, label: "50 / 10" },
];

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const { subjectById } = useApp();
  const timer = useTimer();
  const [customOpen, setCustomOpen] = useState(false);
  const [draftStudy, setDraftStudy] = useState(timer.studyMinutes);
  const [draftBreak, setDraftBreak] = useState(timer.breakMinutes);

  const idle = timer.status === "idle";
  const running = timer.status === "running";
  const paused = timer.status === "paused";
  const completed = timer.status === "completed";
  const isBreak = timer.phase === "break";

  const ringColor = isBreak ? "#4F86C6" : colors.brandPrimary;
  const subject = subjectById(timer.selectedSubjectId);

  const activePreset = useMemo(() => {
    const idx = PRESETS.findIndex(
      (p) => p.study === timer.studyMinutes && p.brk === timer.breakMinutes,
    );
    return idx;
  }, [timer.studyMinutes, timer.breakMinutes]);
  const isCustom = activePreset === -1;

  const openCustom = () => {
    setDraftStudy(timer.studyMinutes);
    setDraftBreak(timer.breakMinutes);
    setCustomOpen(true);
  };

  const phaseLabel = completed ? "COMPLETE" : isBreak ? "BREAK" : "FOCUS";

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingBottom: spacing.xl,
          paddingHorizontal: spacing.lg,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject selector (prominent before start) */}
        {idle ? (
          <View style={styles.block}>
            <Text style={styles.blockLabel}>SUBJECT</Text>
            <SubjectSelect
              selectedId={timer.selectedSubjectId}
              onSelect={timer.setSelectedSubjectId}
              testIDPrefix="timer-subject"
            />
          </View>
        ) : null}

        {/* Presets */}
        {idle ? (
          <View style={styles.presetRow}>
            {PRESETS.map((p, i) => (
              <Pressable
                key={p.label}
                testID={`preset-${p.study}-${p.brk}`}
                onPress={() => timer.setPreset(p.study, p.brk)}
                style={[styles.preset, activePreset === i && styles.presetActive]}
              >
                <Text style={[styles.presetText, activePreset === i && styles.presetTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              testID="preset-custom"
              onPress={openCustom}
              style={[styles.preset, isCustom && styles.presetActive]}
            >
              <Ionicons
                name="options"
                size={16}
                color={isCustom ? colors.onSurface : colors.onSurfaceTertiary}
              />
              <Text style={[styles.presetText, isCustom && styles.presetTextActive]}>
                {isCustom ? `${timer.studyMinutes}/${timer.breakMinutes}` : "Custom"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Timer ring */}
        <View style={styles.ringWrap}>
          <ProgressRing size={300} strokeWidth={16} progress={timer.progress} color={ringColor}>
            <Text style={[styles.phase, { color: ringColor }]}>{phaseLabel}</Text>
            <Text style={styles.clock}>{formatClock(timer.remainingMs)}</Text>
            <Text style={styles.ringSubject}>
              {completed ? "Session recorded" : subject ? subject.name : "General"}
            </Text>
          </ProgressRing>
        </View>

        <View style={{ flex: 1 }} />

        {/* Controls */}
        <View style={styles.controls}>
          {idle ? (
            <PrimaryButton
              label={`Start ${timer.studyMinutes} min Focus`}
              icon="play"
              onPress={timer.startStudy}
              testID="timer-start"
            />
          ) : null}

          {running ? (
            <View style={styles.rowControls}>
              <PrimaryButton
                label="Pause"
                icon="pause"
                variant="secondary"
                onPress={timer.pause}
                style={styles.flexBtn}
                testID="timer-pause"
              />
              <PrimaryButton
                label="Reset"
                icon="refresh"
                variant="ghost"
                onPress={timer.reset}
                style={styles.flexBtn}
                testID="timer-reset"
              />
            </View>
          ) : null}

          {paused ? (
            <View style={styles.rowControls}>
              <PrimaryButton
                label="Resume"
                icon="play"
                onPress={timer.resume}
                style={styles.flexBtn}
                testID="timer-resume"
              />
              <PrimaryButton
                label="Reset"
                icon="refresh"
                variant="ghost"
                onPress={timer.reset}
                style={styles.flexBtn}
                testID="timer-reset"
              />
            </View>
          ) : null}

          {completed ? (
            <View style={styles.completeWrap}>
              <View style={styles.completeBanner} testID="timer-complete-banner">
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                <Text style={styles.completeText}>
                  {formatDuration(timer.lastCompletedMinutes)} recorded · +
                  {timer.lastCompletedMinutes} XP
                </Text>
              </View>
              <View style={styles.rowControls}>
                <PrimaryButton
                  label={`${timer.breakMinutes} min Break`}
                  icon="cafe"
                  variant="secondary"
                  onPress={timer.startBreak}
                  style={styles.flexBtn}
                  testID="timer-start-break"
                />
                <PrimaryButton
                  label="Done"
                  icon="checkmark"
                  onPress={timer.reset}
                  style={styles.flexBtn}
                  testID="timer-done"
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Custom durations sheet */}
      <BottomSheet
        visible={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Custom Timer"
        testID="custom-timer-sheet"
      >
        <Stepper
          label="Focus duration"
          value={draftStudy}
          unit="min"
          min={5}
          max={120}
          step={5}
          onChange={setDraftStudy}
          testID="stepper-study"
        />
        <Stepper
          label="Break duration"
          value={draftBreak}
          unit="min"
          min={1}
          max={30}
          step={1}
          onChange={setDraftBreak}
          testID="stepper-break"
        />
        <PrimaryButton
          label="Apply"
          onPress={() => {
            timer.setPreset(draftStudy, draftBreak);
            setCustomOpen(false);
          }}
          style={{ marginTop: spacing.md }}
          testID="custom-apply"
        />
      </BottomSheet>
    </View>
  );
}

function Stepper({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  testID,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  testID: string;
}) {
  return (
    <View style={styles.stepper} testID={testID}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={styles.stepBtn}
          testID={`${testID}-minus`}
        >
          <Ionicons name="remove" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.stepValue}>
          {value}
          <Text style={styles.stepUnit}> {unit}</Text>
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + step))}
          style={styles.stepBtn}
          testID={`${testID}-plus`}
        >
          <Ionicons name="add" size={22} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  block: { marginBottom: spacing.lg },
  blockLabel: {
    fontFamily: fonts.text.bold,
    fontSize: fontSize.sm,
    color: colors.onSurfaceTertiary,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  presetRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  preset: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  presetActive: { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary },
  presetText: { fontFamily: fonts.text.bold, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  presetTextActive: { color: colors.onSurface },

  ringWrap: { alignItems: "center", marginTop: spacing.xl },
  phase: {
    fontFamily: fonts.text.extrabold,
    fontSize: fontSize.base,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  clock: {
    fontFamily: fonts.display.bold,
    fontSize: 84,
    lineHeight: 92,
    color: colors.onSurface,
  },
  ringSubject: {
    fontFamily: fonts.text.medium,
    fontSize: fontSize.lg,
    color: colors.onSurfaceTertiary,
    marginTop: spacing.xs,
  },

  controls: { marginTop: spacing.xl },
  rowControls: { flexDirection: "row", gap: spacing.md },
  flexBtn: { flex: 1 },

  completeWrap: { gap: spacing.md },
  completeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  completeText: { fontFamily: fonts.text.bold, fontSize: fontSize.base, color: colors.success },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  stepperLabel: { fontFamily: fonts.text.semibold, fontSize: fontSize.lg, color: colors.onSurface },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    fontFamily: fonts.display.bold,
    fontSize: fontSize["2xl"],
    color: colors.onSurface,
    minWidth: 76,
    textAlign: "center",
  },
  stepUnit: { fontFamily: fonts.text.medium, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
});
