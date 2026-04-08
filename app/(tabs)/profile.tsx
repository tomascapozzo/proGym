import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const pickerData: Record<
  string,
  { title: string; options: string[]; multi?: boolean }
> = {
  edad: {
    title: "Edad",
    options: [
      "16 – 20 años",
      "21 – 25 años",
      "26 – 30 años",
      "31 – 35 años",
      "36 – 40 años",
      "41 – 45 años",
      "46+ años",
    ],
  },
  profesion: {
    title: "Tipo de trabajo",
    options: ["Oficina", "Trabajo de pie", "Trabajo físico", "Mixto"],
  },
  disponibilidad: {
    title: "Días disponibles",
    options: [
      "1 día",
      "2 días",
      "3 días",
      "4 días",
      "5 días",
      "6 días",
      "7 días",
    ],
  },
  equipamiento: {
    title: "Equipamiento",
    options: ["Gimnasio completo", "Mancuernas", "Peso corporal", "Casa"],
  },
  nivel: {
    title: "Nivel",
    options: ["Sin experiencia", "1 año", "1–3 años", "3+ años"],
  },
  actualidad: {
    title: "Actualidad",
    options: ["Fuerza", "Running", "Ambos", "Nada"],
  },
  objetivo: {
    title: "Objetivos",
    multi: true,
    options: ["Perder grasa", "Ganar fuerza", "Rendimiento", "Salud"],
  },
};

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  // Editable fields mirrored from profile
  const [values, setValues] = useState<Record<string, string>>(() => ({
    edad: profile?.edad ?? "",
    profesion: profile?.profesion ?? "",
    disponibilidad: profile?.disponibilidad ?? "",
    equipamiento: profile?.equipamiento ?? "",
    nivel: profile?.nivel ?? "",
    actualidad: profile?.actualidad ?? "",
  }));
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>(
    () => ({ objetivo: profile?.objetivo ?? [] }),
  );
  const [peso, setPeso] = useState(profile?.peso ?? "");
  const [altura, setAltura] = useState(profile?.altura ?? "");
  const [lesiones, setLesiones] = useState(profile?.lesiones ?? "");

  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // ── Modals ──
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [prPickerVisible, setPrPickerVisible] = useState(false);

  // ── Stats ──
  const [statsLoading, setStatsLoading] = useState(true);
  const [daysThisMonth, setDaysThisMonth] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [prMap, setPrMap] = useState<
    Record<string, { weight: number; reps: number }>
  >({});

  // ── PR section ──
  const [selectedPRExercises, setSelectedPRExercises] = useState<string[]>(
    () => profile?.pr_exercises ?? [],
  );

  // ── History ──
  type WorkoutLogEntry = {
    id: string;
    created_at: string;
    exercises: { exercise_name: string; sets: any[] }[];
  };
  const [history, setHistory] = useState<WorkoutLogEntry[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();

      const [monthRes, totalRes, logsRes, historyRes] = await Promise.all([
        supabase
          .from("workout_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", monthStart),
        supabase
          .from("workout_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("workout_logs")
          .select("exercises")
          .eq("user_id", user.id),
        supabase
          .from("workout_logs")
          .select("id, created_at, exercises")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      setDaysThisMonth(monthRes.count ?? 0);
      setTotalWorkouts(totalRes.count ?? 0);

      if (logsRes.data) {
        const map: Record<string, { weight: number; reps: number }> = {};
        logsRes.data.forEach((log: any) => {
          (log.exercises as any[])?.forEach((ex: any) => {
            ex.sets?.forEach((s: { reps: number; weight: number }) => {
              const w = Number(s.weight) || 0;
              if (
                w > 0 &&
                (!map[ex.exercise_name] || w > map[ex.exercise_name].weight)
              ) {
                map[ex.exercise_name] = { weight: w, reps: s.reps ?? 0 };
              }
            });
          });
        });
        setPrMap(map);
      }

      setHistory((historyRes.data as any) ?? []);
      setStatsLoading(false);
    };
    fetchStats();
  }, [user]);

  const handleSelect = (key: string, option: string) => {
    if (pickerData[key].multi) {
      const current = multiValues[key] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setMultiValues({ ...multiValues, [key]: updated });
    } else {
      setValues({ ...values, [key]: option });
      setCurrentPicker(null);
    }
  };

  const renderValue = (key: string) => {
    if (pickerData[key].multi) {
      const val = multiValues[key] || [];
      if (val.length === 0) return "Sin selección";
      if (val.length === 1) return val[0];
      return `${val.length} seleccionados`;
    }
    return values[key] || "Sin selección";
  };

  const handleSave = async () => {
    if (!user) return;
    setError("");
    setSaving(true);

    const { error: err } = await supabase
      .from("profiles")
      .update({
        edad: values.edad || null,
        profesion: values.profesion || null,
        disponibilidad: values.disponibilidad || null,
        equipamiento: values.equipamiento || null,
        nivel: values.nivel || null,
        actualidad: values.actualidad || null,
        objetivo: multiValues.objetivo ?? [],
        peso: peso.trim() || null,
        altura: altura.trim() || null,
        lesiones: lesiones.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (err) {
      setError("Error guardando los cambios.");
      return;
    }

    await refreshProfile();
    setInfoModalVisible(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOpenInfoModal = () => {
    setValues({
      edad: profile?.edad ?? "",
      profesion: profile?.profesion ?? "",
      disponibilidad: profile?.disponibilidad ?? "",
      equipamiento: profile?.equipamiento ?? "",
      nivel: profile?.nivel ?? "",
      actualidad: profile?.actualidad ?? "",
    });
    setMultiValues({ objetivo: profile?.objetivo ?? [] });
    setPeso(profile?.peso ?? "");
    setAltura(profile?.altura ?? "");
    setLesiones(profile?.lesiones ?? "");
    setError("");
    setInfoModalVisible(true);
  };

  const togglePRExercise = (name: string) => {
    setSelectedPRExercises((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name],
    );
  };

  const savePRExercises = async (exercises: string[]) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ pr_exercises: exercises })
      .eq("id", user.id);
  };

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: signOut },
    ]);
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  const prExerciseNames = Object.keys(prMap);
  const displayedPRs = selectedPRExercises.filter(
    (e) => prMap[e] !== undefined,
  );

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{profile?.name ?? ""}</Text>
            {profile?.username ? (
              <Text style={styles.headerUsername}>@{profile.username}</Text>
            ) : null}
          </View>
        </View>

        {/* ── SUCCESS BANNER ── */}
        {saveSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Perfil actualizado</Text>
          </View>
        )}

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          {statsLoading ? (
            <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{daysThisMonth}</Text>
                <Text style={styles.statLabel}>Este mes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalWorkouts}</Text>
                <Text style={styles.statLabel}>Entrenos</Text>
              </View>
            </>
          )}
        </View>

        {/* ── MIS PRs SECTION ── */}
        <View style={styles.prSectionHeader}>
          <Text style={styles.sectionLabel}>MIS PRs</Text>
          {prExerciseNames.length > 0 && (
            <TouchableOpacity
              onPress={() => setPrPickerVisible(true)}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>+ Seleccionar</Text>
            </TouchableOpacity>
          )}
        </View>

        {statsLoading ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginBottom: 20 }}
          />
        ) : prExerciseNames.length === 0 ? (
          <View style={styles.prEmptyCard}>
            <Text style={styles.prEmptyText}>
              Registra entrenamientos para ver tus récords personales.
            </Text>
          </View>
        ) : displayedPRs.length === 0 ? (
          <TouchableOpacity
            onPress={() => setPrPickerVisible(true)}
            style={styles.prEmptyCard}
          >
            <Text style={styles.prEmptyText}>
              Toca "+ Seleccionar" para añadir ejercicios a tu lista de PRs.
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.prList}>
            {displayedPRs.map((name) => (
              <View key={name} style={styles.prCard}>
                <Text style={styles.prName} numberOfLines={1}>
                  {name}
                </Text>
                <View style={styles.prBadge}>
                  <Text style={styles.prWeight}>{prMap[name]?.weight} kg</Text>
                  <Text style={styles.prReps}>{prMap[name]?.reps} reps</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── HISTORIAL ── */}
        <TouchableOpacity
          onPress={() => setHistoryExpanded((v) => !v)}
          style={styles.prSectionHeader}
        >
          <Text style={styles.sectionLabel}>HISTORIAL</Text>
          <Text style={{ color: "#888", fontSize: 13 }}>
            {historyExpanded ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {historyExpanded &&
          (statsLoading ? (
            <ActivityIndicator
              color={colors.accent}
              style={{ marginBottom: 20 }}
            />
          ) : history.length === 0 ? (
            <View style={styles.prEmptyCard}>
              <Text style={styles.prEmptyText}>
                Aún no tenés entrenamientos registrados.
              </Text>
            </View>
          ) : (
            <View style={{ marginBottom: 24 }}>
              {history.map((entry) => {
                const totalSets = entry.exercises.reduce(
                  (acc: number, ex: any) => acc + (ex.sets?.length ?? 0),
                  0,
                );
                const dateLabel = new Date(entry.created_at).toLocaleDateString(
                  "es-AR",
                  { weekday: "short", day: "numeric", month: "short" },
                );
                return (
                  <View key={entry.id} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDate}>{dateLabel}</Text>
                      <Text style={styles.historyDetail}>
                        {entry.exercises.length} ejercicio
                        {entry.exercises.length !== 1 ? "s" : ""} · {totalSets}{" "}
                        serie{totalSets !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

        {/* ── EDITAR INFORMACIÓN ── */}
        <TouchableOpacity
          onPress={handleOpenInfoModal}
          style={styles.editInfoBtn}
        >
          <Text style={styles.editInfoBtnText}>✏ Editar información</Text>
        </TouchableOpacity>

        {/* ── THEME TOGGLE ── */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeToggleBtn, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.themeToggleBtnText, { color: colors.text }]}>
            {isDark ? "☀️ Modo claro" : "🌙 Modo oscuro"}
          </Text>
        </TouchableOpacity>

        {/* ── SIGN OUT ── */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── MODAL: EDITAR INFORMACIÓN ── */}
      <Modal visible={infoModalVisible} animationType="slide">
        <View
          style={[styles.modalFullContainer, { backgroundColor: colors.bg }]}
        >
          <View style={styles.modalFullHeader}>
            <Text style={styles.modalFullTitle}>Editar información</Text>
            <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalFullClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalFullScroll}>
            <Text style={styles.sectionLabel}>DATOS PERSONALES</Text>
            <View style={{ height: 12 }} />

            {Object.keys(pickerData).map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => setCurrentPicker(key)}
                style={styles.fieldCard}
              >
                <Text style={styles.fieldLabel}>{pickerData[key].title}</Text>
                <Text style={styles.fieldValue}>{renderValue(key)}</Text>
              </TouchableOpacity>
            ))}

            <TextInput
              placeholder="Peso (kg)"
              placeholderTextColor={colors.textDisabled}
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
              style={styles.input}
            />
            <TextInput
              placeholder="Altura (cm)"
              placeholderTextColor={colors.textDisabled}
              keyboardType="numeric"
              value={altura}
              onChangeText={setAltura}
              style={styles.input}
            />
            <TextInput
              placeholder="Lesiones (opcional)"
              placeholderTextColor={colors.textDisabled}
              value={lesiones}
              onChangeText={setLesiones}
              multiline
              style={[styles.input, { minHeight: 72 }]}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar cambios</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ── MODAL: PR EXERCISE PICKER ── */}
      <Modal visible={prPickerVisible} transparent animationType="slide">
        <Pressable
          onPress={() => setPrPickerVisible(false)}
          style={styles.modalBackdrop}
        >
          <Pressable>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Seleccionar ejercicios</Text>
              <FlatList
                data={prExerciseNames}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = selectedPRExercises.includes(item);
                  return (
                    <TouchableOpacity
                      onPress={() => togglePRExercise(item)}
                      style={[
                        styles.modalOption,
                        isSelected && styles.modalOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          isSelected && styles.modalOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected && (
                        <Text style={styles.modalOptionCheck}>
                          ✓ {prMap[item]?.weight} kg × {prMap[item]?.reps} reps
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  savePRExercises(selectedPRExercises);
                  setPrPickerVisible(false);
                }}
              >
                <Text style={styles.modalDone}>Listo</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── MODAL: FIELD PICKER ── */}
      <Modal visible={!!currentPicker} transparent animationType="slide">
        <Pressable
          onPress={() => setCurrentPicker(null)}
          style={styles.modalBackdrop}
        >
          <Pressable>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>
                {currentPicker && pickerData[currentPicker].title}
              </Text>
              <FlatList
                data={currentPicker ? pickerData[currentPicker].options : []}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = currentPicker
                    ? pickerData[currentPicker].multi
                      ? (multiValues[currentPicker] || []).includes(item)
                      : values[currentPicker] === item
                    : false;
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        currentPicker && handleSelect(currentPicker, item)
                      }
                      style={[
                        styles.modalOption,
                        isSelected && styles.modalOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          isSelected && styles.modalOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity onPress={() => setCurrentPicker(null)}>
                <Text style={styles.modalDone}>Listo</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 24,
      gap: 14,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accentBg,
      borderWidth: 2,
      borderColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: colors.accent, fontSize: 20, fontWeight: "700" },
    headerName: { color: colors.text, fontSize: 20, fontWeight: "700" },
    headerUsername: { color: colors.textMuted, fontSize: 13, marginTop: 2 },

    // Success banner
    successBanner: {
      backgroundColor: colors.accentBg,
      padding: 14,
      borderRadius: 10,
      marginBottom: 16,
    },
    successText: {
      color: colors.accent,
      textAlign: "center",
      fontWeight: "600",
    },

    // Stats
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      alignItems: "center",
    },
    statValue: { color: colors.accent, fontSize: 26, fontWeight: "800" },
    statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },

    // PR section
    prSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionLabel: { color: colors.textMuted, fontSize: 12, letterSpacing: 1 },
    editBtn: {
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    editBtnText: { color: colors.accent, fontSize: 13 },
    prEmptyCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      alignItems: "center",
      marginBottom: 24,
    },
    prEmptyText: {
      color: colors.textDisabled,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    prList: { gap: 8, marginBottom: 24 },
    prCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    prName: { color: colors.text, fontSize: 14, flex: 1, marginRight: 12 },
    prBadge: {
      backgroundColor: colors.accentBg,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.accent,
      alignItems: "center",
    },
    prWeight: { color: colors.accent, fontSize: 13, fontWeight: "700" },
    prReps: { color: colors.accent, fontSize: 11, opacity: 0.8 },

    // Editar información button
    editInfoBtn: {
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editInfoBtnText: { color: colors.text, fontWeight: "600", fontSize: 15 },

    // Theme toggle button
    themeToggleBtn: {
      padding: 18,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeToggleBtnText: { fontWeight: "600", fontSize: 15 },

    // Sign out
    signOutBtn: {
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 40,
    },
    signOutText: { color: colors.error, fontWeight: "600", fontSize: 16 },

    // History
    historyRow: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyDate: { color: colors.text, fontSize: 14, fontWeight: "600" },
    historyDetail: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

    // Field cards (inside info modal)
    fieldCard: {
      backgroundColor: colors.inputBg,
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fieldLabel: { color: colors.text, fontSize: 14 },
    fieldValue: { color: colors.accent, fontSize: 12, marginTop: 4 },

    // Inputs
    input: {
      backgroundColor: colors.inputBg,
      padding: 16,
      borderRadius: 12,
      color: colors.text,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 14,
    },

    errorText: {
      color: colors.error,
      textAlign: "center",
      marginBottom: 12,
      fontSize: 13,
    },

    // Save button
    saveBtn: {
      backgroundColor: colors.accentBg,
      padding: 18,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 6,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    saveBtnText: { color: colors.accent, fontWeight: "700", fontSize: 16 },

    // Full-screen info modal
    modalFullContainer: { flex: 1 },
    modalFullHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalFullTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
    modalFullClose: { color: colors.textMuted, fontSize: 20, padding: 4 },
    modalFullScroll: { padding: 20 },

    // Bottom-sheet modals
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      maxHeight: 420,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 10,
    },
    modalOption: {
      padding: 14,
      borderRadius: 10,
      backgroundColor: "transparent",
    },
    modalOptionSelected: { backgroundColor: `${colors.accent}22` },
    modalOptionText: { color: colors.text },
    modalOptionTextSelected: { color: colors.accent },
    modalOptionCheck: {
      color: colors.accent,
      fontSize: 12,
      marginTop: 2,
    },
    modalDone: {
      color: colors.accent,
      textAlign: "right",
      marginTop: 10,
      fontWeight: "600",
    },
  });
