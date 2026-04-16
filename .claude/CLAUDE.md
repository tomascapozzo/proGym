# proGym — Mobile App

## Idea

A gym companion app for iOS and Android. When users first sign up they complete an anamnesis (onboarding form) so the app knows their profile. After that they can create their own routines manually or have the AI generate one tailored to their profile and goals (AI not implemented yet — see Current State below).

Routines can be **daily**, **weekly**, or **monthly**. In weekly and monthly routines, days can be skipped and completed in a different order. When a workout session starts the app enters session mode, which shows the current routine tracker and maintains a notification bar (with rest timer and current exercise) when the user leaves the app. After finishing, the session data is saved to the database. Users can view their training history and a progression section with charts and data (progression section not implemented yet).

## Current State

### What's built

- Auth: email/password signup, login, session persistence
- Onboarding: full anamnesis form collecting fitness profile
- Home screen: greeting, daily quote, suggested next workout from active routine
- Train screen: active/pending/past routine sections, routine detail sheet, skip/complete days, create routine flow
- Session screen: live set tracking (reps, weight, RPE), rest timer, elapsed time, free or routine-based sessions
- History screen: chronological workout log with per-session stats
- Profile screen: edit profile info, PR exercise tracking, theme toggle
- Routine creation: custom routines with days, exercises, circuits, rest picker, routine type selector
- Routine lifecycle: active → completed/skipped days → pending_restart (weekly) or past (daily) or cycle reset (monthly)
- Dark/light theme system

### Not yet implemented

- AI routine generation (placeholder button exists on home screen, marked "Próximamente")
- Progress/analytics charts (volume over time, weight progression, training frequency)
- Push notifications (rest timer notification bar, workout reminders)

## Technical Specifications

**Stack**

- React Native with Expo (file-based routing via Expo Router)
- TypeScript throughout
- Supabase (PostgreSQL + Auth)

**Project structure**

```
app/
  (auth)/         # login.tsx, signup.tsx
  (tabs)/         # index.tsx, train.tsx, history.tsx, profile.tsx
  onboarding.tsx
  session.tsx
components/
  train/          # DayPreviewModal.tsx, RoutineCreatorModal.tsx, RoutineDetailSheet.tsx
  ui/custom/      # ExercisePicker.tsx, customModal.tsx
context/          # auth-context.tsx, theme-context.tsx
hooks/            # useRoutineCreator.ts, and Expo default hooks
lib/              # supabase.ts
types/            # routine.ts (shared routine types)
supabase/
  migrations/     # numbered SQL migration files
  seed/           # exercises.sql
```

**Database tables**

- `profiles` — user fitness profile (age, equipment, goals, weight, height, injuries, pr_exercises)
- `exercises` — master exercise library (name, muscle_group, movement_pattern, equipment, difficulty)
- `routines` — user routines stored as JSONB; columns: data, type, status, progress
- `workout_logs` — completed session logs (exercises array, notes, duration_seconds)

**Routine types and lifecycle**

- `daily`: single session, status → `past` on completion
- `weekly`: sequential days, status → `pending_restart` when all days done
- `monthly`: weekly cycle, resets progress each week (status stays `active`)
- `progress` shape: `{ completed_days: number[], skipped_days?: number[] }`

**Key shared types** — always import from `@/types/routine`:
`RoutineDay`, `RoutineDayExercise`, `RoutineCircuit`, `Routine`, `RoutineType`, `RoutineStatus`, `RoutineProgress`, `DEFAULT_EXERCISE`

## Rules

- **Do not add features, sections, or content that weren't asked for**
- **Do not use emojis in the UI**
- **UI language is Spanish** — all user-facing text must be in Spanish
- **Always use theme colors** from `useTheme()` instead of hardcoded hex values. Routine type colors live in `colors.routineColors` (defined in `theme-context.tsx`) — use those tokens instead of hardcoded hex values
- **New screens** go in `app/(tabs)/` (tabs) or `app/` (full-screen)
- **New reusable components** go in `components/` — modals for train screen specifically go in `components/train/`
- **New hooks** go in `hooks/`
- **Shared types** go in `types/`
- **State and logic** should live in custom hooks, not inline in screen files — keep screen files as orchestration layers
- **Database changes** require a new numbered migration file in `supabase/migrations/`
- **Do not touch the AI routine generation placeholder** — it will be implemented once the rest of the app is stable
