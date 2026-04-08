import type { SessionExercise, SetEntry } from "@/types/session";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  ex: SessionExercise;
  exIdx: number;
  globalMode: "simple" | "detailed";
  colors: any;
  onUpdateSet: (exIdx: number, setIdx: number, field: "reps" | "weight" | "rpe", value: string) => void;
  onToggleDone: (exIdx: number, setIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onRemoveSet: (exIdx: number, setIdx: number) => void;
  onRemoveExercise: (exIdx: number) => void;
  onToggleMode: (exIdx: number) => void;
};

function SimpleSet({
  set,
  setIdx,
  target,
  totalSets,
  colors,
  onToggle,
  onRemove,
}: {
  set: SetEntry;
  setIdx: number;
  target?: string;
  totalSets: number;
  colors: any;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 10,
          backgroundColor: set.done ? colors.accentBg : colors.surface,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: set.done ? "#065F46" : "transparent",
        }}
      >
        <Text style={{ color: set.done ? "#6EE7B7" : "#555", width: 28, fontSize: 13 }}>
          {setIdx + 1}
        </Text>
        <Text style={{ flex: 1, color: set.done ? "#6EE7B7" : "#888", fontSize: 14 }}>
          {target
            ? target.includes("×")
              ? target.split("×")[1].trim() + " reps"
              : target
            : "Serie " + (setIdx + 1)}
        </Text>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: set.done ? "#6EE7B7" : "transparent",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: set.done ? 0 : 1,
            borderColor: "#444",
          }}
        >
          <Text style={{ color: set.done ? "#0A0F1A" : "#555", fontWeight: "700", fontSize: 14 }}>
            ✓
          </Text>
        </View>
      </TouchableOpacity>
      {totalSets > 1 && (
        <TouchableOpacity
          onPress={onRemove}
          style={{
            marginLeft: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.error, fontSize: 14 }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DetailedSets({
  sets,
  exIdx,
  colors,
  onUpdate,
  onToggle,
  onRemove,
}: {
  sets: SetEntry[];
  exIdx: number;
  colors: any;
  onUpdate: (setIdx: number, field: "reps" | "weight" | "rpe", value: string) => void;
  onToggle: (setIdx: number) => void;
  onRemove: (setIdx: number) => void;
}) {
  return (
    <>
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        <Text style={{ color: colors.textDisabled, fontSize: 11, width: 30 }}>#</Text>
        <Text style={{ color: colors.textDisabled, fontSize: 11, flex: 1, textAlign: "center" }}>REPS</Text>
        <Text style={{ color: colors.textDisabled, fontSize: 11, flex: 1, textAlign: "center" }}>PESO (kg)</Text>
        <Text style={{ color: colors.textDisabled, fontSize: 11, width: 46, textAlign: "center" }}>RPE</Text>
        <View style={{ width: 36 }} />
        {sets.length > 1 && <View style={{ width: 28 }} />}
      </View>
      {sets.map((set, setIdx) => (
        <View key={setIdx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ color: set.done ? "#6EE7B7" : "#555", width: 30, fontSize: 13 }}>
            {setIdx + 1}
          </Text>
          <TextInput
            value={set.reps}
            onChangeText={(v) => onUpdate(setIdx, "reps", v)}
            placeholder="0"
            placeholderTextColor="#444"
            keyboardType="numeric"
            style={{
              flex: 1,
              backgroundColor: set.done ? colors.accentBg : colors.surface,
              borderRadius: 8,
              padding: 8,
              color: colors.text,
              textAlign: "center",
              marginRight: 6,
              fontSize: 15,
            }}
          />
          <TextInput
            value={set.weight}
            onChangeText={(v) => onUpdate(setIdx, "weight", v)}
            placeholder="0"
            placeholderTextColor="#444"
            keyboardType="numeric"
            style={{
              flex: 1,
              backgroundColor: set.done ? colors.accentBg : colors.surface,
              borderRadius: 8,
              padding: 8,
              color: colors.text,
              textAlign: "center",
              marginRight: 6,
              fontSize: 15,
            }}
          />
          <TextInput
            value={set.rpe}
            onChangeText={(v) => onUpdate(setIdx, "rpe", v)}
            placeholder="–"
            placeholderTextColor="#444"
            keyboardType="numeric"
            style={{
              width: 46,
              backgroundColor: set.done ? colors.accentBg : colors.surface,
              borderRadius: 8,
              padding: 8,
              color: colors.text,
              textAlign: "center",
              marginRight: 6,
              fontSize: 15,
            }}
          />
          <TouchableOpacity
            onPress={() => onToggle(setIdx)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: set.done ? colors.accent : colors.surface,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: set.done ? 0 : 1,
              borderColor: "#333",
            }}
          >
            <Text style={{ color: set.done ? "#0A0F1A" : "#555", fontWeight: "700", fontSize: 14 }}>
              ✓
            </Text>
          </TouchableOpacity>
          {sets.length > 1 && (
            <TouchableOpacity
              onPress={() => onRemove(setIdx)}
              style={{
                marginLeft: 4,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.error, fontSize: 14 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </>
  );
}

export default function ExerciseCard({
  ex,
  exIdx,
  globalMode,
  colors,
  onUpdateSet,
  onToggleDone,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onToggleMode,
}: Props) {
  const mode = ex.trackingMode ?? globalMode;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
            {ex.exercise_name}
          </Text>
          {ex.target && (
            <Text style={{ color: colors.accent, fontSize: 12, marginTop: 3 }}>
              Objetivo: {ex.target}
            </Text>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <TouchableOpacity
            onPress={() => onToggleMode(exIdx)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: ex.trackingMode ? colors.accent : colors.border,
            }}
          >
            <Text
              style={{
                color: ex.trackingMode ? colors.accent : colors.textDisabled,
                fontSize: 11,
              }}
            >
              {ex.trackingMode === "simple" ? "Vista" : ex.trackingMode === "detailed" ? "Detalle" : "···"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onRemoveExercise(exIdx)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.error, fontSize: 14, fontWeight: "700" }}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sets */}
      {mode === "simple"
        ? ex.sets.map((set, setIdx) => (
            <SimpleSet
              key={setIdx}
              set={set}
              setIdx={setIdx}
              target={ex.target}
              totalSets={ex.sets.length}
              colors={colors}
              onToggle={() => onToggleDone(exIdx, setIdx)}
              onRemove={() => onRemoveSet(exIdx, setIdx)}
            />
          ))
        : <DetailedSets
            sets={ex.sets}
            exIdx={exIdx}
            colors={colors}
            onUpdate={(setIdx, field, value) => onUpdateSet(exIdx, setIdx, field, value)}
            onToggle={(setIdx) => onToggleDone(exIdx, setIdx)}
            onRemove={(setIdx) => onRemoveSet(exIdx, setIdx)}
          />
      }

      {/* Add set */}
      <View style={{ marginTop: 8 }}>
        <TouchableOpacity
          onPress={() => onAddSet(exIdx)}
          style={{
            padding: 9,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>+ Serie</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
