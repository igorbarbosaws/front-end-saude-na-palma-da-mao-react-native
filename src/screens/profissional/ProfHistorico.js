// Histórico de consultas concluídas do profissional.
import { Text, View } from "react-native";
import { BarraTopo, Tela } from "../../components/ui.js";
import { Cartao, Estado, Selo } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { carregarAgenda } from "../../services/agendaProfissionalService.js";
import { dataBR } from "./_formatos.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function ProfHistorico({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const r = await carregarAgenda(usuario);
    return r.meus.filter((a) => a.status === "CONCLUIDO").sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));
  }, [usuario?.idProfissional]);

  return (
    <Tela>
      <BarraTopo titulo="Histórico de consultas" onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={dados?.length === 0} textoVazio="Nenhuma consulta concluída ainda." iconeVazio="checkmark-done-outline">
        {dados?.map((a) => (
          <Cartao key={a.id}>
            <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{a.paciente}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1, marginBottom: 8 }}>{a.especialidade}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: c.texto, fontSize: fonte.pequena * e + 1 }}>{dataBR(a.data)} · {a.hora}</Text>
              <Selo texto="Concluída" tom="neutro" />
            </View>
          </Cartao>
        ))}
      </Estado>
    </Tela>
  );
}
