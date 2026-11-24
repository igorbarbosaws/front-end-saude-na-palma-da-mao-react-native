// Agendamento (6 passos): especialidade -> local -> profissional -> data -> horário -> confirmar -> "Consulta marcada!".
// As regras de disponibilidade são calculadas aqui porque a API não filtra nem valida conflitos de horário.
//
// Parâmetros de rota (todos opcionais; o que vier preenchido pula o passo correspondente):
//   idEspecialidade, idClinica, idProfissional, idVinculo  -> vêm do catálogo, da pré-triagem ou do "reagendar"
//   idPreTriagem  -> liga a pré-triagem à consulta (vai na observação: "Pré-triagem #12")
//   reagendarId   -> id da consulta antiga: depois de marcar a nova, a antiga é cancelada
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alerta, AvisoLento, BarraTopo, Botao, Tela, Texto, Titulo } from "../../components/ui.js";
import { Avatar, Cartao, Chip, Estado, Selo } from "../../components/comum.js";
import Busca from "../../components/Busca.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { dataCurta, formatarData, gerarHorarios, hojeISO, agoraHHMM } from "../../core/datetime.js";
import { iconeEspecialidade, registroProfissional } from "../../core/profissionais.js";
import { normalizar } from "../../core/triagem.js";
import { disponibilidadeService } from "../../services/disponibilidadeService.js";
import { agendamentoService } from "../../services/agendamentoService.js";
import { ALVO_MINIMO, espaco, fonte, raio, useEscala, useTema } from "../../theme.js";

const ORDEM = ["idEspecialidade", "idClinica", "idVinculo", "data", "hora"];
const TOTAL_PASSOS = 6;
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ---------- regras de disponibilidade (funções puras: recebem os dados carregados) ----------
function horariosDoDia({ disp, ag }, idVinculo, data) {
  const janelas = disp.filter((d) => d.idVinculo === idVinculo && d.data === data && d.status === "DISPONIVEL");
  const ocupados = new Set(ag.filter((a) => a.idVinculo === idVinculo && a.data === data && a.status !== "CANCELADO").map((a) => a.hora));
  const todos = new Set(janelas.flatMap((j) => gerarHorarios(j)));
  const passou = (hh) => data === hojeISO() && hh <= agoraHHMM();
  return [...todos].sort().map((hora) => ({ hora, livre: !ocupados.has(hora) && !passou(hora) }));
}

const horariosLivres = (d, idVinculo, data) => horariosDoDia(d, idVinculo, data).filter((x) => x.livre).map((x) => x.hora);

function datasDisponiveis(d, idVinculo) {
  const datas = [...new Set(d.disp.filter((x) => x.idVinculo === idVinculo).map((x) => x.data))].filter((x) => x >= hojeISO()).sort();
  return datas.filter((data) => horariosLivres(d, idVinculo, data).length > 0);
}

// Vínculos (profissional + clínica) que atendem a especialidade escolhida.
function vinculosDaEspecialidade(cat, filtroClinica, idEspecialidade) {
  return cat.vinculos.filter((v) => {
    if (filtroClinica && v.idClinica !== filtroClinica) return false;
    if (!cat.clinicaPorId.has(v.idClinica)) return false;
    const p = cat.profissionalPorId.get(v.idProfissional);
    return (
      p?.ativo &&
      cat.profEsp.some((x) => x.idProfissional === v.idProfissional && x.idEspecialidade === idEspecialidade) &&
      cat.clinEsp.some((x) => x.idClinica === v.idClinica && x.idEspecialidade === idEspecialidade)
    );
  });
}

// Só oferece especialidades com ao menos um profissional (evita becos sem saída).
const especialidadesDisponiveis = (cat, filtro) => cat.especialidades.filter((e) => vinculosDaEspecialidade(cat, filtro, e.id).length > 0);

function clinicasDaEspecialidade(cat, filtro, idEsp) {
  const ids = new Set(vinculosDaEspecialidade(cat, filtro, idEsp).map((v) => v.idClinica));
  return cat.clinicas.filter((c) => ids.has(c.id));
}

const profissionaisDaClinica = (cat, filtro, idEsp, idClinica) =>
  vinculosDaEspecialidade(cat, filtro, idEsp).filter((v) => v.idClinica === idClinica).map((v) => ({ vinculo: v, prof: cat.profissionalPorId.get(v.idProfissional) }));

// ---------- peças da tela ----------
function Passos({ atual }) {
  const c = useTema();
  return (
    <View accessible accessibilityLabel={`Passo ${atual + 1} de ${TOTAL_PASSOS}`} style={{ flexDirection: "row", justifyContent: "center", marginBottom: espaco.m }}>
      {Array.from({ length: TOTAL_PASSOS }, (_, i) => (
        <View key={i} style={{ width: 34, height: 34, borderRadius: 17, marginHorizontal: 4, alignItems: "center", justifyContent: "center",
          backgroundColor: i === atual ? c.primaria : i < atual ? c.primariaClara : c.desabilitado }}>
          {i < atual ? <Ionicons name="checkmark" size={18} color={c.primariaEscura} /> : <Text style={{ color: i === atual ? c.sobrePrimaria : c.desabilitadoTexto, fontWeight: "700" }}>{i + 1}</Text>}
        </View>
      ))}
    </View>
  );
}

function Opcao({ selecionado, onPress, rotulo, children }) {
  const c = useTema();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selecionado }} accessibilityLabel={rotulo} onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", padding: espaco.m, marginBottom: 12, borderRadius: raio, borderWidth: 2, borderColor: selecionado ? c.primaria : c.borda, backgroundColor: selecionado ? c.primariaClara : c.superficie }}>
      <View style={{ flex: 1 }}>{children}</View>
      <Ionicons name={selecionado ? "radio-button-on" : "radio-button-off"} size={24} color={selecionado ? c.primaria : c.textoSuave} />
    </Pressable>
  );
}

function Calendario({ datas, escolhida, aoEscolher, mes, setMes }) {
  const c = useTema();
  const e = useEscala();
  const livres = new Set(datas);
  const [ya, ma] = datas[0].split("-").map(Number);
  const [yz, mz] = datas[datas.length - 1].split("-").map(Number);
  const indice = (a, m) => a * 12 + (m - 1);
  const { ano, mes: m } = mes;
  const primeiro = new Date(ano, m - 1, 1).getDay();
  const total = new Date(ano, m, 0).getDate();
  const celulas = [...Array(primeiro).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (celulas.length % 7) celulas.push(null);
  const semanas = Array.from({ length: celulas.length / 7 }, (_, i) => celulas.slice(i * 7, i * 7 + 7));
  const anterior = () => setMes(m === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: m - 1 });
  const proximo = () => setMes(m === 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: m + 1 });
  const noInicio = indice(ano, m) <= indice(ya, ma);
  const noFim = indice(ano, m) >= indice(yz, mz);

  return (
    <Cartao>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" disabled={noInicio} onPress={anterior} style={{ width: ALVO_MINIMO, height: ALVO_MINIMO, alignItems: "center", justifyContent: "center", opacity: noInicio ? 0.3 : 1 }}>
          <Ionicons name="chevron-back" size={24} color={c.primariaEscura} />
        </Pressable>
        <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{MESES[m - 1].toUpperCase()} DE {ano}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" disabled={noFim} onPress={proximo} style={{ width: ALVO_MINIMO, height: ALVO_MINIMO, alignItems: "center", justifyContent: "center", opacity: noFim ? 0.3 : 1 }}>
          <Ionicons name="chevron-forward" size={24} color={c.primariaEscura} />
        </Pressable>
      </View>
      <View style={{ flexDirection: "row" }}>
        {SEMANA.map((d) => <Text key={d} style={{ flex: 1, textAlign: "center", color: c.textoSuave, fontSize: fonte.pequena * e, fontWeight: "600" }}>{d}</Text>)}
      </View>
      {semanas.map((sem, i) => (
        <View key={i} style={{ flexDirection: "row" }}>
          {sem.map((dia, j) => {
            if (!dia) return <View key={j} style={{ flex: 1 }} />;
            const iso = `${ano}-${String(m).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
            const livre = livres.has(iso);
            const sel = escolhida === iso;
            return (
              <Pressable key={j} disabled={!livre} onPress={() => aoEscolher(iso)} accessibilityRole="button" accessibilityState={{ selected: sel, disabled: !livre }}
                accessibilityLabel={livre ? formatarData(iso) : `${formatarData(iso)}, sem horários`}
                style={{ flex: 1, height: ALVO_MINIMO, margin: 2, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: sel ? c.primaria : livre ? c.primariaClara : "transparent" }}>
                <Text style={{ color: sel ? c.sobrePrimaria : livre ? c.primariaEscura : c.desabilitadoTexto, fontWeight: livre ? "700" : "400", fontSize: fonte.corpo * e }}>{dia}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e, marginTop: 8 }}>Dias em verde têm horários disponíveis.</Text>
    </Cartao>
  );
}

// ---------- tela ----------
export default function Agendamento({ navigation, route }) {
  const c = useTema();
  const e = useEscala();
  const params = route.params ?? {};
  const { usuario } = useSessao();
  const { ocupado, executar } = useAcao();

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const [cat, disp, ag] = await Promise.all([carregarCatalogo(), disponibilidadeService.listar(), agendamentoService.listar()]);
    return { cat, disp, ag };
  }, []);

  const [passo, setPasso] = useState(0);
  const [sel, setSel] = useState({ idEspecialidade: null, idClinica: null, idVinculo: null, data: null, hora: null });
  const [filtroClinica, setFiltroClinica] = useState(null);
  const [mes, setMes] = useState(null);
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState("");
  const [pronto, setPronto] = useState(null);
  const aplicou = useRef(false);

  // Atalhos vindos de outras telas: pula os passos que já vieram escolhidos.
  useEffect(() => {
    if (!dados || aplicou.current) return;
    aplicou.current = true;
    const { cat } = dados;
    const idClinica = Number(params.idClinica);
    const filtro = cat.clinicaPorId.has(idClinica) ? idClinica : null;
    setFiltroClinica(filtro);
    const idEsp = Number(params.idEspecialidade);
    if (!especialidadesDisponiveis(cat, filtro).some((x) => x.id === idEsp)) return;
    const novo = { idEspecialidade: idEsp, idClinica: null, idVinculo: null, data: null, hora: null };
    let irPara = 1;
    if (filtro && clinicasDaEspecialidade(cat, filtro, idEsp).some((x) => x.id === filtro)) {
      novo.idClinica = filtro;
      irPara = 2;
      const idProf = Number(params.idProfissional);
      const v = vinculosDaEspecialidade(cat, filtro, idEsp).find((x) => x.id === Number(params.idVinculo) || x.idProfissional === idProf);
      if ((params.idVinculo || params.idProfissional) && v) {
        novo.idVinculo = v.id;
        irPara = 3;
      }
    }
    setSel(novo);
    setPasso(irPara);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  function escolher(campo, valor) {
    const i = ORDEM.indexOf(campo);
    setSel((s) => {
      const novo = { ...s, [campo]: valor };
      ORDEM.slice(i + 1).forEach((k) => (novo[k] = null));
      return novo;
    });
    if (["idEspecialidade", "idClinica", "idVinculo"].includes(campo)) setMes(null);
    setMsg("");
  }

  function irPara(p) {
    setPasso(p);
    setBusca("");
    setMsg("");
  }
  const voltar = () => (passo === 0 ? navigation.goBack() : irPara(passo - 1));
  const podeContinuar = passo === 5 || sel[ORDEM[passo]] !== null;

  async function confirmar() {
    setMsg("");
    try {
      await executar(() =>
        agendamentoService.criar({
          idPaciente: usuario.idPaciente,
          idVinculo: sel.idVinculo,
          idEspecialidade: sel.idEspecialidade,
          data: sel.data,
          hora: sel.hora,
          observacao: params.idPreTriagem ? `Pré-triagem #${params.idPreTriagem}` : undefined,
        }),
      );
      let aviso = "";
      if (params.reagendarId) {
        try {
          await agendamentoService.alterarStatus(params.reagendarId, "CANCELADO"); // reagendar = marca a nova e cancela a antiga
        } catch {
          aviso = "A nova consulta foi marcada, mas não conseguimos cancelar a antiga. Cancele-a em Consultas.";
        }
      }
      setPronto({ ...resumo(), aviso });
    } catch (err) {
      if (err.status === 409) {
        // Alguém pegou o horário antes: atualiza a lista e volta para a escolha do horário.
        await recarregar();
        escolher("hora", null);
        setPasso(4);
      }
      setMsg(err.message);
    }
  }

  function resumo() {
    const { cat } = dados;
    const vinc = cat.vinculoPorId.get(sel.idVinculo);
    return { clinica: cat.clinicaPorId.get(sel.idClinica), esp: cat.especialidadePorId.get(sel.idEspecialidade), prof: cat.profissionalPorId.get(vinc?.idProfissional) };
  }

  // ----- tela "Consulta marcada!" -----
  if (pronto) {
    const linhas = [["Profissional", pronto.prof?.nome], ["Data", dataCurta(sel.data)], ["Horário", sel.hora], ["Local", pronto.clinica?.nome]].filter(([, v]) => v);
    return (
      <Tela>
        <View style={{ alignItems: "center", marginTop: espaco.g }}>
          <Ionicons name="checkmark-circle" size={80} color={c.sucesso} />
          <Titulo style={{ marginTop: 8, textAlign: "center" }}>Consulta marcada!</Titulo>
          <Texto suave style={{ textAlign: "center", marginBottom: 16 }}>Seu agendamento foi confirmado com sucesso.</Texto>
        </View>
        {!!pronto.aviso && <Alerta tipo="aviso">{pronto.aviso}</Alerta>}
        <Cartao>
          {linhas.map(([r, v]) => (
            <View key={r} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
              <Text style={{ color: c.textoSuave, fontSize: fonte.corpo * e }}>{r}</Text>
              <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700", flexShrink: 1, textAlign: "right", marginLeft: 12 }}>{v}</Text>
            </View>
          ))}
        </Cartao>
        <Texto suave style={{ marginBottom: 16 }}>Você pode cancelar esta consulta até 24h antes do horário agendado.</Texto>
        <Botao titulo="Ver minhas consultas" onPress={() => navigation.navigate("Abas", { screen: "Consultas" })} />
        <Botao titulo="Voltar ao início" variante="contorno" onPress={() => navigation.navigate("Abas", { screen: "Inicio" })} style={{ marginTop: 12 }} />
      </Tela>
    );
  }

  return (
    <Tela>
      <BarraTopo titulo="Agendamento" onVoltar={voltar} />
      <AvisoLento />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar}>
        {dados && !usuario?.idPaciente ? (
          <Alerta>Não encontramos seu cadastro de paciente. Saia e entre novamente.</Alerta>
        ) : dados ? (
          <>
            <Passos atual={passo} />
            <Corpo dados={dados} passo={passo} sel={sel} escolher={escolher} filtroClinica={filtroClinica} busca={busca} setBusca={setBusca} mes={mes} setMes={setMes} resumo={passo === 5 ? resumo() : null} />
            {!!msg && <Alerta>{msg}</Alerta>}
            <Botao titulo={passo === 5 ? (ocupado ? "Agendando..." : "Confirmar agendamento") : "Continuar"} ocupado={ocupado} desabilitado={!podeContinuar}
              onPress={() => (passo === 5 ? confirmar() : irPara(passo + 1))} style={{ marginTop: 8 }} />
            <Botao titulo="Voltar" variante="contorno" desabilitado={ocupado} onPress={voltar} style={{ marginTop: 12 }} />
          </>
        ) : null}
      </Estado>
    </Tela>
  );
}

// Conteúdo de cada passo.
function Corpo({ dados, passo, sel, escolher, filtroClinica, busca, setBusca, mes, setMes, resumo }) {
  const c = useTema();
  const e = useEscala();
  const { cat } = dados;
  const termo = normalizar(busca);
  const filtra = (itens, textoDe) => (termo ? itens.filter((i) => normalizar(textoDe(i)).includes(termo)) : itens);
  const Cab = ({ titulo, sub }) => (
    <>
      <Titulo>{titulo}</Titulo>
      <Texto suave style={{ marginBottom: 12 }}>{sub}</Texto>
    </>
  );

  if (passo === 0) {
    const itens = filtra(especialidadesDisponiveis(cat, filtroClinica), (x) => `${x.nome} ${x.descricao}`);
    return (
      <>
        <Cab titulo="Qual atendimento você procura?" sub="Escolha a especialidade que melhor atende às suas necessidades." />
        <Busca placeholder="Buscar especialidade..." valor={busca} aoDigitar={setBusca} />
        {itens.length === 0 && <Texto suave>Nenhuma especialidade encontrada.</Texto>}
        {itens.map((x) => (
          <Opcao key={x.id} rotulo={x.nome} selecionado={sel.idEspecialidade === x.id} onPress={() => escolher("idEspecialidade", x.id)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name={iconeEspecialidade(x.nome)} size={28} color={c.primaria} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{x.nome}</Text>
                {!!x.descricao && <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{x.descricao}</Text>}
              </View>
            </View>
          </Opcao>
        ))}
      </>
    );
  }

  if (passo === 1) {
    const itens = filtra(clinicasDaEspecialidade(cat, filtroClinica, sel.idEspecialidade), (x) => `${x.nome} ${x.endereco}`);
    return (
      <>
        <Cab titulo="Escolha o local do atendimento" sub={`Selecione a unidade mais próxima de você. Especialidade: ${cat.especialidadePorId.get(sel.idEspecialidade)?.nome ?? ""}.`} />
        <Busca placeholder="Buscar unidade..." valor={busca} aoDigitar={setBusca} />
        {itens.length === 0 && <Texto suave>Nenhuma unidade encontrada.</Texto>}
        {itens.map((x) => (
          <Opcao key={x.id} rotulo={x.nome} selecionado={sel.idClinica === x.id} onPress={() => escolher("idClinica", x.id)}>
            <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{x.nome}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{[x.ruaNumero, x.cidadeUf].filter(Boolean).join(", ") || x.endereco}</Text>
          </Opcao>
        ))}
      </>
    );
  }

  if (passo === 2) {
    const esp = cat.especialidadePorId.get(sel.idEspecialidade);
    const itens = filtra(profissionaisDaClinica(cat, filtroClinica, sel.idEspecialidade, sel.idClinica), ({ prof }) => prof.nome);
    return (
      <>
        <Cab titulo="Escolha o profissional" sub="Selecione o profissional que irá realizar seu atendimento." />
        <Busca placeholder="Buscar profissional..." valor={busca} aoDigitar={setBusca} />
        {itens.length === 0 && <Texto suave>Nenhum profissional encontrado.</Texto>}
        {itens.map(({ vinculo, prof }) => (
          <Opcao key={vinculo.id} rotulo={prof.nome} selecionado={sel.idVinculo === vinculo.id} onPress={() => escolher("idVinculo", vinculo.id)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Avatar nome={prof.nome} id={prof.id ?? vinculo.idProfissional} tamanho={48} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{prof.nome}</Text>
                <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e }}>{esp?.nome}</Text>
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{registroProfissional(prof)}</Text>
              </View>
            </View>
          </Opcao>
        ))}
      </>
    );
  }

  if (passo === 3) {
    const datas = datasDisponiveis(dados, sel.idVinculo);
    if (datas.length === 0) {
      return (
        <>
          <Cab titulo="Escolha a data" sub="Selecione um dia disponível para o atendimento." />
          <Texto suave>Este profissional não tem horários livres no momento. Volte e escolha outro profissional.</Texto>
        </>
      );
    }
    const [y, m] = (sel.data ?? datas[0]).split("-").map(Number);
    const mesAtual = mes ?? { ano: y, mes: m };
    return (
      <>
        <Cab titulo="Escolha a data" sub="Selecione um dia disponível para o atendimento." />
        <Calendario datas={datas} escolhida={sel.data} aoEscolher={(iso) => escolher("data", iso)} mes={mesAtual} setMes={setMes} />
      </>
    );
  }

  if (passo === 4) {
    const dia = horariosDoDia(dados, sel.idVinculo, sel.data);
    return (
      <>
        <Cab titulo="Escolha o horário" sub={`Horários em ${formatarData(sel.data)}.`} />
        {!dia.some((x) => x.livre) ? (
          <Texto suave>Não há mais horários livres neste dia. Volte e escolha outra data.</Texto>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {dia.map(({ hora, livre }) => <Chip key={hora} rotulo={hora} ativo={sel.hora === hora} desabilitado={!livre} onPress={() => escolher("hora", hora)} />)}
          </View>
        )}
        <Texto suave style={{ marginTop: 8 }}>Horários apagados não estão disponíveis.</Texto>
      </>
    );
  }

  // passo 5: resumo para conferir antes de gravar
  const { clinica, esp, prof } = resumo;
  const endereco = [clinica?.ruaNumero, clinica?.cidadeUf].filter(Boolean).join(", ");
  const linhas = [["Especialidade", esp?.nome], ["Clínica", clinica?.nome], ["Profissional", prof?.nome], ["Data", dataCurta(sel.data)], ["Horário", sel.hora], ["Endereço", endereco]].filter(([, v]) => v);
  return (
    <>
      <Cab titulo="Confirmar agendamento" sub="Revise os dados antes de confirmar." />
      <Cartao>
        {linhas.map(([r, v]) => (
          <View key={r} style={{ paddingVertical: 6 }}>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{r}</Text>
            <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{v}</Text>
          </View>
        ))}
      </Cartao>
    </>
  );
}
