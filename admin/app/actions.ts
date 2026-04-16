'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'

// ── Auth ──────────────────────────────────────────────────────

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth')
  redirect('/login')
}

// ── Exercises ─────────────────────────────────────────────────

function extractExercise(formData: FormData) {
  return {
    name: (formData.get('name') as string).trim(),
    type: (formData.get('type') as string) || null,
    muscle_group: (formData.get('muscle_group') as string).trim(),
    movement_pattern: (formData.get('movement_pattern') as string).trim() || null,
    equipment: (formData.get('equipment') as string).trim(),
    difficulty: (formData.get('difficulty') as string) || null,
    secondary_groups: (formData.get('secondary_groups') as string).trim() || null,
    modalities: (formData.get('modalities') as string).trim() || null,
    notes: (formData.get('notes') as string).trim() || null,
  }
}

export async function createExercise(formData: FormData) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('exercises').insert(extractExercise(formData))
  if (error) throw new Error(error.message)
  redirect('/')
}

export async function updateExercise(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('exercises')
    .update(extractExercise(formData))
    .eq('id', id)
  if (error) throw new Error(error.message)
  redirect('/')
}

export async function deleteExercise(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('exercises').delete().eq('id', id)
  if (error) throw new Error(error.message)
  redirect('/')
}
