import type { SessionExercise } from "@/types/session";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  exercises: SessionExercise[];
  exIndices: number[];
  circuitName: string;
  circuitIndex: number;
  globalMode: "simple" | "detailed";
  colors: any;
  onUpdateSet: (exIdx: number, roundIdx: number, field: "reps" | "weight" | "rpe", value: string) => void;
  onFillDown: (exIdx: number, roundIdx: number, field: "reps" | "weight") => void;
  onToggleDone: (exIdx: number, roundIdx: number) => void;
  onAddRound: () => void;
  onRemoveRound: (roundIdx: number) => void;
  onReplaceExercise: (exIdx: number) => void;
};

export default function CircuitGroupCard({
  exercises,
  exIndices,
  circuitName,
  circuitIndex,
  globalMode,
  colors,
  onUpdateSet,
  onFillDown,
  onToggleDone,
  onAddRound,
  onRemoveRound,
  onReplaceExercise,
}: Props) {
  const rondas = exercises[0]?.sets.length ?? 0;
  const circuitColor = colors.circuitPalette[circuitIndex % colors.circuitPalette.length];
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set());

  const handleToggleDone = (exIdx: number, roundIdx: number) => {
    const roundComplete = exercises.every((ex) => ex.sets[roundIdx]?.done);
    if (roundComplete) {
      // Unchecking a completed round: remove from expanded so it re-collapses if re-completed
      setExpandedRounds((prev) => {
        const next = new Set(prev);
        next.delete(roundIdx);
        return next;
      });
    }
    onToggleDone(exIdx, roundIdx);
  };

  const toggleExpandRound = (roundIdx: number) => {
    setExpandedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(roundIdx)) next.delete(roundIdx);
      else next.add(roundIdx);
      return next;
    });
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: circuitColor.text,
        borderLeftWidth: 3,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <View
              style={{
                backgroundColor: circuitColor.bg,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: circuitColor.text, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }}>
                CIRCUITO
              </Text>
            </View>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
              {circuitName}
            </Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {rondas} serie{rondas !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Rounds */}
      {Array.from({ length: rondas }, (_, roundIdx) => {
        const roundComplete = exercises.every((ex) => ex.sets[roundIdx]?.done);
        const isCollapsed = roundComplete && !expandedRounds.has(roundIdx);
        const isLastRound = roundIdx === rondas - 1;

        if (isCollapsed) {
          return (
            <TouchableOpacity
              key={roundIdx}
              onPress={() => toggleExpandRound(roundIdx)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: circuitColor.bg,
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                marginBottom: isLastRound ? 0 : 10,
              }}
            >
              <Text style={{ color: circuitColor.text, fontWeight: "700", fontSize: 13, letterSpacing: 0.5 }}>
                SERIE {roundIdx + 1}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: circuitColor.text, fontSize: 12 }}>completada</Text>
                <Text style={{ color: circuitColor.text, fontSize: 10 }}>▼</Text>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <View key={roundIdx} style={{ marginBottom: isLastRound ? 0 : 14 }}>
            {/* Round header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  color: roundComplete ? circuitColor.text : colors.textMuted,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}
              >
                SERIE {roundIdx + 1}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {roundComplete && (
                  <>
                    <Text style={{ color: circuitColor.text, fontSize: 11 }}>completada</Text>
                    <TouchableOpacity
                      onPress={() => toggleExpandRound(roundIdx)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={{ color: circuitColor.text, fontSize: 10 }}>▲</Text>
                    </TouchableOpacity>
                  </>
                )}
                {rondas > 1 && (
                  <TouchableOpacity
                    onPress={() => onRemoveRound(roundIdx)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.surface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: colors.error, fontSize: 13, lineHeight: 16 }}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Exercises in this round */}
            {exercises.map((ex, i) => {
              const exIdx = exIndices[i];
              const set = ex.sets[roundIdx];
              if (!set) return null;

              const prevDone = ex.sets.slice(0, roundIdx).reverse().find((s) => s.done);
              const repsPlaceholder = prevDone?.reps || prevDone?.plannedReps || set.plannedReps || "reps";
              const weightPlaceholder = prevDone?.weight || prevDone?.plannedWeight || set.plannedWeight || "kg";
              const firstUndoneRound = ex.sets.findIndex((s) => !s.done);
              const showReplace = !set.done && roundIdx === firstUndoneRound;

              return (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: set.done ? circuitColor.bg : colors.surface,
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: i < exercises.length - 1 ? 6 : 0,
                  }}
                >
                  {/* Name + target */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text
                        style={{
                          flex: 1,
                          color: set.done ? circuitColor.text : colors.text,
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                        numberOfLines={1}
                      >
                        {ex.exercise_name}
                      </Text>
                      {showReplace && (
                        <TouchableOpacity
                          onPress={() => onReplaceExercise(exIdx)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Text style={{ color: colors.textMuted, fontSize: 13, marginLeft: 4 }}>↔</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {ex.target && (
                      <Text style={{ color: colors.textDisabled, fontSize: 11, marginTop: 1 }}>
                        {ex.target}
                      </Text>
                    )}
                  </View>

                  {/* Detailed inputs */}
                  {globalMode === "detailed" && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8, gap: 4 }}>
                      <TextInput
                        value={set.reps}
                        onChangeText={(v) => onUpdateSet(exIdx, roundIdx, "reps", v)}
                        onBlur={() => onFillDown(exIdx, roundIdx, "reps")}
                        placeholder={repsPlaceholder}
                        placeholderTextColor={colors.textDisabled}
                        keyboardType="numeric"
                        style={{
                          width: 50,
                          backgroundColor: colors.card,
                          borderRadius: 8,
                          paddingVertical: 6,
                          paddingHorizontal: 6,
                          color: colors.text,
                          textAlign: "center",
                          fontSize: 14,
                        }}
                      />
                      <TextInput
                        value={set.weight}
                        onChangeText={(v) => onUpdateSet(exIdx, roundIdx, "weight", v)}
                        onBlur={() => onFillDown(exIdx, roundIdx, "weight")}
                        placeholder={weightPlaceholder}
                        placeholderTextColor={colors.textDisabled}
                        keyboardType="numeric"
                        style={{
                          width: 50,
                          backgroundColor: colors.card,
                          borderRadius: 8,
                          paddingVertical: 6,
                          paddingHorizontal: 6,
                          color: colors.text,
                          textAlign: "center",
                          fontSize: 14,
                        }}
                      />
                      <TextInput
                        value={set.rpe}
                        onChangeText={(v) => onUpdateSet(exIdx, roundIdx, "rpe", v)}
                        placeholder="RPE"
                        placeholderTextColor={colors.textDisabled}
                        keyboardType="numeric"
                        style={{
                          width: 46,
                          backgroundColor: colors.card,
                          borderRadius: 8,
                          paddingVertical: 6,
                          paddingHorizontal: 6,
                          color: colors.text,
                          textAlign: "center",
                          fontSize: 14,
                        }}
                      />
                    </View>
                  )}

                  {/* Done toggle */}
                  <TouchableOpacity
                    onPress={() => handleToggleDone(exIdx, roundIdx)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: set.done ? circuitColor.text : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: set.done ? 0 : 1,
                      borderColor: colors.textDisabled,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: set.done ? colors.bg : colors.textDisabled,
                        fontWeight: "700",
                        fontSize: 14,
                      }}
                    >
                      ✓
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        );
      })}

      {/* Add round */}
      <View style={{ marginTop: 12 }}>
        <TouchableOpacity
          onPress={onAddRound}
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
