import dayjs from "dayjs";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import {
  ACHIEVEMENTS,
  DEFAULT_DAILY_GOAL_MINUTES,
  DEFAULT_SUBJECTS,
  LEVEL_STEP,
  XP_PER_STUDY_MINUTE,
  XP_PER_TASK,
  genId,
} from "@/src/store/defaults";
import { KEYS, loadJSON, saveJSON } from "@/src/store/persist";
import { useToast } from "@/src/store/ToastContext";
import { colors } from "@/src/theme";
import { Profile, StudySession, Subject, Task } from "@/src/types";
import { todayKey } from "@/src/utils/time";

interface Stats {
  todayMinutes: number;
  weekMinutes: number;
  totalMinutes: number;
  completedTasksTotal: number;
  completedTasksToday: number;
  sessionsToday: number;
  streak: number;
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  bySubject: { subjectId: string | null; name: string; color: string; minutes: number }[];
  weekly: { label: string; value: number }[];
}

interface AppContextValue {
  subjects: Subject[];
  tasks: Task[];
  sessions: StudySession[];
  profile: Profile;
  stats: Stats;
  // subjects
  addSubject: (name: string, color: string) => void;
  updateSubject: (id: string, name: string, color: string) => void;
  deleteSubject: (id: string) => void;
  // tasks
  addTask: (title: string, subjectId: string | null, dueDate: string | null) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  // sessions
  addSession: (subjectId: string | null, durationMinutes: number) => void;
  // profile
  setDailyGoal: (minutes: number) => void;
  resetAllData: () => void;
  subjectById: (id: string | null) => Subject | undefined;
}

const DEFAULT_PROFILE: Profile = {
  xp: 0,
  dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES,
  streakCount: 0,
  lastStudyDate: null,
  unlockedAchievements: [],
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [ready, setReady] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const didLoad = useRef(false);

  // Load from storage once.
  useEffect(() => {
    (async () => {
      const [s, t, se, p] = await Promise.all([
        loadJSON<Subject[]>(KEYS.subjects, DEFAULT_SUBJECTS),
        loadJSON<Task[]>(KEYS.tasks, []),
        loadJSON<StudySession[]>(KEYS.sessions, []),
        loadJSON<Profile>(KEYS.profile, DEFAULT_PROFILE),
      ]);
      setSubjects(s.length ? s : DEFAULT_SUBJECTS);
      setTasks(t);
      setSessions(se);
      setProfile({ ...DEFAULT_PROFILE, ...p });
      didLoad.current = true;
      setReady(true);
    })();
  }, []);

  // Persist on change (after initial load).
  useEffect(() => {
    if (didLoad.current) saveJSON(KEYS.subjects, subjects);
  }, [subjects]);
  useEffect(() => {
    if (didLoad.current) saveJSON(KEYS.tasks, tasks);
  }, [tasks]);
  useEffect(() => {
    if (didLoad.current) saveJSON(KEYS.sessions, sessions);
  }, [sessions]);
  useEffect(() => {
    if (didLoad.current) saveJSON(KEYS.profile, profile);
  }, [profile]);

  // ---- derived stats ----
  const stats = useMemo<Stats>(() => {
    const today = todayKey();
    const weekStart = dayjs().subtract(6, "day").startOf("day");

    let todayMinutes = 0;
    let weekMinutes = 0;
    let totalMinutes = 0;
    let sessionsToday = 0;
    const subjMap = new Map<string | null, number>();

    for (const s of sessions) {
      totalMinutes += s.durationMinutes;
      const d = dayjs(s.startedAt);
      if (d.format("YYYY-MM-DD") === today) {
        todayMinutes += s.durationMinutes;
        sessionsToday += 1;
      }
      if (!d.startOf("day").isBefore(weekStart)) {
        weekMinutes += s.durationMinutes;
      }
      subjMap.set(s.subjectId, (subjMap.get(s.subjectId) ?? 0) + s.durationMinutes);
    }

    const completedTasksTotal = tasks.filter((t) => t.completed).length;
    const completedTasksToday = tasks.filter(
      (t) => t.completed && t.completedAt && dayjs(t.completedAt).format("YYYY-MM-DD") === today,
    ).length;

    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const streak =
      profile.lastStudyDate === today || profile.lastStudyDate === yesterday
        ? profile.streakCount
        : 0;

    const level = Math.floor(profile.xp / LEVEL_STEP) + 1;
    const xpIntoLevel = profile.xp % LEVEL_STEP;

    const bySubject = Array.from(subjMap.entries())
      .map(([subjectId, minutes]) => {
        const subj = subjects.find((x) => x.id === subjectId);
        return {
          subjectId,
          name: subj?.name ?? "General",
          color: subj?.color ?? colors.onSurfaceTertiary,
          minutes,
        };
      })
      .sort((a, b) => b.minutes - a.minutes);

    const weekly: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = dayjs().subtract(i, "day");
      const key = d.format("YYYY-MM-DD");
      const mins = sessions
        .filter((s) => dayjs(s.startedAt).format("YYYY-MM-DD") === key)
        .reduce((acc, s) => acc + s.durationMinutes, 0);
      weekly.push({ label: d.format("dd").charAt(0), value: mins });
    }

    return {
      todayMinutes,
      weekMinutes,
      totalMinutes,
      completedTasksTotal,
      completedTasksToday,
      sessionsToday,
      streak,
      level,
      xp: profile.xp,
      xpIntoLevel,
      xpForLevel: LEVEL_STEP,
      bySubject,
      weekly,
    };
  }, [sessions, tasks, profile, subjects]);

  // ---- achievements unlocking ----
  useEffect(() => {
    if (!ready) return;
    const unlocked = new Set(profile.unlockedAchievements);
    const shouldUnlock: string[] = [];
    const check = (id: string, cond: boolean) => {
      if (cond && !unlocked.has(id)) shouldUnlock.push(id);
    };
    check("first_session", sessions.length >= 1);
    check("one_hour", stats.totalMinutes >= 60);
    check("seven_day_streak", stats.streak >= 7);
    check("ten_tasks", stats.completedTasksTotal >= 10);
    check("ten_hours", stats.totalMinutes >= 600);
    check("level_five", stats.level >= 5);

    if (shouldUnlock.length) {
      setProfile((prev) => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...shouldUnlock],
      }));
      shouldUnlock.forEach((id) => {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) {
          showToast({
            title: "Achievement Unlocked!",
            message: def.title,
            icon: def.icon as never,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sessions, tasks, profile.xp, profile.streakCount, profile.lastStudyDate]);

  // ---- actions ----
  const value = useMemo<AppContextValue>(() => {
    const subjectById = (id: string | null) =>
      id ? subjects.find((s) => s.id === id) : undefined;

    return {
      subjects,
      tasks,
      sessions,
      profile,
      stats,
      subjectById,

      addSubject: (name, color) =>
        setSubjects((prev) => [...prev, { id: genId("subj"), name: name.trim(), color }]),

      updateSubject: (id, name, color) =>
        setSubjects((prev) =>
          prev.map((s) => (s.id === id ? { ...s, name: name.trim(), color } : s)),
        ),

      deleteSubject: (id) => {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        setTasks((prev) =>
          prev.map((t) => (t.subjectId === id ? { ...t, subjectId: null } : t)),
        );
      },

      addTask: (title, subjectId, dueDate) =>
        setTasks((prev) => [
          {
            id: genId("task"),
            title: title.trim(),
            subjectId,
            dueDate,
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]),

      toggleTask: (id) =>
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== id) return t;
            const nowCompleted = !t.completed;
            if (nowCompleted) {
              setProfile((p) => ({ ...p, xp: p.xp + XP_PER_TASK }));
              showToast({
                title: "Task complete",
                message: `+${XP_PER_TASK} XP`,
                icon: "checkmark-done",
              });
            } else {
              setProfile((p) => ({ ...p, xp: Math.max(0, p.xp - XP_PER_TASK) }));
            }
            return {
              ...t,
              completed: nowCompleted,
              completedAt: nowCompleted ? new Date().toISOString() : null,
            };
          }),
        ),

      deleteTask: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),

      addSession: (subjectId, durationMinutes) => {
        const now = dayjs();
        const startedAt = now.subtract(durationMinutes, "minute").toISOString();
        const endedAt = now.toISOString();
        setSessions((prev) => [
          { id: genId("sess"), subjectId, durationMinutes, startedAt, endedAt },
          ...prev,
        ]);
        const today = todayKey();
        const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        setProfile((p) => {
          let streakCount = p.streakCount;
          if (p.lastStudyDate === today) {
            // already studied today, keep streak
          } else if (p.lastStudyDate === yesterday) {
            streakCount = p.streakCount + 1;
          } else {
            streakCount = 1;
          }
          return {
            ...p,
            xp: p.xp + durationMinutes * XP_PER_STUDY_MINUTE,
            streakCount,
            lastStudyDate: today,
          };
        });
        showToast({
          title: "Session recorded",
          message: `+${durationMinutes * XP_PER_STUDY_MINUTE} XP · ${durationMinutes}m studied`,
          icon: "flash",
        });
      },

      setDailyGoal: (minutes) =>
        setProfile((p) => ({ ...p, dailyGoalMinutes: minutes })),

      resetAllData: () => {
        setSubjects(DEFAULT_SUBJECTS);
        setTasks([]);
        setSessions([]);
        setProfile(DEFAULT_PROFILE);
      },
    };
  }, [subjects, tasks, sessions, profile, stats, showToast]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
