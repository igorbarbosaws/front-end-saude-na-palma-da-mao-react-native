// Resultado da pré-triagem: orientação inicial (sem diagnóstico) e caminho para clínicas ou agendamento.
// Recebe `resultado` ({ urgente, orientacao, especialidades:[{ id?, nome, motivo }] }) e `idPreTriagem` pela navegação.
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alerta, BarraTopo, Botao, Tela, Texto, Titulo } from "../../components/ui.js";
import { Cartao } from "../../components/comum.js";
import { MENSAGEM_URGENCIA } from "../../core/triagem.js";
import { triagemService } from "../../services/triagemService.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function PreTriagemResultado({ navigation, route }) {
  const c = useTema();
  const e = useEscala();
  const { resultado, idPreTriagem } = route.params ?? {};
  const principal = resultado?.especialidades?.[0];
  const [idEspecialidade, setIdEspecialidade] = useState(principal?.id ?? null);

  // Quem chega aqui sem ter conversado com a TrIA volta para o início da triagem.
  useEffect(() => {
    if (!resultado || !principal) navigation.replace("PreTriagem");
  }, [resultado, principal, navigation]);

  // Liga a especialidade indicada à cadastrada na API, para pré-selecionar no agendamento.
  useEffect(() => {
    if (principal && !idEspecialidade) triagemService.acharEspecialidade(principal).then(setIdEspecialidade);
  }, [principal, idEspecialidade]);

  if (!resultado || !principal) return null;

  return (
    <Tela>
      <BarraTopo titulo="Resultado da triagem" onVoltar={() => navigation.goBack()} />
      <Titulo>Seu resultado está pronto</Titulo>
      <Texto suave style={{ marginBottom: 16 }}>Veja abaixo a orientação da TrIA para o seu atendimento.</Texto>

      <View accessibilityRole="alert" style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Ionicons name="checkmark-circle" size={28} color={c.sucesso} />
        <Text style={{ color: c.sucesso, fontSize: fonte.corpo * e, fontWeight: "700", marginLeft: 8 }}>Análise concluída!</Text>
      </View>
      <Texto style={{ marginBottom: 16 }}>Com base nas informações que você contou, podemos ajudar você a encontrar um atendimento adequado.</Texto>

      <Cartao>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Ionicons name="sparkles-outline" size={22} color={c.primaria} />
          <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e, fontWeight: "700", marginLeft: 8 }}>ORIENTAÇÃO DA IA</Text>
        </View>
        {resultado.especialidades.map((esp) => (
          <View key={esp.nome} style={{ marginBottom: 8 }}>
            <Text style={{ color: c.texto, fontSize: fonte.subtitulo * e, fontWeight: "700" }}>{esp.nome}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{esp.motivo || "Esse atendimento pode ajudar a avaliar os sintomas que você informou."}</Text>
          </View>
        ))}
        {!!resultado.orientacao && <Texto suave style={{ marginTop: 4 }}>{resultado.orientacao}</Texto>}
      </Cartao>

      {resultado.urgente && <Alerta>{MENSAGEM_URGENCIA}</Alerta>}

      <Botao titulo="Ver clínicas" onPress={() => navigation.navigate("Clinicas")} />
      <Botao titulo="Agendar atendimento" variante="contorno" style={{ marginTop: 12 }}
        onPress={() => navigation.navigate("Agendamento", { idEspecialidade: idEspecialidade ?? undefined, idPreTriagem: idPreTriagem ?? undefined })} />
      <Botao titulo="Refazer triagem" variante="contorno" style={{ marginTop: 12 }} onPress={() => navigation.replace("PreTriagem")} />

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
        <Ionicons name="information-circle-outline" size={18} color={c.textoSuave} />
        <Text style={{ flex: 1, color: c.textoSuave, fontSize: fonte.pequena * e, marginLeft: 6 }}>Esta orientação não substitui uma avaliação de um profissional de saúde.</Text>
      </View>
    </Tela>
  );
}
