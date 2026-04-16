import ExerciseForm from '@/components/ExerciseForm'
import { createExercise } from '@/app/actions'

export default function NewExercisePage() {
  return (
    <>
      <div className="row">
        <h1 style={{ margin: 0 }}>Nuevo ejercicio</h1>
      </div>
      <ExerciseForm action={createExercise} submitLabel="Crear ejercicio" />
    </>
  )
}
