// Campo de busca com ícone de lupa. Chama aoDigitar(texto) a cada letra. (Criado no lote 1; todos os lotes podem usar.)
import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ALVO_MINIMO, espaco, fonte, raio, useEscala, useTema } from "../theme.js";

export default function Busca({ placeholder, valor, aoDigitar, style }) {
  const c = useTema();
  const e = useEscala();
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: c.borda, borderRadius: raio, backgroundColor: c.superficie, paddingHorizontal: espaco.m, marginBottom: espaco.m, minHeight: ALVO_MINIMO + 4 }, style]}>
      <Ionicons name="search-outline" size={20} color={c.textoSuave} />
      <TextInput
        accessibilityLabel={String(placeholder).replace(/\.+$/, "")}
        value={valor}
        onChangeText={aoDigitar}
        placeholder={placeholder}
        placeholderTextColor={c.textoSuave}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={{ flex: 1, marginLeft: espaco.p, fontSize: fonte.corpo * e, color: c.texto, minHeight: ALVO_MINIMO }}
      />
    </View>
  );
}
