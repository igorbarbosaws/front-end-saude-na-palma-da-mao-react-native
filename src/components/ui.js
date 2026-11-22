// Peças visuais compartilhadas. Estilos de uma tela ficam na própria tela; só o que várias telas usam vem para cá.
import { useEffect, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ALVO_MINIMO, espaco, fonte, raio, useEscala, useTema } from "../theme.js";
import { ouvir } from "../core/events.js";

// Tela com área segura, rolagem e teclado que não cobre os campos.
export function Tela({ children, rolar = true, style, contentStyle }) {
  const c = useTema();
  const conteudo = rolar ? (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ padding: espaco.m, flexGrow: 1 }, contentStyle]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: espaco.m }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: c.fundo }, style]} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {conteudo}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Titulo({ children, style }) {
  const c = useTema();
  const e = useEscala();
  return <Text accessibilityRole="header" style={[{ fontSize: fonte.titulo * e, fontWeight: "700", color: c.texto, marginBottom: espaco.p }, style]}>{children}</Text>;
}

export function Texto({ children, suave, style, ...resto }) {
  const c = useTema();
  const e = useEscala();
  return <Text style={[{ fontSize: fonte.corpo * e, color: suave ? c.textoSuave : c.texto, lineHeight: 26 * e }, style]} {...resto}>{children}</Text>;
}

// variante: "cheio" (padrão) | "contorno" | "perigo"
export function Botao({ titulo, onPress, variante = "cheio", ocupado = false, desabilitado = false, style }) {
  const c = useTema();
  const e = useEscala();
  const off = desabilitado || ocupado;
  const cores = {
    cheio: { bg: off ? c.desabilitado : c.primaria, fg: off ? c.desabilitadoTexto : c.sobrePrimaria, borda: "transparent" },
    contorno: { bg: "transparent", fg: off ? c.desabilitadoTexto : c.primariaEscura, borda: off ? c.desabilitado : c.primaria },
    perigo: { bg: off ? c.desabilitado : c.erro, fg: off ? c.desabilitadoTexto : "#fff", borda: "transparent" },
  }[variante];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: ocupado }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: ALVO_MINIMO + 4, borderRadius: raio, alignItems: "center", justifyContent: "center", flexDirection: "row",
          backgroundColor: cores.bg, borderWidth: 1.5, borderColor: cores.borda, paddingHorizontal: espaco.m, opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {ocupado && <ActivityIndicator color={cores.fg} style={{ marginRight: 8 }} />}
      <Text style={{ color: cores.fg, fontSize: fonte.corpo * e, fontWeight: "700" }}>{titulo}</Text>
    </Pressable>
  );
}

export function Campo({ rotulo, erro, style, inputStyle, ...resto }) {
  const c = useTema();
  const e = useEscala();
  const [foco, setFoco] = useState(false);
  return (
    <View style={[{ marginBottom: espaco.m }, style]}>
      <Text style={{ fontSize: (fonte.pequena + 1) * e, fontWeight: "600", color: c.texto, marginBottom: 6 }}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={c.textoSuave}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        style={[
          {
            minHeight: ALVO_MINIMO + 4, borderRadius: raio, borderWidth: 1.5, paddingHorizontal: espaco.m, fontSize: fonte.corpo * e,
            color: c.texto, backgroundColor: c.superficie, borderColor: erro ? c.erro : foco ? c.primaria : c.borda,
          },
          inputStyle,
        ]}
        {...resto}
      />
      {!!erro && <Text style={{ color: c.erro, fontSize: fonte.pequena, marginTop: 4 }}>{erro}</Text>}
    </View>
  );
}

export function Alerta({ tipo = "erro", children, style }) {
  const c = useTema();
  const paleta = { erro: [c.erroFundo, c.erro], aviso: [c.avisoFundo, c.aviso], sucesso: [c.sucessoFundo, c.sucesso] }[tipo];
  return (
    <View accessibilityRole="alert" style={[{ backgroundColor: paleta[0], borderRadius: raio, padding: espaco.m, marginBottom: espaco.m }, style]}>
      <Text style={{ color: paleta[1], fontSize: fonte.pequena + 1, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}

// "Acordando o servidor": aparece quando a API demora mais que 4 s (o Render gratuito dorme).
export function AvisoLento() {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const a = ouvir("api:lenta", () => setVisivel(true));
    const b = ouvir("api:ociosa", () => setVisivel(false));
    return () => { a(); b(); };
  }, []);
  return visivel ? <Alerta tipo="aviso">Acordando o servidor. A primeira chamada pode levar até 1 minuto, aguarde...</Alerta> : null;
}

export function Carregando({ texto = "Carregando..." }) {
  const c = useTema();
  return (
    <View style={{ padding: espaco.g, alignItems: "center" }}>
      <ActivityIndicator size="large" color={c.primaria} />
      <Text style={{ color: c.textoSuave, marginTop: espaco.p, fontSize: fonte.corpo }}>{texto}</Text>
    </View>
  );
}

// Barra superior das telas internas: voltar, título e (opcional) ação à direita.
export function BarraTopo({ titulo, onVoltar, direita }) {
  const c = useTema();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: espaco.m }}>
      {onVoltar && (
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onVoltar}
          style={{ width: ALVO_MINIMO, height: ALVO_MINIMO, borderRadius: ALVO_MINIMO / 2, backgroundColor: c.primariaClara, alignItems: "center", justifyContent: "center", marginRight: espaco.m }}>
          <Ionicons name="chevron-back" size={24} color={c.primariaEscura} />
        </Pressable>
      )}
      <Text accessibilityRole="header" style={{ flex: 1, fontSize: fonte.subtitulo, fontWeight: "700", color: c.texto }}>{titulo}</Text>
      {direita}
    </View>
  );
}

export const estilos = StyleSheet.create({ centro: { alignItems: "center" } });
