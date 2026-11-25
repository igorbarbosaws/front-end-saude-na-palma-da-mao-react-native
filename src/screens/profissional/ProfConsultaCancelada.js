// Consulta cancelada (profissional): confirmação do cancelamento, com a justificativa registrada.
// Parâmetro: { id } (id do agendamento).
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Botao, Tela, Texto, Titulo } from "../../components/ui.js";
import { Cartao, Estado } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { carregarAgenda } from "../../services/agendaProfissionalService.js";
import { dataBR } from "./_formatos.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function ProfConsultaCancelada({ navigation, route }) {
  const c = useTema();
  const e = useEscala();
  const id = Number(route.params?.id);
  const { usuario } = useSessao();
  const { dados, carregando, erro, recarregar } = useCarregar(() => carregarAgenda(usuario), [usuario?.idProfissional]);
  const a = dados?.meus.find((x) => x.id === id);

  return (
    <Tela>
      <View style={{ alignItems: "center", marginTop: 24 }}>
        <Ionicons name="close-circle" size={80} color={c.erro} />
        <Titulo style={{ marginTop: 8, textAlign: "center" }}>Consulta cancelada</Titulo>
        <Texto suave style={{ textAlign: "center", marginBottom: 16 }}>O paciente será notificado sobre o cancelamento.</Texto>
      </View>

      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar}>
        {a && (
          <Cartao>
            <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{a.paciente}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{a.especialidade}</Text>
            <Text style={{ color: c.texto, fontSize: fonte.corpo * e, marginTop: 6 }}>{dataBR(a.data)} · {a.hora}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1, marginTop: 10 }}>
              <Text style={{ fontWeight: "700" }}>Justificativa: </Text>{a.justificativa || "Não informada"}
            </Text>
          </Cartao>
        )}
      </Estado>

      <Botao titulo="Voltar para a agenda" onPress={() => navigation.navigate("Abas", { screen: "Agenda" })} />
    </Tela>
  );
}
