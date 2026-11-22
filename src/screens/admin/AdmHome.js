// Início do administrador: visão geral (6 contadores com atalho) e relatório de desempenho do período.
// A API não tem endpoint de relatório: os números são calculados no app (services/adminService.js).
import { useMemo, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alerta, AvisoLento, Botao, Tela, Texto, Titulo } from "../../components/ui.js";
import { Cartao, Chip, Estado, Secao } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { calcularIndicadores, carregarDadosAdmin, periodos, relatorioCsv } from "../../services/adminService.js";
import { hojeISO } from "../../core/datetime.js";
import { espaco, fonte, raio, useEscala, useTema } from "../../theme.js";

const TILES = [
  ["clinicas", "Clínicas cadastradas", "business-outline", "AdmClinicas"],
  ["profissionais", "Profissionais", "people-outline", "AdmProfissionais"],
  ["especialidades", "Especialidades", "medkit-outline", "AdmEspecialidades"],
  ["pacientes", "Pacientes", "person-outline", "AdmPacientes"],
  ["agendamentosHoje", "Agendamentos hoje", "calendar-outline", "AdmAgendamentos"],
  ["cancelamentos", "Cancelamentos", "close-circle-outline", "AdmCancelamentos"],
];

function Barra({ rotulo, n, total, cor }) {
  const c = useTema();
  const e = useEscala();
  const pct = total ? Math.round((n / total) * 100) : 0;
  return (
    <View style={{ marginBottom: 10 }} accessible accessibilityLabel={`${rotulo}: ${n}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: c.texto, fontSize: fonte.pequena * e + 1 }}>{rotulo}</Text>
        <Text style={{ color: c.texto, fontWeight: "700", fontSize: fonte.pequena * e + 1 }}>{n}</Text>
      </View>
      <View style={{ height: 10, borderRadius: 5, backgroundColor: c.desabilitado, overflow: "hidden", marginTop: 4 }}>
        <View style={{ width: `${pct}%`, height: 10, backgroundColor: cor }} />
      </View>
    </View>
  );
}

function Metrica({ rotulo, valor, nota, cor }) {
  const c = useTema();
  const e = useEscala();
  return (
    <View accessible accessibilityLabel={`${rotulo}: ${valor}. ${nota}`} style={{ width: "48%", backgroundColor: c.superficie, borderColor: c.borda, borderWidth: 1, borderRadius: raio, padding: 12, marginBottom: 10 }}>
      <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{rotulo}</Text>
      <Text style={{ color: cor ?? c.texto, fontSize: 24 * e, fontWeight: "700" }}>{valor}</Text>
      <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{nota}</Text>
    </View>
  );
}

const Ranking = ({ itens }) => {
  const c = useTema();
  const e = useEscala();
  if (!itens.length) return <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>Sem agendamentos no período.</Text>;
  return itens.map((x, i) => (
    <View key={x.nome} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
      <Text style={{ width: 28, color: c.primariaEscura, fontWeight: "700", fontSize: fonte.corpo * e }}>{i + 1}</Text>
      <Text style={{ flex: 1, color: c.texto, fontSize: fonte.corpo * e }}>{x.nome}</Text>
      <Text style={{ color: c.texto, fontWeight: "700", fontSize: fonte.corpo * e }}>{x.n}</Text>
    </View>
  ));
};

export default function AdmHome({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const pilha = navigation.getParent();
  const [tipo, setTipo] = useState("mensal");
  const [indice, setIndice] = useState(0);
  const [msg, setMsg] = useState("");

  const { dados, carregando, erro, recarregar } = useCarregar(carregarDadosAdmin, []);
  const lista = useMemo(() => periodos(tipo), [tipo]);
  const periodo = lista[indice] ?? lista[0];
  const ind = useMemo(() => (dados ? calcularIndicadores(dados, periodo, hojeISO()) : null), [dados, periodo]);
  const p = ind?.periodo;

  // Exportar o relatório: abre a folha de compartilhar do celular com o CSV em texto (sem biblioteca extra).
  async function exportar() {
    setMsg("");
    try {
      await Share.share({ title: `Relatório TriaOrto+ ${periodo.inicio}`, message: relatorioCsv(ind, periodo) });
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <Tela>
      <Titulo>Administração</Titulo>
      <Texto suave style={{ marginBottom: 12 }}>Visão geral do sistema</Texto>
      <AvisoLento />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar}>
        {ind && (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 }}>
              {TILES.map(([chave, rotulo, icone, rota]) => (
                <Pressable key={chave} accessibilityRole="button" accessibilityLabel={`${rotulo}: ${ind.topo[chave]}`} onPress={() => pilha?.navigate(rota)}
                  style={{ width: "48%", backgroundColor: c.primariaClara, borderRadius: raio, padding: 14, marginBottom: 10, minHeight: 110 }}>
                  <Ionicons name={icone} size={26} color={c.primaria} />
                  <Text style={{ color: c.primariaEscura, fontSize: 28 * e, fontWeight: "700" }}>{ind.topo[chave]}</Text>
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{rotulo}</Text>
                </Pressable>
              ))}
            </View>

            <Secao titulo="Relatório de desempenho">
              <Texto suave style={{ marginBottom: 8 }}>Dados consolidados da plataforma.</Texto>
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                <Chip rotulo="Semanal" ativo={tipo === "semanal"} onPress={() => { setTipo("semanal"); setIndice(0); }} />
                <Chip rotulo="Mensal" ativo={tipo === "mensal"} onPress={() => { setTipo("mensal"); setIndice(0); }} />
              </View>
              <Texto suave style={{ marginBottom: 4 }}>{tipo === "mensal" ? "Mês de referência" : "Semana de referência"}</Texto>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                {lista.slice(0, 6).map((x, i) => <Chip key={x.inicio} rotulo={x.rotulo} ativo={indice === i} onPress={() => setIndice(i)} />)}
              </View>
              <Cartao>
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>Período selecionado</Text>
                <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{periodo.descricao}</Text>
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e, marginTop: 10 }}>Volume total de agendamentos</Text>
                <Text style={{ color: c.primariaEscura, fontSize: 36 * e, fontWeight: "700" }}>{p.total}</Text>
              </Cartao>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                <Metrica rotulo="Taxa de conclusão" valor={p.taxaConclusao === null ? "—" : `${p.taxaConclusao}%`} nota={`${p.concluidos} concluídos`} cor={c.sucesso} />
                <Metrica rotulo="Taxa de cancelamento" valor={p.taxaCancelamento === null ? "—" : `${p.taxaCancelamento}%`} nota={`${p.cancelados} cancelados`} cor={c.erro} />
                <Metrica rotulo="Crescimento da base" valor={p.crescimento === null ? "—" : `${p.crescimento > 0 ? "+" : ""}${p.crescimento}%`} nota={`${p.novosPacientes} novos pacientes`} />
                <Metrica rotulo="Ocupação da agenda" valor={p.ocupacao === null ? "—" : `${p.ocupacao}%`} nota="dos horários disponíveis" />
              </View>
            </Secao>

            <Secao titulo="Status dos agendamentos">
              <Cartao>
                <Barra rotulo="Concluídos" n={p.concluidos} total={p.total} cor={c.sucesso} />
                <Barra rotulo="Pendentes" n={p.pendentes} total={p.total} cor={c.primaria} />
                <Barra rotulo="Cancelados" n={p.cancelados} total={p.total} cor={c.erro} />
              </Cartao>
            </Secao>
            <Secao titulo="Especialidades mais buscadas"><Cartao><Ranking itens={p.topEspecialidades} /></Cartao></Secao>
            <Secao titulo="Clínicas mais ativas"><Cartao><Ranking itens={p.topClinicas} /></Cartao></Secao>

            <Secao titulo="Status dos médicos">
              <View style={{ flexDirection: "row" }}>
                {[["Ativos", ind.medicos.ativos, c.sucesso], ["Inativos", ind.medicos.inativos, c.erro], ["Indisponíveis", ind.medicos.indisponiveis, c.textoSuave]].map(([r, v, cor], i) => (
                  <View key={r} accessible accessibilityLabel={`${r}: ${v}`} style={{ flex: 1, marginLeft: i ? 8 : 0, backgroundColor: c.superficie, borderColor: c.borda, borderWidth: 1, borderRadius: raio, padding: 10, alignItems: "center" }}>
                    <Text style={{ color: cor, fontSize: 24 * e, fontWeight: "700" }}>{v}</Text>
                    <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{r}</Text>
                  </View>
                ))}
              </View>
            </Secao>

            <Secao titulo="Perfil dos pacientes">
              <Cartao>
                {[["Faixa etária predominante", ind.pacientes.faixa], ["Dados demográficos", ind.pacientes.demografia], ["Retorno à plataforma", ind.pacientes.retorno]].map(([r, v]) => (
                  <View key={r} style={{ paddingVertical: 4 }}>
                    <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{r}</Text>
                    <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{v ?? "Sem dados"}</Text>
                  </View>
                ))}
              </Cartao>
            </Secao>

            <Secao titulo="Especialidades cadastradas">
              <Cartao>
                {ind.especialidades.length === 0 ? <Text style={{ color: c.textoSuave }}>Nenhuma especialidade ativa.</Text> : ind.especialidades.map((x) => (
                  <View key={x.nome} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                    <Text style={{ color: c.texto, fontSize: fonte.corpo * e, flex: 1 }}>{x.nome}</Text>
                    <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{x.medicos} {x.medicos === 1 ? "médico" : "médicos"}</Text>
                  </View>
                ))}
              </Cartao>
            </Secao>

            <Secao titulo="Log de atividades">
              <Cartao>
                {ind.log.length === 0 ? <Text style={{ color: c.textoSuave }}>Nenhum cadastro no período.</Text> : ind.log.map((l, i) => (
                  <View key={i} style={{ flexDirection: "row", paddingVertical: 4 }}>
                    <Text style={{ width: 52, color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{l.data}</Text>
                    <Text style={{ flex: 1, color: c.texto, fontSize: fonte.pequena * e + 1 }}>{l.rotulo}: <Text style={{ fontWeight: "700" }}>{l.nome}</Text></Text>
                  </View>
                ))}
              </Cartao>
            </Secao>

            {!!msg && <Alerta>{msg}</Alerta>}
            <Texto suave style={{ marginBottom: 8 }}>Todos os indicadores acima serão incluídos no arquivo CSV.</Texto>
            <Botao titulo="Baixar relatório" onPress={exportar} />
          </>
        )}
      </Estado>
    </Tela>
  );
}
