// Início do paciente: saudação, mensagem, ações principais e acesso rápido.
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tela, Texto } from "../../components/ui.js";
import { LinhaItem, Secao } from "../../components/comum.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { ALVO_MINIMO, espaco, fonte, raio, useEscala, useTema } from "../../theme.js";

export default function Home({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const primeiroNome = String(usuario?.nome ?? "").trim().split(/\s+/)[0];

  return (
    <Tela>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: espaco.m }}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={{ color: c.texto, fontSize: 28 * e, fontWeight: "700" }}>{primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!"}</Text>
          <Texto suave>Como podemos ajudar hoje?</Texto>
        </View>
        <Image source={require("../../../assets/logo.png")} style={{ width: 44, height: 44 }} accessibilityIgnoresInvertColors />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.primariaClara, borderRadius: raio, padding: espaco.m, marginBottom: espaco.g }}>
        <Ionicons name="heart-outline" size={32} color={c.primariaEscura} />
        <View style={{ flex: 1, marginLeft: espaco.m }}>
          <Text style={{ color: c.primariaEscura, fontSize: fonte.corpo * e, fontWeight: "700" }}>Cuidar também é informação.</Text>
          <Text style={{ color: c.texto, fontSize: fonte.pequena * e + 1 }}>Estamos aqui para te ajudar a dar o próximo passo.</Text>
        </View>
      </View>

      <Secao titulo="O que você precisa fazer?">
        <LinhaItem icone="pulse-outline" titulo="Fazer pré-triagem" descricao="Conte o que está sentindo e receba orientações da TrIA." onPress={() => navigation.getParent()?.navigate("PreTriagem")} />
        <LinhaItem icone="calendar-outline" titulo="Agendar atendimento" descricao="Busque uma especialidade e escolha o melhor horário." onPress={() => navigation.getParent()?.navigate("Agendamento")} />
        <LinhaItem icone="list-outline" titulo="Consultar agendamento" descricao="Veja seus atendimentos já marcados." onPress={() => navigation.navigate("Consultas")} />
      </Secao>

      <Secao titulo="Acesso rápido">
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {[
            ["business-outline", "Clínicas", "Clinicas"],
            ["people-outline", "Profissionais", "Profissionais"],
            ["medkit-outline", "Especialidades", "Especialidades"],
          ].map(([icone, rotulo, rota]) => (
            <View key={rota} style={{ flex: 1, marginHorizontal: 4 }}>
              <Atalho icone={icone} rotulo={rotulo} onPress={() => navigation.getParent()?.navigate(rota)} />
            </View>
          ))}
        </View>
      </Secao>
    </Tela>
  );
}

function Atalho({ icone, rotulo, onPress }) {
  const c = useTema();
  const e = useEscala();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={rotulo} onPress={onPress}
      style={({ pressed }) => ({ minHeight: ALVO_MINIMO * 2, alignItems: "center", justifyContent: "center", borderRadius: raio, borderWidth: 1.5, borderColor: c.borda, backgroundColor: pressed ? c.primariaClara : c.superficie, padding: 8 })}>
      <Ionicons name={icone} size={26} color={c.primariaEscura} />
      <Text style={{ color: c.texto, fontSize: (fonte.pequena - 1) * e, fontWeight: "600", marginTop: 4, textAlign: "center" }} numberOfLines={1} adjustsFontSizeToFit>{rotulo}</Text>
    </Pressable>
  );
}
