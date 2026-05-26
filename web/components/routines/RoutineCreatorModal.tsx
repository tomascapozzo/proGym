"use client";

import React from "react";
import type { useRoutineCreator } from "@/hooks/useRoutineCreator";
import type { RoutineCircuit, RoutineDayExercise, RoutineDay } from "@/types/routine";
import ExercisePicker from "./ExercisePicker";

const DESCANSO_OPTIONS = ["30s", "45s", "60s", "90s", "2min", "3min", "5min"];

const ROUTINE_TYPES: { value: "daily" | "weekly" | "monthly"; label: string }[] = [
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
];

const inputStyle: React.CSSProperties = {
  background: "var(--pg-surface)",
  border: "1px solid var(--pg-border)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "var(--pg-text)",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

const stepperBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  background: "var(--pg-surface)",
  border: "1px solid var(--pg-border)",
  borderRadius: 6,
  cursor: "pointer",
  color: "var(--pg-text)",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

// ─── ExerciseRow ──────────────────────────────────────────────────────────

function ExerciseRow({
  ej,
  onRemove,
  onUpdateDescanso,
  onUpdateSeries,
  onUpdateRep,
  onUpdatePeso,
}: {
  ej: RoutineDayExercise;
  onRemove: () => void;
  onUpdateDescanso: (v: string) => void;
  onUpdateSeries: (v: number) => void;
  onUpdateRep: (si: number, v: string) => void;
  onUpdatePeso: (si: number, v: string) => void;
}) {
  return (
    <div
      style={{
        background: "var(--pg-bg)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        border: "1px solid var(--pg-border)",
      }}
    >
      {/* Name + remove */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--pg-text)" }}>{ej.nombre}</span>
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pg-red)", fontSize: 17, lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>

      {/* Series + descanso */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>Series</span>
          <button style={stepperBtn} onClick={() => onUpdateSeries(Math.max(1, ej.series - 1))}>
            −
          </button>
          <span style={{ width: 20, textAlign: "center", fontSize: 13, color: "var(--pg-text)" }}>
            {ej.series}
          </span>
          <button style={stepperBtn} onClick={() => onUpdateSeries(Math.min(10, ej.series + 1))}>
            +
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>Descanso</span>
          <select
            value={ej.descanso}
            onChange={(e) => onUpdateDescanso(e.target.value)}
            style={{
              background: "var(--pg-surface)",
              border: "1px solid var(--pg-border)",
              borderRadius: 6,
              padding: "4px 8px",
              color: "var(--pg-text)",
              fontSize: 12,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {DESCANSO_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reps + peso grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 1fr",
          gap: 5,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, color: "var(--pg-muted)" }} />
        <span style={{ fontSize: 10, color: "var(--pg-muted)", textAlign: "center" }}>REPS</span>
        <span style={{ fontSize: 10, color: "var(--pg-muted)", textAlign: "center" }}>PESO (kg)</span>
        {ej.reps.map((rep, si) => (
          <React.Fragment key={si}>
            <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>S{si + 1}</span>
            <input
              value={rep}
              onChange={(e) => onUpdateRep(si, e.target.value)}
              placeholder="10"
              style={{ ...inputStyle, padding: "5px 8px", fontSize: 12, textAlign: "center" }}
            />
            <input
              value={ej.peso?.[si] ?? ""}
              onChange={(e) => onUpdatePeso(si, e.target.value)}
              placeholder="—"
              style={{ ...inputStyle, padding: "5px 8px", fontSize: 12, textAlign: "center" }}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── CircuitCard ──────────────────────────────────────────────────────────

function CircuitCard({
  circ,
  onUpdate,
  onRemove,
  onOpenExPicker,
  onMoveEx,
  onRemoveEx,
  onUpdateExRep,
  onUpdateExPeso,
}: {
  circ: RoutineCircuit;
  onUpdate: (field: keyof RoutineCircuit, v: string | number) => void;
  onRemove: () => void;
  onOpenExPicker: () => void;
  onMoveEx: (exIdx: number, dir: "up" | "down") => void;
  onRemoveEx: (exIdx: number) => void;
  onUpdateExRep: (exIdx: number, ri: number, v: string) => void;
  onUpdateExPeso: (exIdx: number, ri: number, v: string) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        background: "rgba(124,58,237,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 4,
            background: "var(--pg-purple-dim)",
            color: "var(--pg-purple)",
            letterSpacing: 0.5,
            flexShrink: 0,
          }}
        >
          CIRCUITO
        </span>
        <input
          value={circ.nombre}
          onChange={(e) => onUpdate("nombre", e.target.value)}
          placeholder="Nombre del circuito"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pg-red)", fontSize: 17, lineHeight: 1, padding: 0, flexShrink: 0 }}
        >
          ×
        </button>
      </div>

      {/* Rounds + descanso */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>Series</span>
          <button style={stepperBtn} onClick={() => onUpdate("rondas", Math.max(1, circ.rondas - 1))}>
            −
          </button>
          <span style={{ width: 20, textAlign: "center", fontSize: 13, color: "var(--pg-text)" }}>
            {circ.rondas}
          </span>
          <button style={stepperBtn} onClick={() => onUpdate("rondas", Math.min(10, circ.rondas + 1))}>
            +
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>Descanso</span>
          <select
            value={circ.descanso}
            onChange={(e) => onUpdate("descanso", e.target.value)}
            style={{
              background: "var(--pg-surface)",
              border: "1px solid var(--pg-border)",
              borderRadius: 6,
              padding: "4px 8px",
              color: "var(--pg-text)",
              fontSize: 12,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {DESCANSO_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Circuit exercises */}
      {circ.ejercicios.map((ex, exIdx) => (
        <div
          key={exIdx}
          style={{
            background: "var(--pg-bg)",
            borderRadius: 8,
            padding: 10,
            marginBottom: 6,
            border: "1px solid var(--pg-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{ex.nombre}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => onMoveEx(exIdx, "up")}
                disabled={exIdx === 0}
                style={{ ...stepperBtn, width: 22, height: 22, opacity: exIdx === 0 ? 0.3 : 1 }}
              >
                ↑
              </button>
              <button
                onClick={() => onMoveEx(exIdx, "down")}
                disabled={exIdx === circ.ejercicios.length - 1}
                style={{ ...stepperBtn, width: 22, height: 22, opacity: exIdx === circ.ejercicios.length - 1 ? 0.3 : 1 }}
              >
                ↓
              </button>
              <button
                onClick={() => onRemoveEx(exIdx)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pg-red)", fontSize: 15, lineHeight: 1, padding: "0 0 0 4px" }}
              >
                ×
              </button>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 1fr",
              gap: 5,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "var(--pg-muted)" }} />
            <span style={{ fontSize: 10, color: "var(--pg-muted)", textAlign: "center" }}>REPS</span>
            <span style={{ fontSize: 10, color: "var(--pg-muted)", textAlign: "center" }}>PESO (kg)</span>
            {ex.reps.map((rep, ri) => (
              <React.Fragment key={ri}>
                <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>S{ri + 1}</span>
                <input
                  value={rep}
                  onChange={(e) => onUpdateExRep(exIdx, ri, e.target.value)}
                  placeholder="10"
                  style={{ ...inputStyle, padding: "4px 6px", fontSize: 11, textAlign: "center" }}
                />
                <input
                  value={ex.peso?.[ri] ?? ""}
                  onChange={(e) => onUpdateExPeso(exIdx, ri, e.target.value)}
                  placeholder="—"
                  style={{ ...inputStyle, padding: "4px 6px", fontSize: 11, textAlign: "center" }}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={onOpenExPicker}
        style={{
          width: "100%",
          padding: "8px 0",
          borderRadius: 8,
          border: "1px solid rgba(124,58,237,0.3)",
          background: "transparent",
          color: "#C4B5FD",
          fontSize: 12,
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        + Agregar ejercicio al circuito
      </button>
    </div>
  );
}

// ─── DayCard ──────────────────────────────────────────────────────────────

function DayCard({
  day,
  dayIdx,
  isEditing,
  onToggleEdit,
  canRemove,
  onRemove,
  onUpdateField,
  onRemoveExercise,
  onUpdateDescanso,
  onUpdateSeries,
  onUpdateRep,
  onUpdatePeso,
  onOpenExPicker,
  onAddCircuit,
  onUpdateCircuit,
  onRemoveCircuit,
  onOpenCircuitExPicker,
  onMoveCircuitEx,
  onRemoveCircuitEx,
  onUpdateCircuitExRep,
  onUpdateCircuitExPeso,
}: {
  day: RoutineDay;
  dayIdx: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  canRemove: boolean;
  onRemove: () => void;
  onUpdateField: (f: "dia" | "enfoque", v: string) => void;
  onRemoveExercise: (exIdx: number) => void;
  onUpdateDescanso: (exIdx: number, v: string) => void;
  onUpdateSeries: (exIdx: number, v: number) => void;
  onUpdateRep: (exIdx: number, si: number, v: string) => void;
  onUpdatePeso: (exIdx: number, si: number, v: string) => void;
  onOpenExPicker: () => void;
  onAddCircuit: () => void;
  onUpdateCircuit: (circIdx: number, f: keyof RoutineCircuit, v: string | number) => void;
  onRemoveCircuit: (circIdx: number) => void;
  onOpenCircuitExPicker: (circIdx: number) => void;
  onMoveCircuitEx: (circIdx: number, exIdx: number, dir: "up" | "down") => void;
  onRemoveCircuitEx: (circIdx: number, exIdx: number) => void;
  onUpdateCircuitExRep: (circIdx: number, exIdx: number, ri: number, v: string) => void;
  onUpdateCircuitExPeso: (circIdx: number, exIdx: number, ri: number, v: string) => void;
}) {
  const circuits = day.circuitos ?? [];

  return (
    <div
      style={{
        background: "var(--pg-card)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        border: `1px solid ${isEditing ? "var(--pg-accent)" : "var(--pg-border)"}`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onToggleEdit}
          style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1, padding: 0 }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pg-text)" }}>
            {day.dia || `Día ${dayIdx + 1}`}
            {day.enfoque && (
              <span style={{ color: "var(--pg-accent)", fontWeight: 400 }}> · {day.enfoque}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 2 }}>
            {day.ejercicios.length} ejercicio{day.ejercicios.length !== 1 ? "s" : ""}
            {circuits.length > 0 &&
              ` · ${circuits.length} circuito${circuits.length !== 1 ? "s" : ""}`}
          </div>
        </button>
        {canRemove && (
          <button
            onClick={onRemove}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pg-red)", fontSize: 18, padding: "0 0 0 12px" }}
          >
            ×
          </button>
        )}
      </div>

      {/* Expanded content */}
      {isEditing && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={day.dia}
              onChange={(e) => onUpdateField("dia", e.target.value)}
              placeholder="Nombre del día"
              style={inputStyle}
            />
            <input
              value={day.enfoque}
              onChange={(e) => onUpdateField("enfoque", e.target.value)}
              placeholder="Enfoque"
              style={inputStyle}
            />
          </div>

          {day.ejercicios.map((ej, exIdx) => (
            <ExerciseRow
              key={exIdx}
              ej={ej}
              onRemove={() => onRemoveExercise(exIdx)}
              onUpdateDescanso={(v) => onUpdateDescanso(exIdx, v)}
              onUpdateSeries={(v) => onUpdateSeries(exIdx, v)}
              onUpdateRep={(si, v) => onUpdateRep(exIdx, si, v)}
              onUpdatePeso={(si, v) => onUpdatePeso(exIdx, si, v)}
            />
          ))}

          <button
            onClick={onOpenExPicker}
            style={{
              width: "100%",
              padding: "9px 0",
              borderRadius: 8,
              border: "1px solid var(--pg-border)",
              background: "transparent",
              color: "var(--pg-accent)",
              fontSize: 13,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            + Agregar ejercicio
          </button>

          {circuits.map((circ, circIdx) => (
            <CircuitCard
              key={circIdx}
              circ={circ}
              onUpdate={(f, v) => onUpdateCircuit(circIdx, f, v)}
              onRemove={() => onRemoveCircuit(circIdx)}
              onOpenExPicker={() => onOpenCircuitExPicker(circIdx)}
              onMoveEx={(exIdx, dir) => onMoveCircuitEx(circIdx, exIdx, dir)}
              onRemoveEx={(exIdx) => onRemoveCircuitEx(circIdx, exIdx)}
              onUpdateExRep={(exIdx, ri, v) => onUpdateCircuitExRep(circIdx, exIdx, ri, v)}
              onUpdateExPeso={(exIdx, ri, v) => onUpdateCircuitExPeso(circIdx, exIdx, ri, v)}
            />
          ))}

          <button
            onClick={onAddCircuit}
            style={{
              width: "100%",
              padding: "9px 0",
              borderRadius: 8,
              border: "1px solid rgba(124,58,237,0.3)",
              background: "transparent",
              color: "#C4B5FD",
              fontSize: 13,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            + Crear circuito
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────

type Props = ReturnType<typeof useRoutineCreator>;

export default function RoutineCreatorModal({
  createVisible,
  closeCreateRoutine,
  newRoutineName,
  setNewRoutineName,
  newRoutineType,
  changeRoutineType,
  newDays,
  editingDayIdx,
  setEditingDayIdx,
  savingRoutine,
  exPickerVisible,
  setExPickerVisible,
  circuitExPickerVisible,
  setCircuitExPickerVisible,
  library,
  loadingLibrary,
  addDay,
  updateDay,
  removeDay,
  updateExercise,
  updateExerciseSeries,
  updateExerciseRep,
  updateExercisePeso,
  removeExercise,
  openExPickerForDay,
  pickExercises,
  addCircuit,
  updateCircuit,
  removeCircuit,
  updateCircuitExRep,
  updateCircuitExPeso,
  removeCircuitEx,
  moveCircuitEx,
  openCircuitExPicker,
  pickCircuitExercises,
  saveRoutine,
}: Props) {
  const canSave =
    !!newRoutineName.trim() &&
    newDays.length > 0 &&
    newDays.some(
      (d) =>
        d.ejercicios.length > 0 ||
        (d.circuitos ?? []).some((c) => c.ejercicios.length > 0),
    );

  if (!createVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--pg-bg)",
          borderRadius: 16,
          border: "1px solid var(--pg-border)",
          width: "min(760px, 96vw)",
          height: "min(90vh, 920px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px 16px",
            borderBottom: "1px solid var(--pg-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--pg-text)" }}>
            Crear rutina
          </span>
          <button
            onClick={closeCreateRoutine}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pg-muted)", fontSize: 14 }}
          >
            Cancelar
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px 24px" }}>
          {/* Name */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: "var(--pg-muted)",
              marginBottom: 8,
            }}
          >
            NOMBRE DE LA RUTINA
          </div>
          <input
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            placeholder="Ej: Push Pull Legs"
            style={{ ...inputStyle, marginBottom: 22, fontSize: 15, padding: "11px 13px" }}
          />

          {/* Type */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: "var(--pg-muted)",
              marginBottom: 8,
            }}
          >
            TIPO DE RUTINA
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {ROUTINE_TYPES.map(({ value, label }) => {
              const active = newRoutineType === value;
              return (
                <button
                  key={value}
                  onClick={() => changeRoutineType(value)}
                  style={{
                    flex: 1,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: 10,
                    border: `1.5px solid ${active ? "var(--pg-accent)" : "var(--pg-border)"}`,
                    background: active ? "var(--pg-accent-bg)" : "var(--pg-card)",
                    color: active ? "var(--pg-accent)" : "var(--pg-muted)",
                    fontWeight: active ? 700 : 400,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Days */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: "var(--pg-muted)",
              marginBottom: 12,
            }}
          >
            DÍAS ({newDays.length})
          </div>

          {newDays.map((day, dayIdx) => (
            <DayCard
              key={dayIdx}
              day={day}
              dayIdx={dayIdx}
              isEditing={editingDayIdx === dayIdx}
              onToggleEdit={() => setEditingDayIdx(editingDayIdx === dayIdx ? null : dayIdx)}
              canRemove={newRoutineType !== "daily"}
              onRemove={() => removeDay(dayIdx)}
              onUpdateField={(f, v) => updateDay(dayIdx, f, v)}
              onRemoveExercise={(exIdx) => removeExercise(dayIdx, exIdx)}
              onUpdateDescanso={(exIdx, v) => updateExercise(dayIdx, exIdx, "descanso", v)}
              onUpdateSeries={(exIdx, v) => updateExerciseSeries(dayIdx, exIdx, v)}
              onUpdateRep={(exIdx, si, v) => updateExerciseRep(dayIdx, exIdx, si, v)}
              onUpdatePeso={(exIdx, si, v) => updateExercisePeso(dayIdx, exIdx, si, v)}
              onOpenExPicker={() => openExPickerForDay(dayIdx)}
              onAddCircuit={() => addCircuit(dayIdx)}
              onUpdateCircuit={(circIdx, f, v) => updateCircuit(dayIdx, circIdx, f, v)}
              onRemoveCircuit={(circIdx) => removeCircuit(dayIdx, circIdx)}
              onOpenCircuitExPicker={(circIdx) => openCircuitExPicker(dayIdx, circIdx)}
              onMoveCircuitEx={(circIdx, exIdx, dir) => moveCircuitEx(dayIdx, circIdx, exIdx, dir)}
              onRemoveCircuitEx={(circIdx, exIdx) => removeCircuitEx(dayIdx, circIdx, exIdx)}
              onUpdateCircuitExRep={(circIdx, exIdx, ri, v) =>
                updateCircuitExRep(dayIdx, circIdx, exIdx, ri, v)
              }
              onUpdateCircuitExPeso={(circIdx, exIdx, ri, v) =>
                updateCircuitExPeso(dayIdx, circIdx, exIdx, ri, v)
              }
            />
          ))}

          {newRoutineType !== "daily" && (
            <button
              onClick={addDay}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                border: "1px solid var(--pg-border)",
                background: "transparent",
                color: "var(--pg-accent)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Agregar día
            </button>
          )}
        </div>

        {/* Footer */}
        {canSave && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid var(--pg-border)",
              flexShrink: 0,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={saveRoutine}
              disabled={savingRoutine}
              style={{
                padding: "12px 32px",
                borderRadius: 12,
                border: "none",
                background: "var(--pg-accent)",
                color: "var(--pg-accent-text)",
                fontWeight: 700,
                fontSize: 14,
                cursor: savingRoutine ? "default" : "pointer",
                opacity: savingRoutine ? 0.7 : 1,
              }}
            >
              {savingRoutine ? "Guardando..." : "Guardar rutina"}
            </button>
          </div>
        )}
      </div>

      {/* Exercise pickers render above the modal panel via higher z-index */}
      <ExercisePicker
        visible={exPickerVisible}
        onClose={() => setExPickerVisible(false)}
        onSelectMultiple={pickExercises}
        library={library}
        loading={loadingLibrary}
        title="Elegir ejercicios"
      />

      <ExercisePicker
        visible={circuitExPickerVisible}
        onClose={() => setCircuitExPickerVisible(false)}
        onSelectMultiple={pickCircuitExercises}
        library={library}
        loading={loadingLibrary}
        title="Elegir ejercicios para circuito"
      />
    </div>
  );
}
