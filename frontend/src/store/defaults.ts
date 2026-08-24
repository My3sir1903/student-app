import { AchievementDef, Subject } from "@/src/types";

let counter = 0;
export function genId(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "subj_math", name: "Mathematics", color: "#D97736" },
  { id: "subj_physics", name: "Physics", color: "#4F86C6" },
  { id: "subj_chemistry", name: "Chemistry", color: "#3FA786" },
  { id: "subj_biology", name: "Biology", color: "#C15C8A" },
  { id: "subj_literature", name: "Literature", color: "#B08D57" },
  { id: "subj_english", name: "English", color: "#6C7BC4" },
];

export const SUBJECT_COLORS = [
  "#D97736",
  "#4F86C6",
  "#3FA786",
  "#C15C8A",
  "#B08D57",
  "#6C7BC4",
  "#E0A458",
  "#5EA9A0",
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_session",
    title: "First Study Session",
    description: "Complete your first study session",
    icon: "flash",
  },
  {
    id: "one_hour",
    title: "1 Hour Studied",
    description: "Study for a total of 1 hour",
    icon: "hourglass",
  },
  {
    id: "seven_day_streak",
    title: "7 Day Streak",
    description: "Study 7 days in a row",
    icon: "flame",
  },
  {
    id: "ten_tasks",
    title: "10 Completed Tasks",
    description: "Complete 10 study tasks",
    icon: "checkmark-done",
  },
  {
    id: "ten_hours",
    title: "10 Hours Studied",
    description: "Study for a total of 10 hours",
    icon: "school",
  },
  {
    id: "level_five",
    title: "Rising Scholar",
    description: "Reach level 5",
    icon: "trophy",
  },
];

export const DEFAULT_DAILY_GOAL_MINUTES = 120;
export const LEVEL_STEP = 300; // XP per level
export const XP_PER_TASK = 50;
export const XP_PER_STUDY_MINUTE = 1;
