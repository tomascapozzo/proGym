import Link from 'next/link'

export type ExerciseData = {
  name?: string
  type?: string | null
  muscle_group?: string
  movement_pattern?: string | null
  equipment?: string
  difficulty?: string | null
  secondary_groups?: string | null
  modalities?: string | null
  notes?: string | null
}

const MUSCLE_GROUPS = [
  'Cuadriceps', 'Isquiotibiales', 'Gluteos', 'Pecho', 'Espalda',
  'Hombros', 'Biceps', 'Triceps', 'Core', 'Cuerpo Completo', 'Cardio', 'Movilidad',
]

const MOVEMENT_PATTERNS = [
  'Sentadilla', 'Zancada', 'Zancada Split', 'Bisagra de Cadera', 'Flexion de Rodilla',
  'Empuje de Cadera', 'Empuje Horizontal', 'Empuje Inclinado', 'Empuje Vertical',
  'Jale Vertical', 'Jale Horizontal', 'Aislamiento', 'Estabilizacion', 'Anti-Rotacion',
  'Flexion de Tronco', 'Rotacion de Tronco', 'Extension de Tronco',
  'Olimpico', 'Salto', 'Cardio', 'Carrera Continua', 'Carrera a Umbral',
  'Carrera Intervalada', 'Carrera Variable', 'Carrera en Pendiente', 'Caminata',
  'Estiramiento Estatico', 'Estiramiento Dinamico', 'Movilidad Articular',
  'Liberacion Miofascial',
]

const EQUIPMENT = [
  'Peso Libre', 'Maquina', 'Peso Corporal', 'Cable',
  'Sin Equipamiento', 'Banda Elastica', 'Mixto',
]

const DIFFICULTIES = ['Principiante', 'Intermedio', 'Avanzado']
const TYPES = ['C.C', 'C.A']

const MODALITIES = ['Salud', 'Powerbuilding', 'Atleta Hibrido', 'Todas']

export default function ExerciseForm({
  action,
  defaultValues = {},
  submitLabel = 'Guardar',
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: ExerciseData
  submitLabel?: string
}) {
  return (
    <form action={action} className="form-wrap">
      <div className="grid-2">

        {/* Name */}
        <label style={{ gridColumn: '1 / -1' }}>
          <span>Nombre *</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={defaultValues.name ?? ''}
            placeholder="Ej: Sentadilla con Barra"
          />
        </label>

        {/* Muscle group — free text with suggestions */}
        <label>
          <span>Grupo muscular *</span>
          <input
            type="text"
            name="muscle_group"
            required
            list="muscle-groups-list"
            defaultValue={defaultValues.muscle_group ?? ''}
            placeholder="Ej: Cuadriceps"
          />
          <datalist id="muscle-groups-list">
            {MUSCLE_GROUPS.map((g) => <option key={g} value={g} />)}
          </datalist>
        </label>

        {/* Type */}
        <label>
          <span>Tipo (cadena cinetica)</span>
          <select name="type" defaultValue={defaultValues.type ?? ''}>
            <option value="">Sin tipo</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        {/* Movement pattern */}
        <label>
          <span>Patron de movimiento</span>
          <input
            type="text"
            name="movement_pattern"
            list="movement-patterns-list"
            defaultValue={defaultValues.movement_pattern ?? ''}
            placeholder="Ej: Sentadilla"
          />
          <datalist id="movement-patterns-list">
            {MOVEMENT_PATTERNS.map((p) => <option key={p} value={p} />)}
          </datalist>
        </label>

        {/* Equipment */}
        <label>
          <span>Equipamiento *</span>
          <select name="equipment" required defaultValue={defaultValues.equipment ?? ''}>
            <option value="">Seleccionar...</option>
            {EQUIPMENT.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>

        {/* Difficulty */}
        <label>
          <span>Dificultad</span>
          <select name="difficulty" defaultValue={defaultValues.difficulty ?? ''}>
            <option value="">Sin dificultad</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        {/* Secondary groups */}
        <label style={{ gridColumn: '1 / -1' }}>
          <span>Grupos secundarios</span>
          <input
            type="text"
            name="secondary_groups"
            defaultValue={defaultValues.secondary_groups ?? ''}
            placeholder="Ej: Gluteos, Core, Trapecio"
          />
        </label>

        {/* Modalities */}
        <label style={{ gridColumn: '1 / -1' }}>
          <span>Modalidades</span>
          <input
            type="text"
            name="modalities"
            list="modalities-list"
            defaultValue={defaultValues.modalities ?? ''}
            placeholder="Ej: Powerbuilding, Atleta Hibrido, Salud"
          />
          <datalist id="modalities-list">
            {MODALITIES.map((m) => <option key={m} value={m} />)}
          </datalist>
        </label>

        {/* Notes */}
        <label style={{ gridColumn: '1 / -1' }}>
          <span>Notas</span>
          <textarea
            name="notes"
            defaultValue={defaultValues.notes ?? ''}
            placeholder="Instrucciones, variantes, advertencias..."
          />
        </label>
      </div>

      <div className="row" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <Link href="/" className="btn btn-secondary">Cancelar</Link>
      </div>
    </form>
  )
}
