import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type LibraryExercise = {
  id: string;
  name: string;
  muscle_group: string;
  movement_pattern: string;
  equipment: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: LibraryExercise) => void;
  onSelectMultiple?: (exercises: LibraryExercise[]) => void;
  multiSelect?: boolean;
  library: LibraryExercise[];
  loading?: boolean;
  alreadyAdded?: string[]; // exercise ids already in session/day
  title?: string;
};

export default function ExercisePicker({
  visible,
  onClose,
  onSelect,
  onSelectMultiple,
  multiSelect = false,
  library,
  loading = false,
  alreadyAdded = [],
  title = "Agregar ejercicio",
}: Props) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [equipFilter, setEquipFilter] = useState<string | null>(null);
  const [filtered, setFiltered] = useState<LibraryExercise[]>(library);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const muscleGroups = [...new Set(library.map((e) => e.muscle_group))].sort();
  const equipments = [...new Set(library.map((e) => e.equipment))].sort();

  useEffect(() => {
    let result = library;
    if (muscleFilter) result = result.filter((e) => e.muscle_group === muscleFilter);
    if (equipFilter) result = result.filter((e) => e.equipment === equipFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscle_group.toLowerCase().includes(q) ||
          e.movement_pattern.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [search, muscleFilter, equipFilter, library]);

  const reset = () => {
    setSearch("");
    setMuscleFilter(null);
    setEquipFilter(null);
    setSelected(new Set());
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelect = (exercise: LibraryExercise) => {
    if (multiSelect) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(exercise.id)) next.delete(exercise.id);
        else next.add(exercise.id);
        return next;
      });
    } else {
      reset();
      onSelect(exercise);
    }
  };

  const handleConfirmMultiple = () => {
    const exercises = library.filter((e) => selected.has(e.id));
    reset();
    onSelectMultiple?.(exercises);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: "#0A0F1A" }}>
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 20,
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            borderBottomWidth: 1,
            borderBottomColor: "#1C2535",
          }}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
            {title}
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={{ color: "#888", fontSize: 16 }}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o músculo..."
            placeholderTextColor="#555"
            style={{
              backgroundColor: "#111827",
              borderRadius: 10,
              padding: 12,
              color: "white",
              borderWidth: 1,
              borderColor: "#1E293B",
              fontSize: 14,
            }}
          />
        </View>

        {/* ── Muscle group chips ── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ color: "#555", fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>
            MÚSCULO
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {muscleGroups.map((mg) => {
              const active = muscleFilter === mg;
              return (
                <TouchableOpacity
                  key={mg}
                  onPress={() => setMuscleFilter(active ? null : mg)}
                  style={{
                    backgroundColor: active ? "#6EE7B7" : "#111827",
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: active ? "#6EE7B7" : "#1E293B",
                  }}
                >
                  <Text style={{ color: active ? "#0A0F1A" : "#888", fontSize: 12, fontWeight: "600" }}>
                    {mg}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Equipment chips ── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Text style={{ color: "#555", fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>
            EQUIPAMIENTO
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {equipments.map((eq) => {
              const active = equipFilter === eq;
              return (
                <TouchableOpacity
                  key={eq}
                  onPress={() => setEquipFilter(active ? null : eq)}
                  style={{
                    backgroundColor: active ? "#2563EB" : "#111827",
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: active ? "#2563EB" : "#1E293B",
                  }}
                >
                  <Text style={{ color: active ? "white" : "#888", fontSize: 12, fontWeight: "600" }}>
                    {eq}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Results count ── */}
        {!loading && (muscleFilter || equipFilter || search.trim()) && (
          <Text style={{ color: "#555", fontSize: 11, paddingHorizontal: 16, marginBottom: 6 }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </Text>
        )}

        {/* ── Exercise list ── */}
        {loading ? (
          <ActivityIndicator color="#6EE7B7" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: multiSelect ? 100 : 40 }}
            renderItem={({ item }) => {
              const isAdded = alreadyAdded.includes(item.id);
              const isSelected = selected.has(item.id);
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    marginBottom: 4,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: isSelected ? "#0D2030" : isAdded ? "#0D1F18" : "transparent",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isSelected ? "#93C5FD" : isAdded ? "#6EE7B7" : "white", fontWeight: "500", fontSize: 14 }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: "#555", fontSize: 11, marginTop: 2 }}>
                      {item.muscle_group} · {item.movement_pattern} · {item.equipment}
                    </Text>
                  </View>

                  {multiSelect ? (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: isSelected ? "#2563EB" : "#1C2535",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                        borderWidth: 1,
                        borderColor: isSelected ? "#2563EB" : "#2A3547",
                      }}
                    >
                      {isSelected && (
                        <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>✓</Text>
                      )}
                    </View>
                  ) : isAdded ? (
                    <Text style={{ color: "#6EE7B7", fontSize: 12, marginLeft: 8 }}>Agregado</Text>
                  ) : (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#1C2535",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                      }}
                    >
                      <Text style={{ color: "#6EE7B7", fontSize: 16, fontWeight: "700" }}>+</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Text style={{ color: "#555", fontSize: 14, textAlign: "center" }}>
                  No se encontraron ejercicios
                </Text>
                {(muscleFilter || equipFilter) && (
                  <TouchableOpacity
                    onPress={() => { setMuscleFilter(null); setEquipFilter(null); }}
                    style={{ marginTop: 12 }}
                  >
                    <Text style={{ color: "#6EE7B7", fontSize: 13 }}>Limpiar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {/* ── Multi-select confirm button ── */}
        {multiSelect && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 20,
              paddingBottom: Platform.OS === "ios" ? 36 : 20,
              backgroundColor: "#0A0F1A",
              borderTopWidth: 1,
              borderTopColor: "#1C2535",
            }}
          >
            <TouchableOpacity
              onPress={handleConfirmMultiple}
              disabled={selected.size === 0}
              style={{
                backgroundColor: selected.size > 0 ? "#2563EB" : "#1C2535",
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                {selected.size > 0
                  ? `Agregar ${selected.size} ejercicio${selected.size !== 1 ? "s" : ""}`
                  : "Seleccioná ejercicios"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
