import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import { useApp } from "@/src/store/AppContext";

export type TimerPhase = "study" | "break";
export type TimerStatus = "idle" | "running" | "paused" | "completed";

interface TimerContextValue {
  studyMinutes: number;
  breakMinutes: number;
  selectedSubjectId: string | null;
  phase: TimerPhase;
  status: TimerStatus;
  remainingMs: number;
  totalMs: number;
  progress: number; // 0..1 elapsed
  setSelectedSubjectId: (id: string | null) => void;
  setPreset: (study: number, brk: number) => void;
  startStudy: () => void;
  startBreak: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  lastCompletedMinutes: number;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimer(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { addSession } = useApp();

  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [phase, setPhase] = useState<TimerPhase>("study");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingMs, setRemainingMs] = useState(25 * 60000);
  const [lastCompletedMinutes, setLastCompletedMinutes] = useState(0);

  const endAtRef = useRef<number | null>(null);
  const totalMsRef = useRef(25 * 60000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<TimerPhase>("study");
  const statusRef = useRef<TimerStatus>("idle");
  const studyMinutesRef = useRef(25);
  const selectedSubjectRef = useRef<string | null>(null);

  phaseRef.current = phase;
  statusRef.current = status;
  studyMinutesRef.current = studyMinutes;
  selectedSubjectRef.current = selectedSubjectId;

  const stopTicking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    stopTicking();
    endAtRef.current = null;
    setRemainingMs(0);
    if (phaseRef.current === "study") {
      const mins = studyMinutesRef.current;
      setLastCompletedMinutes(mins);
      addSession(selectedSubjectRef.current, mins);
      setStatus("completed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setStatus("idle");
      setPhase("study");
      setRemainingMs(studyMinutesRef.current * 60000);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [addSession, stopTicking]);

  const tick = useCallback(() => {
    if (endAtRef.current == null) return;
    const rem = Math.max(0, endAtRef.current - Date.now());
    setRemainingMs(rem);
    if (rem <= 0) handleComplete();
  }, [handleComplete]);

  const startTicking = useCallback(() => {
    stopTicking();
    intervalRef.current = setInterval(tick, 250);
  }, [stopTicking, tick]);

  // Recompute accurately when app returns to foreground.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && statusRef.current === "running") tick();
    });
    return () => sub.remove();
  }, [tick]);

  useEffect(() => stopTicking, [stopTicking]);

  // Keep the screen awake only while a timer is actively running (native only).
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (status === "running") {
      activateKeepAwakeAsync("studyflow-timer").catch(() => {});
    } else {
      try {
        deactivateKeepAwake("studyflow-timer");
      } catch {
        // no-op
      }
    }
  }, [status]);

  // Keep displayed time in sync with preset while idle.
  useEffect(() => {
    if (status === "idle" && phase === "study") {
      setRemainingMs(studyMinutes * 60000);
      totalMsRef.current = studyMinutes * 60000;
    }
  }, [studyMinutes, status, phase]);

  const value = useMemo<TimerContextValue>(() => {
    const startStudy = () => {
      const total = studyMinutes * 60000;
      totalMsRef.current = total;
      setPhase("study");
      setStatus("running");
      setRemainingMs(total);
      endAtRef.current = Date.now() + total;
      startTicking();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    };

    const startBreak = () => {
      const total = breakMinutes * 60000;
      totalMsRef.current = total;
      setPhase("break");
      setStatus("running");
      setRemainingMs(total);
      endAtRef.current = Date.now() + total;
      startTicking();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    };

    const pause = () => {
      if (statusRef.current !== "running") return;
      const rem = Math.max(0, (endAtRef.current ?? Date.now()) - Date.now());
      setRemainingMs(rem);
      endAtRef.current = null;
      setStatus("paused");
      stopTicking();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    };

    const resume = () => {
      if (statusRef.current !== "paused") return;
      endAtRef.current = Date.now() + remainingMs;
      setStatus("running");
      startTicking();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    };

    const reset = () => {
      stopTicking();
      endAtRef.current = null;
      setStatus("idle");
      setPhase("study");
      setRemainingMs(studyMinutes * 60000);
      totalMsRef.current = studyMinutes * 60000;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    };

    const setPreset = (study: number, brk: number) => {
      if (statusRef.current === "running" || statusRef.current === "paused") return;
      setStudyMinutes(study);
      setBreakMinutes(brk);
      Haptics.selectionAsync().catch(() => {});
    };

    const total = totalMsRef.current || 1;
    const progress = Math.min(1, Math.max(0, 1 - remainingMs / total));

    return {
      studyMinutes,
      breakMinutes,
      selectedSubjectId,
      phase,
      status,
      remainingMs,
      totalMs: totalMsRef.current,
      progress,
      setSelectedSubjectId,
      setPreset,
      startStudy,
      startBreak,
      pause,
      resume,
      reset,
      lastCompletedMinutes,
    };
  }, [
    studyMinutes,
    breakMinutes,
    selectedSubjectId,
    phase,
    status,
    remainingMs,
    lastCompletedMinutes,
    startTicking,
    stopTicking,
  ]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
