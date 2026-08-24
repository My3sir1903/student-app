export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string | null;
  dueDate: string | null; // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null; // ISO
  createdAt: string; // ISO
}

export interface StudySession {
  id: string;
  subjectId: string | null;
  durationMinutes: number;
  startedAt: string; // ISO
  endedAt: string; // ISO
}

export interface Profile {
  xp: number;
  dailyGoalMinutes: number;
  streakCount: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  unlockedAchievements: string[];
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
}
