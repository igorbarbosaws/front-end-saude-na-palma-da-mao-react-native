// Peças compartilhadas das telas do administrador (lotes 5 e 6 usam este mesmo arquivo; o conteúdo é idêntico nos dois).
import { Pressable, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarraTopo } from "./ui.js";
import { ALVO_MINIMO, fonte, useEscala, useTema } from "../theme.js";

// Barra superior das listas: voltar + título + botão "Adicionar" (opcional).
export function CabecalhoLista({ titulo, onVoltar, onAdicionar, rotuloAdicionar = "Adicionar" }) {
  const c = useTema();
  const e = useEscala();
  const botao = onAdicionar ? (
    <Pressable accessibilityRole="button" accessibilityLabel={rotuloAdicionar} onPress={onAdicionar}
      style={{ minHeight: ALVO_MINIMO, paddingHorizontal: 14, borderRadius: 24, backgroundColor: c.primaria, flexDirection: "row", alignItems: "center" }}>
      <Ionicons name="add" size={20} color={c.sobrePrimaria} />
      <Text style={{ color: c.sobrePrimaria, fontWeight: "700", fontSize: fonte.pequena * e + 1 }}>{rotuloAdicionar}</Text>
    </Pressable>
  ) : null;
  return <BarraTopo titulo={titulo} onVoltar={onVoltar} direita={botao} />;
}

// Linha "Status ativo" com chave liga/desliga.
export function LinhaStatus({ rotulo = "Status ativo", valor, aoMudar }) {
  const c = useTema();
  const e = useEscala();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: ALVO_MINIMO, marginBottom: 16 }}>
      <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "600" }}>{rotulo}</Text>
      <Switch value={valor} onValueChange={aoMudar} trackColor={{ true: c.primaria }} accessibilityLabel={rotulo} />
    </View>
  );
}
