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

export default function SignupScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Completá todos los campos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (err) {
      setError(err);
    }
    // navigation handled by root layout
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
            Creá tu cuenta y empezá hoy
          </Text>
        </View>

        {/* NOMBRE */}
        <Text style={labelStyle}>NOMBRE</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textDisabled}
          autoCapitalize="words"
          style={inputStyle}
        />

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
          placeholder="Mínimo 6 caracteres"
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
          onPress={handleSignup}
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
              Crear cuenta
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.textMuted, textAlign: "center", fontSize: 14 }}>
            ¿Ya tenés cuenta?{" "}
            <Text style={{ color: colors.accent, fontWeight: "600" }}>Iniciá sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
