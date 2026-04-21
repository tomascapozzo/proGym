import { useTheme } from "@/context/theme-context";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
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

type FilterDropdownProps = {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
};

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const active = value !== null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: active ? colors.accentBg : colors.card,
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: active ? colors.accent : colors.border,
        }}
      >
        <Text
          style={{
            color: active ? colors.accent : colors.textMuted,
            fontSize: 13,
            fontWeight: active ? "700" : "400",
            flex: 1,
          }}
          numberOfLines={1}
        >
          {value ?? label}
        </Text>
        <Text style={{ color: active ? colors.accent : colors.textMuted, fontSize: 9, marginLeft: 4 }}>
          ▼
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
          onPress={() => setOpen(false)}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
                maxHeight: 420,
              }}
            >
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                    marginBottom: 12,
                  }}
                />
                <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>
                  {label.toUpperCase()}
                </Text>
              </View>
              <ScrollView>
                <TouchableOpacity
                  onPress={() => { onChange(null); setOpen(false); }}
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 24,
                    backgroundColor: value === null ? colors.accentBg : "transparent",
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: value === null ? colors.accent : colors.text,
                      fontSize: 16,
                      fontWeight: value === null ? "700" : "400",
                    }}
                  >
                    Todos
                  </Text>
                  {value === null && <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>}
                </TouchableOpacity>
                {options.map((opt) => {
                  const selected = value === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => { onChange(opt); setOpen(false); }}
                      style={{
                        paddingVertical: 15,
                        paddingHorizontal: 24,
                        backgroundColor: selected ? colors.accentBg : "transparent",
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          color: selected ? colors.accent : colors.text,
                          fontSize: 16,
                          fontWeight: selected ? "700" : "400",
                        }}
                      >
                        {opt}
                      </Text>
                      {selected && <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: Platform.OS === "ios" ? 34 : 16 }} />
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: LibraryExercise) => void;
  onSelectMultiple?: (exercises: LibraryExercise[]) => void;
  multiSelect?: boolean;
  library: LibraryExercise[];
  loading?: boolean;
  alreadyAdded?: string[];
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
  const { colors } = useTheme();
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
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 20,
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            borderBottomWidth: 1,
            borderBottomColor: colors.tabBorder,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
            {title}
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o músculo..."
            placeholderTextColor={colors.textDisabled}
            style={{
              backgroundColor: colors.card,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 14,
            }}
          />
        </View>

        {/* Filter dropdowns */}
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 }}>
          <FilterDropdown
            label="Músculo"
            value={muscleFilter}
            options={muscleGroups}
            onChange={setMuscleFilter}
          />
          <FilterDropdown
            label="Equipamiento"
            value={equipFilter}
            options={equipments}
            onChange={setEquipFilter}
          />
        </View>

        {/* Results count */}
        {!loading && (muscleFilter || equipFilter || search.trim()) && (
          <Text style={{ color: colors.textMuted, fontSize: 11, paddingHorizontal: 16, marginBottom: 6 }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </Text>
        )}

        {/* Exercise list */}
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
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
                    backgroundColor: isSelected
                      ? colors.accentBg
                      : isAdded
                      ? colors.surface
                      : "transparent",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: isSelected ? colors.accent : isAdded ? colors.textMuted : colors.text,
                        fontWeight: "500",
                        fontSize: 14,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.textDisabled, fontSize: 11, marginTop: 2 }}>
                      {item.muscle_group} · {item.movement_pattern} · {item.equipment}
                    </Text>
                  </View>

                  {multiSelect ? (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: isSelected ? colors.accent : colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                        borderWidth: 1,
                        borderColor: isSelected ? colors.accent : colors.border,
                      }}
                    >
                      {isSelected && (
                        <Text style={{ color: colors.accentText, fontSize: 13, fontWeight: "700" }}>✓</Text>
                      )}
                    </View>
                  ) : isAdded ? (
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 8 }}>Agregado</Text>
                  ) : (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                      }}
                    >
                      <Text style={{ color: colors.accent, fontSize: 16, fontWeight: "700" }}>+</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center" }}>
                  No se encontraron ejercicios
                </Text>
                {(muscleFilter || equipFilter) && (
                  <TouchableOpacity
                    onPress={() => { setMuscleFilter(null); setEquipFilter(null); }}
                    style={{ marginTop: 12 }}
                  >
                    <Text style={{ color: colors.accent, fontSize: 13 }}>Limpiar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {/* Multi-select confirm button */}
        {multiSelect && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 20,
              paddingBottom: Platform.OS === "ios" ? 36 : 20,
              backgroundColor: colors.bg,
              borderTopWidth: 1,
              borderTopColor: colors.tabBorder,
            }}
          >
            <TouchableOpacity
              onPress={handleConfirmMultiple}
              disabled={selected.size === 0}
              style={{
                backgroundColor: selected.size > 0 ? colors.accent : colors.surface,
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: selected.size > 0 ? colors.accentText : colors.textMuted, fontWeight: "700", fontSize: 16 }}>
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
