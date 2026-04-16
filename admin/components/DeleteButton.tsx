'use client'

import { deleteExercise } from '@/app/actions'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  async function handleDelete() {
    if (!confirm(`Eliminar "${name}"?`)) return
    await deleteExercise(id)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="btn btn-danger"
      style={{ padding: '0.25rem 0.55rem', fontSize: '0.8rem' }}
    >
      Borrar
    </button>
  )
}
