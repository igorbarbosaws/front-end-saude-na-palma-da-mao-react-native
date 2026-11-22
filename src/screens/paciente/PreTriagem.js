// Pré-triagem (formulário): sintomas, região, duração, intensidade e informações complementares.
// Em seguida leva à conversa com a TrIA (Chatbot), que recebe esse resumo como contexto.
import { useState } from "react";
import { View } from "react-native";
import { Alerta, BarraTopo, Botao, Campo, Tela, Texto, Titulo } from "../../components/ui.js";
import { Chip, Secao } from "../../components/comum.js";
import { DURACOES, INTENSIDADES, REGIOES, SINTOMAS } from "../../services/triagemService.js";

const alterna = (lista, valor) => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

export default function PreTriagem({ navigation }) {
  const [sintomas, setSintomas] = useState([]);
  const [regiao, setRegiao] = useState("");
  const [duracao, setDuracao] = useState("");
  const [intensidade, setIntensidade] = useState(0);
  const [complemento, setComplemento] = useState("");

  const pronto = sintomas.length > 0 || complemento.trim().length >= 3;

  function continuar() {
    navigation.navigate("Chatbot", { contexto: { sintomas, regiao, duracao, intensidade: intensidade || null, complemento: complemento.trim() } });
  }

  return (
    <Tela>
      <BarraTopo titulo="Pré-triagem" onVoltar={() => navigation.goBack()} />
      <Titulo>Conte o que você está sentindo</Titulo>
      <Texto suave style={{ marginBottom: 16 }}>Responda o que souber. Depois a TrIA conversa com você para entender melhor.</Texto>

      <Secao titulo="O que está sentindo?">
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {SINTOMAS.map(([chave, rotulo]) => (
            <Chip key={chave} rotulo={rotulo} ativo={sintomas.includes(chave)} onPress={() => setSintomas((s) => alterna(s, chave))} />
          ))}
        </View>
      </Secao>

      <Secao titulo="Em qual região?">
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {REGIOES.map((r) => (
            <Chip key={r} rotulo={r} ativo={regiao === r} onPress={() => setRegiao(regiao === r ? "" : r)} />
          ))}
        </View>
      </Secao>

      <Secao titulo="Há quanto tempo?">
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {DURACOES.map((d) => (
            <Chip key={d} rotulo={d} ativo={duracao === d} onPress={() => setDuracao(duracao === d ? "" : d)} />
          ))}
        </View>
      </Secao>

      <Secao titulo="Qual a intensidade?">
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {INTENSIDADES.map(([n, rotulo]) => (
            <Chip key={n} rotulo={rotulo} ativo={intensidade === n} onPress={() => setIntensidade(intensidade === n ? 0 : n)} />
          ))}
        </View>
      </Secao>

      <Campo rotulo="Informações complementares (opcional)" value={complemento} onChangeText={setComplemento} multiline numberOfLines={4} maxLength={500}
        placeholder="Ex.: comecei a sentir depois de uma queda" inputStyle={{ minHeight: 110, textAlignVertical: "top", paddingTop: 12 }} />

      {!pronto && <Alerta tipo="aviso">Marque pelo menos um sintoma ou escreva algo para continuar.</Alerta>}
      <Botao titulo="Continuar com a TrIA" onPress={continuar} desabilitado={!pronto} />
      <Botao titulo="Prefiro só conversar" variante="contorno" onPress={() => navigation.navigate("Chatbot")} style={{ marginTop: 12 }} />
    </Tela>
  );
}
