import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import ExerciseForm from '@/components/ExerciseForm'
import { updateExercise } from '@/app/actions'

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: exercise } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()

  if (!exercise) notFound()

  const action = updateExercise.bind(null, id)

  return (
    <>
      <div className="row">
        <h1 style={{ margin: 0 }}>Editar: {exercise.name}</h1>
      </div>
      <ExerciseForm
        action={action}
        defaultValues={exercise}
        submitLabel="Guardar cambios"
      />
    </>
  )
}
