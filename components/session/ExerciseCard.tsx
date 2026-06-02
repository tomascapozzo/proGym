import type { SessionExercise, SetEntry } from "@/types/session";
import React, { memo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  ex: SessionExercise;
  exIdx: number;
  globalMode: "simple" | "detailed";
  colors: any;
  onUpdateSet: (exIdx: number, setIdx: number, field: "reps" | "weight", value: string) => void;
  onFillDown: (exIdx: number, setIdx: number, field: "reps" | "weight") => void;
  onToggleDone: (exIdx: number, setIdx: number) => void;
  onSkipSet: (exIdx: number, setIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onRemoveSet: (exIdx: number, setIdx: number) => void;
  onRemoveExercise: (exIdx: number) => void;
  onReplaceExercise: (exIdx: number) => void;
  onToggleMode: (exIdx: number) => void;
  isReordering?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

// ─── Simple mode set row ──────────────────────────────────────────────────────

function SimpleSet({
  set,
  setIdx,
  target,
  totalSets,
  colors,
  isCollapsed,
  onToggle,
  onToggleExpand,
  onRemove,
  onSkip,
}: {
  set: SetEntry;
  setIdx: number;
  target?: string;
  totalSets: number;
  colors: any;
  isCollapsed: boolean;
  onToggle: () => void;
  onToggleExpand: () => void;
  onRemove: () => void;
  onSkip: () => void;
}) {
  const label = target
    ? target.includes("×")
      ? target.split("×")[1].trim() + " reps"
      : target
    : "Serie " + (setIdx + 1);

  // Skipped (always shown collapsed-style, neutral colors)
  if (set.skipped) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 10,
            backgroundColor: colors.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textMuted, width: 28, fontSize: 13 }}>{setIdx + 1}</Text>
          <Text style={{ flex: 1, color: colors.textMuted, fontSize: 13 }}>Omitida</Text>
          <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Deshacer</Text>
          </TouchableOpacity>
        </View>
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

  if (isCollapsed) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <TouchableOpacity
          onPress={onToggleExpand}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 10,
            backgroundColor: colors.accentBg,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.accent + "60",
          }}
        >
          <Text style={{ color: colors.accent, width: 28, fontSize: 13 }}>{setIdx + 1}</Text>
          <Text style={{ flex: 1, color: colors.accent, fontSize: 13 }}>{label}</Text>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "700" }}>✓</Text>
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

  // Done + manually expanded
  if (set.done) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 10,
            backgroundColor: colors.accentBg,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.accent + "60",
          }}
        >
          <Text style={{ color: colors.accent, width: 28, fontSize: 13 }}>{setIdx + 1}</Text>
          <Text style={{ flex: 1, color: colors.accent, fontSize: 14 }}>{label}</Text>
          <TouchableOpacity onPress={onToggleExpand} hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}>
            <Text style={{ color: colors.accent, fontSize: 11, marginRight: 10 }}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggle}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 14 }}>✓</Text>
          </TouchableOpacity>
        </View>
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

  // Undone
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
          backgroundColor: colors.surface,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "transparent",
        }}
      >
        <Text style={{ color: colors.textDisabled, width: 28, fontSize: 13 }}>{setIdx + 1}</Text>
        <Text style={{ flex: 1, color: colors.textMuted, fontSize: 14 }}>{label}</Text>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textDisabled, fontWeight: "700", fontSize: 14 }}>✓</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSkip}
        style={{
          marginLeft: 8,
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>→</Text>
      </TouchableOpacity>
      {totalSets > 1 && (
        <TouchableOpacity
          onPress={onRemove}
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
  );
}

// ─── Detailed mode sets ───────────────────────────────────────────────────────

function DetailedSets({
  sets,
  exIdx,
  colors,
  expandedSets,
  onToggleExpand,
  onUpdate,
  onFillDown,
  onToggle,
  onSkip,
  onRemove,
}: {
  sets: SetEntry[];
  exIdx: number;
  colors: any;
  expandedSets: Set<number>;
  onToggleExpand: (setIdx: number) => void;
  onUpdate: (setIdx: number, field: "reps" | "weight", value: string) => void;
  onFillDown: (setIdx: number, field: "reps" | "weight") => void;
  onToggle: (setIdx: number) => void;
  onSkip: (setIdx: number) => void;
  onRemove: (setIdx: number) => void;
}) {
  const anyExpanded = sets.some((s, i) => !s.done || expandedSets.has(i));

  return (
    <>
      {anyExpanded && (
        <View style={{ flexDirection: "row", marginBottom: 6 }}>
          <Text style={{ color: colors.textDisabled, fontSize: 11, width: 30 }}>#</Text>
          <Text style={{ color: colors.textDisabled, fontSize: 11, flex: 1, textAlign: "center" }}>REPS</Text>
          <Text style={{ color: colors.textDisabled, fontSize: 11, flex: 1, textAlign: "center" }}>PESO (kg)</Text>
          <View style={{ width: 34 }} />
          <View style={{ width: 38 }} />
          {sets.length > 1 && <View style={{ width: 32 }} />}
        </View>
      )}
      {sets.map((set, setIdx) => {
        // Skipped sets: always show compact neutral row
        if (set.skipped) {
          return (
            <View key={setIdx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: colors.textMuted, width: 30, fontSize: 13 }}>{setIdx + 1}</Text>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textMuted, flex: 1, fontSize: 14 }}>Omitida</Text>
              </View>
              <TouchableOpacity
                onPress={() => onToggle(setIdx)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>↩</Text>
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
          );
        }

        const isCollapsed = set.done && !expandedSets.has(setIdx);

        if (isCollapsed) {
          const summary = [
            set.reps ? `${set.reps} reps` : null,
            set.weight ? `${set.weight} kg` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <View key={setIdx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: colors.accent, width: 30, fontSize: 13 }}>{setIdx + 1}</Text>
              <TouchableOpacity
                onPress={() => onToggleExpand(setIdx)}
                style={{
                  flex: 1,
                  backgroundColor: colors.accentBg,
                  borderRadius: 8,
                  padding: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 6,
                }}
              >
                <Text style={{ color: colors.accent, flex: 1, fontSize: 14 }}>
                  {summary || "Completada"}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onToggle(setIdx)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 14 }}>✓</Text>
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
          );
        }

        const prevDone = sets.slice(0, setIdx).reverse().find((s) => s.done && !s.skipped);
        const repsPlaceholder = set.plannedReps || prevDone?.reps || prevDone?.plannedReps || "0";
        const weightPlaceholder = prevDone?.weight || prevDone?.plannedWeight || set.plannedWeight || "0";

        return (
          <View key={setIdx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            {set.done ? (
              <TouchableOpacity
                onPress={() => onToggleExpand(setIdx)}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                style={{ width: 30, alignItems: "flex-start" }}
              >
                <Text style={{ color: colors.accent, fontSize: 11 }}>▲</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: colors.textDisabled, width: 30, fontSize: 13 }}>{setIdx + 1}</Text>
            )}
            <TextInput
              value={set.reps}
              onChangeText={(v) => onUpdate(setIdx, "reps", v)}
              onBlur={() => onFillDown(setIdx, "reps")}
              placeholder={repsPlaceholder}
              placeholderTextColor={colors.textDisabled}
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
              onBlur={() => onFillDown(setIdx, "weight")}
              placeholder={weightPlaceholder}
              placeholderTextColor={colors.textDisabled}
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
            {!set.done && (
              <TouchableOpacity
                onPress={() => onSkip(setIdx)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 16 }}>→</Text>
              </TouchableOpacity>
            )}
            {set.done && <View style={{ width: 40 }} />}
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
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: set.done ? colors.accentText : colors.textDisabled, fontWeight: "700", fontSize: 14 }}>
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
        );
      })}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function ExerciseCard({
  ex,
  exIdx,
  globalMode,
  colors,
  onUpdateSet,
  onFillDown,
  onToggleDone,
  onSkipSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onReplaceExercise,
  onToggleMode,
  isReordering,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: Props) {
  const mode = ex.trackingMode ?? globalMode;
  const [expandedSets, setExpandedSets] = useState<Set<number>>(new Set());

  const handleToggleDone = (setIdx: number) => {
    if (ex.sets[setIdx]?.done) {
      setExpandedSets((prev) => {
        const next = new Set(prev);
        next.delete(setIdx);
        return next;
      });
    }
    onToggleDone(exIdx, setIdx);
  };

  const handleToggleExpand = (setIdx: number) => {
    setExpandedSets((prev) => {
      const next = new Set(prev);
      if (next.has(setIdx)) next.delete(setIdx);
      else next.add(setIdx);
      return next;
    });
  };

  const handleRemoveSet = (setIdx: number) => {
    setExpandedSets(new Set());
    onRemoveSet(exIdx, setIdx);
  };

  if (isReordering) {
    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 16, marginRight: 12 }}>≡</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }} numberOfLines={1}>
            {ex.exercise_name}
          </Text>
          {ex.target && (
            <Text style={{ color: colors.textDisabled, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
              {ex.target}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={onMoveUp}
            disabled={!canMoveUp}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: canMoveUp ? colors.border : "transparent",
            }}
          >
            <Text style={{ color: canMoveUp ? colors.text : colors.textDisabled, fontSize: 16 }}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMoveDown}
            disabled={!canMoveDown}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: canMoveDown ? colors.border : "transparent",
            }}
          >
            <Text style={{ color: canMoveDown ? colors.text : colors.textDisabled, fontSize: 16 }}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            onPress={() => onReplaceExercise(exIdx)}
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
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>↔</Text>
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
              isCollapsed={set.done && !set.skipped && !expandedSets.has(setIdx)}
              onToggleExpand={() => handleToggleExpand(setIdx)}
              onToggle={() => handleToggleDone(setIdx)}
              onRemove={() => handleRemoveSet(setIdx)}
              onSkip={() => onSkipSet(exIdx, setIdx)}
            />
          ))
        : <DetailedSets
            sets={ex.sets}
            exIdx={exIdx}
            colors={colors}
            expandedSets={expandedSets}
            onToggleExpand={handleToggleExpand}
            onUpdate={(setIdx, field, value) => onUpdateSet(exIdx, setIdx, field, value)}
            onFillDown={(setIdx, field) => onFillDown(exIdx, setIdx, field)}
            onToggle={handleToggleDone}
            onSkip={(setIdx) => onSkipSet(exIdx, setIdx)}
            onRemove={handleRemoveSet}
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

export default memo(ExerciseCard, (prev, next) =>
  prev.ex === next.ex &&
  prev.exIdx === next.exIdx &&
  prev.globalMode === next.globalMode &&
  prev.colors === next.colors &&
  prev.isReordering === next.isReordering &&
  prev.canMoveUp === next.canMoveUp &&
  prev.canMoveDown === next.canMoveDown,
);
