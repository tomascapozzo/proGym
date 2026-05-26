# proGym Web — Club System Implementation Script

## Context

This is a Next.js 16 app (App Router) in `/web`. It uses:
- Inline CSS styles throughout (no Tailwind utility classes in components)
- `lucide-react` for icons
- `@supabase/ssr` for Supabase (client at `lib/supabase/client.ts`, server at `lib/supabase/server.ts`)
- The sidebar and topbar live in `components/dashboard/`
- All dashboard pages are under `app/(dashboard)/`

Currently the app uses **mock data** (`lib/mockData.ts`) and has **no real auth integration**. The goal is to wire everything up to the real Supabase club system.

---

## Database schema (relevant tables)

```sql
clubs             (id, name, description, logo_url, created_by, created_at)
club_members      (id, club_id, user_id, role ['admin'|'coach'|'player'], status, joined_at)
club_groups       (id, club_id, name, description, created_by, created_at)
club_group_members(id, group_id, user_id, added_by, added_at)
club_invitations  (id, club_id, created_by, code, role ['coach'|'player'],
                   max_uses, uses_count, expires_at, target_group_id, status, created_at)
profiles          (id, name, username, ...)
```

RLS is enabled. The logged-in user sees only their own club's data.
`is_club_staff(club_id)` and `is_club_member(club_id)` are helper functions used by RLS policies.

---

## Step 0 — Read these files before starting

Read these files in full before writing any code:

- `app/(dashboard)/layout.tsx`
- `components/dashboard/Sidebar.tsx`
- `components/dashboard/Topbar.tsx`
- `app/auth/login/page.tsx`
- `app/(dashboard)/team/page.tsx`
- `app/(dashboard)/squads/page.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `types/index.ts`
- `app/globals.css` (to understand CSS variables like `--pg-bg`, `--pg-accent`, etc.)

---

## Step 1 — Types

Create `types/club.ts`:

```typescript
export type ClubRole = 'admin' | 'coach' | 'player';
export type MemberStatus = 'active' | 'suspended';
export type InvitationStatus = 'active' | 'expired' | 'revoked';
export type InvitationRole = 'coach' | 'player';

export interface Club {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: ClubRole;
  status: MemberStatus;
  joined_at: string;
}

export interface ClubMemberWithProfile extends ClubMember {
  profile: { name: string; username: string };
}

export interface ClubGroup {
  id: string;
  club_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface ClubInvitation {
  id: string;
  club_id: string;
  created_by: string;
  code: string;
  role: InvitationRole;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  target_group_id: string | null;
  status: InvitationStatus;
  created_at: string;
}
```

---

## Step 2 — Supabase auth helpers

Create `lib/auth.ts` (server-side helper to get the current session and club membership):

```typescript
import { createClient } from '@/lib/supabase/server';
import type { ClubMember, Club } from '@/types/club';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentMembership(): Promise<{
  user: any;
  membership: ClubMember | null;
  club: Club | null;
} > {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, membership: null, club: null };

  const { data: membership } = await supabase
    .from('club_members')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return { user, membership: null, club: null };

  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', membership.club_id)
    .single();

  return { user, membership: membership as ClubMember, club: club as Club };
}
```

---

## Step 3 — Club context (client-side)

Create `lib/clubContext.tsx` — a React context that holds the current club and membership so all dashboard pages can access it without prop drilling:

```typescript
'use client';

import React, { createContext, useContext } from 'react';
import type { Club, ClubMember } from '@/types/club';

interface ClubContextValue {
  club: Club | null;
  membership: ClubMember | null;
  isStaff: boolean;
}

const ClubContext = createContext<ClubContextValue>({
  club: null,
  membership: null,
  isStaff: false,
});

export function ClubProvider({
  club,
  membership,
  children,
}: {
  club: Club | null;
  membership: ClubMember | null;
  children: React.ReactNode;
}) {
  const isStaff = membership?.role === 'admin' || membership?.role === 'coach';
  return (
    <ClubContext.Provider value={{ club, membership, isStaff }}>
      {children}
    </ClubContext.Provider>
  );
}

export const useClubContext = () => useContext(ClubContext);
```

---

## Step 4 — Dashboard layout

Update `app/(dashboard)/layout.tsx` to:
1. Fetch the current user + membership server-side using `getCurrentMembership()`
2. Redirect to `/auth/login` if not authenticated
3. Redirect to `/club/new` if authenticated but not in a club
4. Wrap children in `<ClubProvider>`
5. Pass real `coachName` and `teamName` to `<Sidebar>`

```typescript
import { redirect } from 'next/navigation';
import { getCurrentMembership } from '@/lib/auth';
import { ClubProvider } from '@/lib/clubContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, membership, club } = await getCurrentMembership();

  if (!user) redirect('/auth/login');
  if (!membership || !club) redirect('/club/new');

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  return (
    <ClubProvider club={club} membership={membership}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--pg-bg)' }}>
        <Sidebar coachName={profile?.name ?? 'Coach'} teamName={club.name} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--pg-bg)' }}>
          {children}
        </main>
      </div>
    </ClubProvider>
  );
}
```

---

## Step 5 — Club creation page

Create `app/club/new/page.tsx` — shown when a user is logged in but has no club yet.

This page should:
- Be a **Server Component** that checks auth (redirect to login if not authenticated, redirect to `/dashboard` if already in a club)
- Render a `<ClubCreatorForm />` client component

Create `components/club/ClubCreatorForm.tsx` — client component with:
- Input for club name (required)
- Textarea for description (optional)
- On submit:
  1. INSERT into `clubs` (name, description, created_by = user.id)
  2. INSERT into `club_members` (club_id, user_id, role: 'admin', status: 'active')
  3. `router.push('/dashboard')`
- Error handling inline
- Style consistent with the rest of the web app (use `--pg-*` CSS variables, same button/input style as login page)

---

## Step 6 — Invitations page

Create `app/(dashboard)/invitations/page.tsx` and the components it needs.

This page shows all active invite codes for the club and lets admin/coaches generate new ones.

### Page structure

```
Topbar: "Invitaciones" | subtitle: "N codigos activos" | action: (nothing, generate is inline)

Two sections:
  1. Coaches — list of active coach codes + "Generar codigo de coach" button
  2. Jugadores — list of active player codes grouped by target group + "Generar codigo" button
     (when generating a player code, show a dropdown to optionally link it to a group)

Each code card shows:
  - The code in large monospace text
  - Role badge (Coach / Jugador)
  - Target group name if applicable
  - Uses count (e.g. "2 usos" or "2 / 10")
  - Copy button (copies code to clipboard)
  - Revoke button (admin only) — sets status to 'revoked'
```

### Data fetching

Fetch server-side in the page:
```typescript
const { data: invitations } = await supabase
  .from('club_invitations')
  .select('*, target_group:club_groups(name)')
  .eq('club_id', club.id)
  .eq('status', 'active')
  .order('created_at', { ascending: false });

const { data: groups } = await supabase
  .from('club_groups')
  .select('id, name')
  .eq('club_id', club.id)
  .order('name');
```

### Code generation (server action)

Create `app/(dashboard)/invitations/actions.ts` with server actions:

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function generateCode(prefix: 'COACH' | 'PLAYER'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `${prefix}-${suffix}`;
}

export async function generateInvitation(
  clubId: string,
  role: 'coach' | 'player',
  targetGroupId?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase.from('club_invitations').insert({
    club_id: clubId,
    created_by: user.id,
    code: generateCode(role === 'coach' ? 'COACH' : 'PLAYER'),
    role,
    target_group_id: targetGroupId ?? null,
    status: 'active',
  });

  revalidatePath('/invitations');
}

export async function revokeInvitation(id: string) {
  const supabase = await createClient();
  await supabase.from('club_invitations').update({ status: 'revoked' }).eq('id', id);
  revalidatePath('/invitations');
}
```

---

## Step 7 — Team page (replace mock data)

Rewrite `app/(dashboard)/team/page.tsx` to fetch real data from Supabase.

Fetch server-side:
```typescript
const { data: members } = await supabase
  .from('club_members')
  .select('*, profile:profiles(id, name, username)')
  .eq('club_id', club.id)
  .order('joined_at');
```

Keep the existing table layout and visual style. Replace `MOCK_PLAYERS` with real members. Remove the ACWR/compliance columns for now (those are analytics features not yet built) — show: avatar initial, name, username, role badge, status badge, joined date, and which groups they belong to.

Add a group membership column: for each member, fetch their groups via:
```typescript
const { data: groupMemberships } = await supabase
  .from('club_group_members')
  .select('group_id, group:club_groups(name)')
  .eq('club_id', club.id);
```

The "Invitar jugador" button in the Topbar should link to `/invitations`.

---

## Step 8 — Squads/Groups page (replace mock data)

Rewrite `app/(dashboard)/squads/page.tsx` to use real `club_groups` data.

Fetch server-side:
```typescript
const { data: groups } = await supabase
  .from('club_groups')
  .select(`
    *,
    member_count:club_group_members(count)
  `)
  .eq('club_id', club.id)
  .order('created_at');
```

Create/edit group operations should use **server actions** in `app/(dashboard)/squads/actions.ts`:

```typescript
'use server';
export async function createGroup(clubId: string, name: string, description: string | null) { ... }
export async function updateGroup(id: string, name: string, description: string | null) { ... }
export async function deleteGroup(id: string) { ... }
```

Keep the existing card grid layout. Each card shows group name, description, member count, and an edit button.

The `[id]` detail page (`app/(dashboard)/squads/[id]/page.tsx`) should show:
- Group name and description (editable inline by staff)
- Member list: fetch `club_group_members` joined with `profiles`
- "Agregar jugador" button — opens a modal that lists club members not yet in this group and lets staff add them via INSERT into `club_group_members`
- Remove member button per row — DELETE from `club_group_members`

---

## Step 9 — Sidebar nav update

Add "Invitaciones" to the `NAV` array in `components/dashboard/Sidebar.tsx`:

```typescript
import { ..., Link2 } from 'lucide-react';

{ href: '/invitations', label: 'Invitaciones', icon: Link2 },
```

Place it after "Planteles".

---

## Step 10 — Auth: login page

The login page at `app/auth/login/page.tsx` likely already exists. Make sure it:
1. Uses the Supabase client to call `supabase.auth.signInWithPassword()`
2. On success, redirects to `/dashboard`
3. Shows inline error on failure

If it uses mock auth, replace with real Supabase auth.

Also add a sign-out server action used by the sidebar logout button:

```typescript
// app/auth/actions.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
```

Wire the `<LogOut>` icon in `Sidebar.tsx` to call this action.

---

## Style conventions

- Use CSS variables: `--pg-bg`, `--pg-card`, `--pg-surface`, `--pg-border`, `--pg-text`, `--pg-muted`, `--pg-disabled`, `--pg-accent`, `--pg-accent-bg`, `--pg-accent-text`, `--pg-red`, `--pg-amber`, `--pg-blue`
- Font sizes: labels 9-10px, body 11-13px, headings 15-18px
- Border radius: cards 8-10px, buttons 7-9px, badges 4-6px
- All new components follow the same inline-style pattern as existing components — no Tailwind utility classes
- Role badge colors: admin → `--pg-red`, coach → `--pg-blue`, player → `--pg-accent`
- All user-facing text in **Spanish**
- No emojis in the UI

---

## Order of implementation

1. `types/club.ts`
2. `lib/auth.ts`
3. `lib/clubContext.tsx`
4. `app/(dashboard)/layout.tsx` (update)
5. `app/club/new/page.tsx` + `components/club/ClubCreatorForm.tsx`
6. `app/auth/actions.ts` + wire logout in Sidebar
7. `app/(dashboard)/invitations/page.tsx` + `actions.ts` + code card component
8. `app/(dashboard)/team/page.tsx` (replace mock data)
9. `app/(dashboard)/squads/page.tsx` + `actions.ts` (replace mock data)
10. `app/(dashboard)/squads/[id]/page.tsx` (member management)
11. `components/dashboard/Sidebar.tsx` (add Invitaciones nav item)
