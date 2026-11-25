// Início do profissional: saudação, resumo do dia e atalhos.
import { Image, Text, View } from "react-native";
import { Tela, Texto } from "../../components/ui.js";
import { LinhaItem, Secao } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { ABERTOS, carregarAgenda, doDia } from "../../services/agendaProfissionalService.js";
import { agoraHHMM } from "../../core/datetime.js";
import { espaco, fonte, raio, useEscala, useTema } from "../../theme.js";

// "Dr. Carlos Menezes" -> "Dr. Carlos"; "Carlos Menezes" -> "Carlos"
function nomeDeSaudacao(nome) {
  const partes = String(nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "";
  return /^(dr|dra)\.?$/i.test(partes[0]) ? partes.slice(0, 2).join(" ") : partes[0];
}

export default function ProfHome({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const pilha = navigation.getParent();
  const nome = nomeDeSaudacao(usuario?.nome);

  // O resumo é um complemento: se a API falhar, os atalhos continuam funcionando.
  const { dados } = useCarregar(async () => {
    const { meus } = await carregarAgenda(usuario);
    const hoje = doDia(meus).filter((a) => a.status !== "CANCELADO");
    const abertas = hoje.filter((a) => ABERTOS.includes(a.status));
    const prox = abertas.find((a) => a.hora >= agoraHHMM()) ?? abertas[0];
    return { qtd: hoje.length, proxima: prox?.hora ?? "--:--" };
  }, [usuario?.idProfissional]);

  return (
    <Tela>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: espaco.m }}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={{ color: c.texto, fontSize: 28 * e, fontWeight: "700" }}>{nome ? `Olá, ${nome}!` : "Olá!"}</Text>
          <Texto suave>Sua agenda de hoje</Texto>
        </View>
        <Image source={require("../../../assets/logo.png")} style={{ width: 44, height: 44 }} accessibilityIgnoresInvertColors />
      </View>

      <View style={{ flexDirection: "row", marginBottom: espaco.g }}>
        {[["Consultas hoje", dados ? String(dados.qtd) : "–"], ["Próxima às", dados ? dados.proxima : "--:--"]].map(([rotulo, valor], i) => (
          <View key={rotulo} accessible accessibilityLabel={`${rotulo}: ${valor}`} style={{ flex: 1, marginLeft: i ? 12 : 0, backgroundColor: c.primariaClara, borderRadius: raio, padding: espaco.m }}>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{rotulo}</Text>
            <Text style={{ color: c.primariaEscura, fontSize: 30 * e, fontWeight: "700" }}>{valor}</Text>
          </View>
        ))}
      </View>

      <Secao titulo="Atalhos">
        <LinhaItem icone="calendar-outline" titulo="Minha agenda" descricao="Visualize suas consultas de hoje e dos próximos dias" onPress={() => navigation.navigate("Agenda")} />
        <LinhaItem icone="time-outline" titulo="Disponibilidade" descricao="Configure seus horários disponíveis" onPress={() => pilha?.navigate("ProfDisponibilidade")} />
        <LinhaItem icone="checkmark-done-outline" titulo="Histórico de consultas" descricao="Consultas realizadas anteriormente" onPress={() => pilha?.navigate("ProfHistorico")} />
      </Secao>
    </Tela>
  );
}
