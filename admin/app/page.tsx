import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase'
import DeleteButton from '@/components/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; grupo?: string }>
}) {
  const { q, grupo } = await searchParams
  const supabase = createAdminClient()

  let queryBuilder = supabase
    .from('exercises')
    .select('id, name, muscle_group, type, equipment, difficulty, movement_pattern, modalities')
    .order('muscle_group')
    .order('name')

  if (grupo) queryBuilder = queryBuilder.eq('muscle_group', grupo) as typeof queryBuilder
  if (q) queryBuilder = queryBuilder.ilike('name', `%${q}%`) as typeof queryBuilder

  const { data: exercises, error } = await queryBuilder

  // distinct muscle groups for filter
  const { data: groups } = await supabase
    .from('exercises')
    .select('muscle_group')
    .order('muscle_group')
  const uniqueGroups = [...new Set(groups?.map((g) => g.muscle_group))]

  return (
    <>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>
          Ejercicios {exercises ? `(${exercises.length})` : ''}
        </h1>
        <Link href="/exercises/new" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          + Nuevo ejercicio
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="row" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          className="search-bar"
          name="q"
          placeholder="Buscar por nombre..."
          defaultValue={q}
        />
        <select
          name="grupo"
          className="search-bar"
          defaultValue={grupo}
          style={{ width: '180px' }}
        >
          <option value="">Todos los grupos</option>
          {uniqueGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-secondary">
          Filtrar
        </button>
        {(q || grupo) && (
          <a href="/" className="btn btn-secondary">
            Limpiar
          </a>
        )}
      </form>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Grupo muscular</th>
            <th>Tipo</th>
            <th>Patron de movimiento</th>
            <th>Equipamiento</th>
            <th>Dificultad</th>
            <th>Modalidades</th>
            <th style={{ width: '100px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {exercises?.map((ex) => (
            <tr key={ex.id}>
              <td style={{ fontWeight: 500 }}>{ex.name}</td>
              <td>{ex.muscle_group}</td>
              <td>{ex.type ?? <span className="muted">—</span>}</td>
              <td>{ex.movement_pattern ?? <span className="muted">—</span>}</td>
              <td>{ex.equipment}</td>
              <td>{ex.difficulty ?? <span className="muted">—</span>}</td>
              <td className="muted">{ex.modalities ?? '—'}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link
                    href={`/exercises/${ex.id}/edit`}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.8rem' }}
                  >
                    Editar
                  </Link>
                  <DeleteButton id={ex.id} name={ex.name} />
                </div>
              </td>
            </tr>
          ))}
          {exercises?.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                No se encontraron ejercicios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}
