// Acessibilidade: tamanho do texto, alto contraste e menos animações. As escolhas ficam neste aparelho
// e valem para o app todo (veja src/core/acessibilidade.js).
import { Switch, Text, View } from "react-native";
import { BarraTopo, Tela, Texto } from "../../components/ui.js";
import { Cartao, Chip, Secao } from "../../components/comum.js";
import { TAMANHOS, useAcessibilidade } from "../../core/acessibilidade.js";
import { fonte, useEscala, useTema } from "../../theme.js";

function Interruptor({ titulo, descricao, valor, aoMudar }) {
  const c = useTema();
  const e = useEscala();
  return (
    <Cartao style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{titulo}</Text>
        <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{descricao}</Text>
      </View>
      <Switch value={valor} onValueChange={aoMudar} trackColor={{ true: c.primaria }} accessibilityLabel={titulo} />
    </Cartao>
  );
}

export default function PerfilAcessibilidade({ navigation }) {
  const { texto, contraste, reduzirAnimacoes, definir } = useAcessibilidade();
  return (
    <Tela>
      <BarraTopo titulo="Acessibilidade" onVoltar={() => navigation.goBack()} />
      <Texto suave style={{ marginBottom: 16 }}>Configure o aplicativo para a sua necessidade.</Texto>

      <Secao titulo="Tamanho do texto">
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {TAMANHOS.map((t) => (
            <Chip key={t.valor} rotulo={t.rotulo} ativo={texto === t.valor} onPress={() => definir({ texto: t.valor })} />
          ))}
        </View>
      </Secao>

      <Interruptor titulo="Alto contraste" descricao="Aumenta o contraste das cores para melhor visibilidade" valor={contraste} aoMudar={(v) => definir({ contraste: v })} />
      <Interruptor titulo="Reduzir animações" descricao="Diminui ou remove animações da interface" valor={reduzirAnimacoes} aoMudar={(v) => definir({ reduzirAnimacoes: v })} />
    </Tela>
  );
}
