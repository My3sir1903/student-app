# StudyFlow — Product Requirements Document

## Original Problem Statement
Build a modern Android-first study productivity app "StudyFlow": a study tracker + Pomodoro
timer for students. Clean, modern, minimal dark theme (no gaming/neon). Bottom nav: Home,
Tasks, Timer, Statistics, Settings. Local storage only (no auth, no cloud). No ads/payments/
AI/social/leaderboards. Must be fully functional and structured so backend sync, auth, ads
and more can be added later.

## User Choices
- Accent color: agent's choice → warm rust `#D97736` (Dark-First Utility design system).
- Session end behavior: **just stop and record** the session (optional break offered after).
- Timer must stay accurate across app background/lock → implemented via timestamp math + AppState.
- Daily goal: fixed default (2h) editable in Settings.

## Architecture
- **Frontend**: Expo Router (SDK 54), React Native, TypeScript. File-based routing under `app/(tabs)`.
- **State/Data**: React Context (`AppContext`, `TimerContext`, `ToastContext`). All data persisted
  locally via `@/src/utils/storage` (AsyncStorage on native / IndexedDB on web) as JSON strings.
  Keys under `studyflow:*` (subjects, tasks, sessions, profile).
- **Backend**: FastAPI + Mongo template left intact but UNUSED (local-only v1). Ready for future sync.
- **Fonts**: Barlow Condensed (display/numbers) + Manrope (UI text) via expo-font.
- **Charts**: react-native-gifted-charts. **Icons**: @expo/vector-icons (Ionicons).
- **Keyboard**: react-native-keyboard-controller (KeyboardStickyView in bottom sheets).

## User Personas
- **Student** planning study time, running Pomodoro focus sessions, tracking tasks per subject,
  and motivated by XP/levels/streaks/achievements.

## Core Requirements (static)
- Home dashboard (today time, daily goal ring, streak, tasks today, sessions, Start Studying CTA).
- Pomodoro timer (25/5, 50/10, custom), subject selection, start/pause/reset, auto-record on complete.
- Subjects CRUD with 6 defaults.
- Tasks CRUD (subject + due date), complete awards +50 XP, delete.
- Gamification: XP (1/min study, 50/task), Level (300 XP/level), daily streak, 6 achievements.
- Statistics: today/week/total time, by-subject breakdown, weekly bar chart, completed tasks, streak, achievements grid.
- Settings: editable daily goal, manage subjects, reset all data.

## Implemented (2026-06)
- [x] All 5 tabs + subjects management screen, dark theme + custom fonts.
- [x] Home dashboard with XP/level bar, daily goal progress ring, metric grid, sticky CTA.
- [x] Timer with presets/custom steppers, subject picker, full state machine, background-accurate
      countdown, keep-awake while running (native), auto session recording + XP + streak update.
- [x] Tasks: create/complete/delete, filter chips, subject pills, due dates, XP toast.
- [x] Subjects: add/edit/delete with color picker; deleting reassigns tasks to General.
- [x] Gamification: XP/level, streak logic, achievement unlocking + toast.
- [x] Statistics: metrics summary, weekly bar chart, subject breakdown bars, achievements grid.
- [x] Settings: daily goal sheet, manage subjects link, reset-all confirm, about.
- [x] Local persistence verified across reload. Testing agent: 15/15 flows pass.

## Backlog (prioritized)
- **P1**: Arbitrary calendar date picker for task due dates (currently quick-pick chips).
- **P1**: Session history list / edit-delete recorded sessions.
- **P2**: Optional local reminder notifications (requires native build).
- **P2**: Streak freeze / weekly review summary.
- **P2**: Backend sync + auth (structure already isolates data layer in AppContext).
- **P3**: More achievements, subject-level goals.

## Next Tasks
- Consider arbitrary due-date picker and a sessions history view if the user wants deeper tracking.
