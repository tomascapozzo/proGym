import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import CustomModal from "@/components/ui/custom/customModal";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const pickerData: Record<string, { title: string; options: string[] }> = {
  posicion: {
    title: "Posicion",
    options: [
      "Primera linea",
      "Segunda linea",
      "Ala",
      "Octavo",
      "Medio-scrum",
      "Apertura",
      "Centro",
      "Wing",
      "Fullback",
    ],
  },
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
};

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Editable fields mirrored from profile
  const [posicion, setPosicion] = useState(profile?.position ?? "");
  const [edad, setEdad] = useState(profile?.edad ?? "");
  const [peso, setPeso] = useState(profile?.peso ?? "");
  const [altura, setAltura] = useState(profile?.altura ?? "");
  const [gimnasio, setGimnasio] = useState<"club" | "otro" | "">(
    (profile?.gimnasio as "club" | "otro" | "") ?? "",
  );
  const [lesionesActuales, setLesionesActuales] = useState(!!profile?.lesiones);
  const [lesionesDesc, setLesionesDesc] = useState(profile?.lesiones ?? "");
  const [lesionesPrevias, setLesionesPrevias] = useState<
    { lesion: string; anio: string }[]
  >(() => (profile?.lesiones_previas as { lesion: string; anio: string }[]) ?? []);

  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // ── Modals ──
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [prPickerVisible, setPrPickerVisible] = useState(false);

  // ── 1RM section ──
  const [oneRmMap, setOneRmMap] = useState<Record<string, number>>(
    () => (profile?.one_rm as Record<string, number>) ?? {},
  );
  const [oneRmModalVisible, setOneRmModalVisible] = useState(false);
  const [oneRmEditing, setOneRmEditing] = useState<Record<string, string>>({});
  const [oneRmPickerVisible, setOneRmPickerVisible] = useState(false);
  const [oneRmLibrary, setOneRmLibrary] = useState<{ id: string; name: string }[]>([]);
  const [oneRmLibraryLoading, setOneRmLibraryLoading] = useState(false);

  const openOneRmModal = () => {
    const editable: Record<string, string> = {};
    Object.entries(oneRmMap).forEach(([k, v]) => { editable[k] = String(v); });
    setOneRmEditing(editable);
    setOneRmModalVisible(true);
  };

  const saveOneRm = async () => {
    if (!user) return;
    const parsed: Record<string, number> = {};
    Object.entries(oneRmEditing).forEach(([k, v]) => {
      const n = parseFloat(v);
      if (k.trim() && !isNaN(n) && n > 0) parsed[k] = n;
    });
    await supabase.from("profiles").update({ one_rm: parsed }).eq("id", user.id);
    setOneRmMap(parsed);
    await refreshProfile();
    setOneRmModalVisible(false);
  };

  const openOneRmExPicker = async () => {
    if (oneRmLibrary.length === 0) {
      setOneRmLibraryLoading(true);
      const { data } = await supabase
        .from("exercises")
        .select("id, name")
        .order("name");
      setOneRmLibrary(data ?? []);
      setOneRmLibraryLoading(false);
    }
    setOneRmPickerVisible(true);
  };

  const addOneRmExercise = (name: string) => {
    if (!oneRmEditing[name]) {
      setOneRmEditing((prev) => ({ ...prev, [name]: "" }));
    }
    setOneRmPickerVisible(false);
  };

  const removeOneRmEntry = (name: string) => {
    setOneRmEditing((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // ── Settings drawer ──
  const [settingsVisible, setSettingsVisible] = useState(false);
  const drawerAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openSettings = () => {
    setSettingsVisible(true);
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSettings = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: DRAWER_WIDTH,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSettingsVisible(false);
      callback?.();
    });
  };

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

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();

      const [monthRes, totalRes, logsRes] = await Promise.all([
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

      setStatsLoading(false);
    };
    fetchStats();
  }, [user]);

  const handleSelect = (key: string, option: string) => {
    if (key === "posicion") setPosicion(option);
    else if (key === "edad") setEdad(option);
    setCurrentPicker(null);
  };

  const renderValue = (key: string) => {
    if (key === "posicion") return posicion || "Sin selección";
    if (key === "edad") return edad || "Sin selección";
    return "Sin selección";
  };

  const handleSave = async () => {
    if (!user) return;
    setError("");
    setSaving(true);

    const { error: err } = await supabase
      .from("profiles")
      .update({
        position: posicion || null,
        edad: edad || null,
        peso: peso.trim() || null,
        altura: altura.trim() || null,
        gimnasio: gimnasio || null,
        lesiones: lesionesActuales ? (lesionesDesc.trim() || null) : null,
        lesiones_previas: lesionesPrevias.filter((l) => l.lesion.trim()),
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
    setPosicion(profile?.position ?? "");
    setEdad(profile?.edad ?? "");
    setPeso(profile?.peso ?? "");
    setAltura(profile?.altura ?? "");
    setGimnasio((profile?.gimnasio as "club" | "otro" | "") ?? "");
    setLesionesActuales(!!profile?.lesiones);
    setLesionesDesc(profile?.lesiones ?? "");
    setLesionesPrevias(
      (profile?.lesiones_previas as { lesion: string; anio: string }[]) ?? [],
    );
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

  const handleSignOut = () => setSignOutVisible(true);

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

  const styles = getStyles(colors, insets.top);

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
          <TouchableOpacity onPress={openSettings} style={styles.settingsBtn}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
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

        {/* ── 1RM SECTION ── */}
        <View style={[styles.prSectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionLabel}>1RM</Text>
          <TouchableOpacity onPress={openOneRmModal} style={styles.editBtn}>
            <Text style={styles.editBtnText}>
              {Object.keys(oneRmMap).length > 0 ? "Editar" : "+ Agregar"}
            </Text>
          </TouchableOpacity>
        </View>

        {Object.keys(oneRmMap).length === 0 ? (
          <TouchableOpacity onPress={openOneRmModal} style={[styles.prEmptyCard, { marginBottom: 24 }]}>
            <Text style={styles.prEmptyText}>
              Registra tus repeticiones máximas para que la app calcule el peso automáticamente en tus rutinas.
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.prList, { marginBottom: 24 }]}>
            {Object.entries(oneRmMap).map(([name, weight]) => (
              <View key={name} style={styles.prCard}>
                <Text style={styles.prName} numberOfLines={1}>{name}</Text>
                <View style={styles.prBadge}>
                  <Text style={styles.prWeight}>{weight} kg</Text>
                  <Text style={styles.prReps}>1RM</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── NAV CARDS ── */}
        <Text style={[styles.sectionLabel, { marginTop: 8, marginBottom: 12 }]}>
          ACTIVIDAD
        </Text>
        {[
          { label: "Historial", subtitle: "Tus entrenamientos registrados", route: "/history" },
          { label: "Progreso", subtitle: "Tu evolución a lo largo del tiempo", route: "/progress" },
          { label: "Social", subtitle: "Ranking y amigos", route: "/social" },
        ].map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.75}
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
                {item.label}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {item.subtitle}
              </Text>
            </View>
            <Text style={{ color: colors.textDisabled, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── MODAL: EDITAR INFORMACIÓN ── */}
      <Modal visible={infoModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View
          style={[styles.modalFullContainer, { backgroundColor: colors.bg }]}
        >
          <View style={styles.modalFullHeader}>
            <Text style={styles.modalFullTitle}>Editar información</Text>
            <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalFullClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalFullScroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionLabel}>DATOS PERSONALES</Text>
            <View style={{ height: 12 }} />

            {/* Posicion picker */}
            <TouchableOpacity
              onPress={() => setCurrentPicker("posicion")}
              style={styles.fieldCard}
            >
              <Text style={styles.fieldLabel}>Posicion</Text>
              <Text style={styles.fieldValue}>{renderValue("posicion")}</Text>
            </TouchableOpacity>

            {/* Edad picker */}
            <TouchableOpacity
              onPress={() => setCurrentPicker("edad")}
              style={styles.fieldCard}
            >
              <Text style={styles.fieldLabel}>Edad</Text>
              <Text style={styles.fieldValue}>{renderValue("edad")}</Text>
            </TouchableOpacity>

            {/* Peso + Altura side by side */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <TextInput
                placeholder="Peso (kg)"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
                value={peso}
                onChangeText={setPeso}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TextInput
                placeholder="Altura (cm)"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
                value={altura}
                onChangeText={setAltura}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
            </View>

            {/* Gimnasio */}
            <View style={{ marginBottom: 10 }}>
              <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                Gimnasio
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["club", "otro"] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setGimnasio(opt)}
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        gimnasio === opt ? colors.accent : colors.border,
                      backgroundColor:
                        gimnasio === opt ? colors.accentBg : colors.inputBg,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          gimnasio === opt ? colors.accent : colors.textMuted,
                        fontWeight: gimnasio === opt ? "700" : "400",
                        fontSize: 14,
                      }}
                    >
                      {opt === "club" ? "Club" : "Otro"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Lesiones actuales */}
            <View style={{ marginBottom: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={styles.fieldLabel}>Lesiones actuales</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {([false, true] as const).map((opt) => (
                    <TouchableOpacity
                      key={String(opt)}
                      onPress={() => setLesionesActuales(opt)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          lesionesActuales === opt
                            ? colors.accent
                            : colors.border,
                        backgroundColor:
                          lesionesActuales === opt
                            ? colors.accentBg
                            : colors.inputBg,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            lesionesActuales === opt
                              ? colors.accent
                              : colors.textMuted,
                          fontWeight:
                            lesionesActuales === opt ? "700" : "400",
                          fontSize: 13,
                        }}
                      >
                        {opt ? "Sí" : "No"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {lesionesActuales && (
                <TextInput
                  placeholder="Describí la lesión..."
                  placeholderTextColor={colors.textDisabled}
                  value={lesionesDesc}
                  onChangeText={setLesionesDesc}
                  multiline
                  style={[styles.input, { minHeight: 72, marginBottom: 0 }]}
                />
              )}
            </View>

            {/* Lesiones previas */}
            <View style={{ marginBottom: 10 }}>
              <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                Lesiones previas
              </Text>
              {lesionesPrevias.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    placeholder="Lesión"
                    placeholderTextColor={colors.textDisabled}
                    value={item.lesion}
                    onChangeText={(v) =>
                      setLesionesPrevias((prev) =>
                        prev.map((l, i) =>
                          i === idx ? { ...l, lesion: v } : l,
                        ),
                      )
                    }
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  />
                  <TextInput
                    placeholder="Año"
                    placeholderTextColor={colors.textDisabled}
                    value={item.anio}
                    onChangeText={(v) =>
                      setLesionesPrevias((prev) =>
                        prev.map((l, i) =>
                          i === idx ? { ...l, anio: v } : l,
                        ),
                      )
                    }
                    keyboardType="numeric"
                    style={[styles.input, { width: 72, marginBottom: 0 }]}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setLesionesPrevias((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <Text
                      style={{
                        color: colors.error,
                        fontSize: 20,
                        paddingHorizontal: 4,
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() =>
                  setLesionesPrevias((prev) => [
                    ...prev,
                    { lesion: "", anio: "" },
                  ])
                }
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.accent, fontWeight: "600" }}>
                  + Agregar lesión
                </Text>
              </TouchableOpacity>
            </View>

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
      <Modal visible={prPickerVisible} transparent animationType="slide" presentationStyle="overFullScreen">
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

      {/* ── MODAL: 1RM EDITOR ── */}
      <Modal visible={oneRmModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalFullContainer, { backgroundColor: colors.bg }]}>
          <View style={styles.modalFullHeader}>
            <Text style={styles.modalFullTitle}>Mis 1RM</Text>
            <TouchableOpacity onPress={() => setOneRmModalVisible(false)}>
              <Text style={styles.modalFullClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalFullScroll} keyboardShouldPersistTaps="handled">
            <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>
              REPETICIÓN MÁXIMA POR EJERCICIO
            </Text>
            {Object.entries(oneRmEditing).map(([name, val]) => (
              <View
                key={name}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 12,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14, flex: 1 }} numberOfLines={1}>
                  {name}
                </Text>
                <TextInput
                  value={val}
                  onChangeText={(v) => setOneRmEditing((prev) => ({ ...prev, [name]: v }))}
                  placeholder="kg"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderRadius: 8,
                    padding: 8,
                    color: colors.text,
                    fontSize: 14,
                    width: 72,
                    textAlign: "center",
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>kg</Text>
                <TouchableOpacity onPress={() => removeOneRmEntry(name)}>
                  <Text style={{ color: colors.error, fontSize: 18, paddingLeft: 4 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={openOneRmExPicker}
              disabled={oneRmLibraryLoading}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: "solid",
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                {oneRmLibraryLoading ? "Cargando..." : "+ Agregar ejercicio"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={saveOneRm}
              style={[styles.saveBtn]}
            >
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ── MODAL: EJERCICIO PICKER (1RM) ── */}
      <Modal visible={oneRmPickerVisible} transparent animationType="slide" presentationStyle="overFullScreen">
        <Pressable
          onPress={() => setOneRmPickerVisible(false)}
          style={styles.modalBackdrop}
        >
          <Pressable>
            <View style={[styles.modalSheet, { maxHeight: 500 }]}>
              <Text style={styles.modalTitle}>Seleccionar ejercicio</Text>
              <FlatList
                data={oneRmLibrary.filter((ex) => !oneRmEditing[ex.name])}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => addOneRmExercise(item.name)}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={[styles.prEmptyText, { textAlign: "center", paddingVertical: 20 }]}>
                    Todos los ejercicios ya están en la lista.
                  </Text>
                }
              />
              <TouchableOpacity onPress={() => setOneRmPickerVisible(false)}>
                <Text style={styles.modalDone}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── DRAWER: AJUSTES ── */}
      {settingsVisible && (
        <>
          {/* Backdrop */}
          <Animated.View
            style={[styles.drawerBackdrop, { opacity: backdropAnim }]}
          >
            <Pressable style={{ flex: 1 }} onPress={() => closeSettings()} />
          </Animated.View>

          {/* Drawer panel */}
          <Animated.View
            style={[
              styles.drawer,
              {
                backgroundColor: colors.bg,
                transform: [{ translateX: drawerAnim }],
              },
            ]}
          >
            {/* Drawer header */}
            <View
              style={[
                styles.drawerHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.drawerTitle, { color: colors.text }]}>
                Ajustes
              </Text>
              <TouchableOpacity onPress={() => closeSettings()}>
                <Text style={[styles.drawerClose, { color: colors.textMuted }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.drawerScroll}>
              <Text style={styles.sectionLabel}>CUENTA</Text>
              <View style={{ height: 12 }} />

              <TouchableOpacity
                onPress={() => closeSettings(handleOpenInfoModal)}
                style={[
                  styles.settingsRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.settingsRowLabel, { color: colors.text }]}>
                  Editar información
                </Text>
                <Text
                  style={[
                    styles.settingsRowChevron,
                    { color: colors.textMuted },
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>

              <View style={{ height: 24 }} />
              <Text style={styles.sectionLabel}>APARIENCIA</Text>
              <View style={{ height: 12 }} />

              <TouchableOpacity
                onPress={toggleTheme}
                style={[
                  styles.settingsRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.settingsRowLabel, { color: colors.text }]}>
                  {isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                </Text>
                <Text
                  style={[
                    styles.settingsRowChevron,
                    { color: colors.textMuted },
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>

              <View style={{ height: 24 }} />
              <Text style={styles.sectionLabel}>SESIÓN</Text>
              <View style={{ height: 12 }} />

              <TouchableOpacity
                onPress={() => closeSettings(handleSignOut)}
                style={[
                  styles.settingsRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.settingsRowLabel, { color: colors.error }]}
                >
                  Cerrar sesión
                </Text>
                <Text
                  style={[
                    styles.settingsRowChevron,
                    { color: colors.textMuted },
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </>
      )}

      <CustomModal
        visible={signOutVisible}
        title="Cerrar sesión"
        message="¿Seguro que querés cerrar sesión?"
        confirmLabel="Salir"
        confirmColor={colors.error}
        confirmTextColor="white"
        cancelLabel="Cancelar"
        onConfirm={() => { setSignOutVisible(false); signOut(); }}
        onCancel={() => setSignOutVisible(false)}
      />

      {/* ── MODAL: FIELD PICKER ── */}
      <Modal visible={!!currentPicker} transparent animationType="slide" presentationStyle="overFullScreen">
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
                    ? renderValue(currentPicker) === item
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

const getStyles = (colors: any, insetsTop: number = 0) =>
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

    // Settings button in header
    settingsBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    hamburgerLine: {
      width: 16,
      height: 2,
      borderRadius: 2,
      backgroundColor: colors.text,
    },

    // Drawer overlay
    drawerBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 10,
    },
    drawer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      zIndex: 11,
      shadowColor: "#000",
      shadowOffset: { width: -3, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
    },
    drawerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: insetsTop + 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
    },
    drawerTitle: { fontSize: 18, fontWeight: "700" },
    drawerClose: { fontSize: 20, padding: 4 },
    drawerScroll: { padding: 20 },

    // Settings rows
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 8,
      gap: 12,
    },
    settingsRowIcon: { fontSize: 18 },
    settingsRowLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
    settingsRowChevron: { fontSize: 20 },

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
      paddingTop: insetsTop + 16,
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
