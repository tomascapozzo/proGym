import type { SessionExercise } from "@/types/session";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  exercises: SessionExercise[];
  exIndices: number[];
  circuitName: string;
  globalMode: "simple" | "detailed";
  colors: any;
  onUpdateSet: (exIdx: number, roundIdx: number, field: "reps" | "weight" | "rpe", value: string) => void;
  onToggleDone: (exIdx: number, roundIdx: number) => void;
  onAddRound: () => void;
  onRemoveRound: (roundIdx: number) => void;
};

export default function CircuitGroupCard({
  exercises,
  exIndices,
  circuitName,
  globalMode,
  colors,
  onUpdateSet,
  onToggleDone,
  onAddRound,
  onRemoveRound,
}: Props) {
  const rondas = exercises[0]?.sets.length ?? 0;

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
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <View
              style={{
                backgroundColor: colors.accentBg,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }}>
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
        const isLastRound = roundIdx === rondas - 1;

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
                  color: roundComplete ? colors.accent : colors.textMuted,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}
              >
                SERIE {roundIdx + 1}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {roundComplete && (
                  <Text style={{ color: colors.accent, fontSize: 11 }}>completada</Text>
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

              return (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: set.done ? colors.accentBg : colors.surface,
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: i < exercises.length - 1 ? 6 : 0,
                  }}
                >
                  {/* Name + target */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        color: set.done ? colors.accent : colors.text,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                      numberOfLines={1}
                    >
                      {ex.exercise_name}
                    </Text>
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
                        placeholder="reps"
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
                        placeholder="kg"
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
                    </View>
                  )}

                  {/* Done toggle */}
                  <TouchableOpacity
                    onPress={() => onToggleDone(exIdx, roundIdx)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: set.done ? colors.accent : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: set.done ? 0 : 1,
                      borderColor: colors.textDisabled,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: set.done ? colors.accentText : colors.textDisabled,
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
