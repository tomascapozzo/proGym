import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Completá todos los campos.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
    }
    // navigation is handled by the root layout redirect
  };

  const inputStyle = {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    marginBottom: 16,
  };

  const labelStyle = {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 6,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text
            style={{
              color: colors.accent,
              fontSize: 34,
              fontWeight: "800",
              letterSpacing: -0.5,
              marginBottom: 6,
            }}
          >
            LEAD Rugby
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            Tu entrenador personal con IA
          </Text>
        </View>

        {/* EMAIL */}
        <Text style={labelStyle}>EMAIL</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          placeholderTextColor={colors.textDisabled}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={inputStyle}
        />

        {/* PASSWORD */}
        <Text style={labelStyle}>CONTRASEÑA</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textDisabled}
          secureTextEntry
          style={[inputStyle, { marginBottom: 24 }]}
        />

        {error ? (
          <Text style={{ color: colors.error, textAlign: "center", marginBottom: 16, fontSize: 13 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: colors.accent,
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 20,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text style={{ color: colors.accentText, fontWeight: "600", fontSize: 16 }}>
              Iniciar sesión
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <Text style={{ color: colors.textMuted, textAlign: "center", fontSize: 14 }}>
            ¿No tenés cuenta?{" "}
            <Text style={{ color: colors.accent, fontWeight: "600" }}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
