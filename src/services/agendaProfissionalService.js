// Carrega e prepara a agenda do profissional logado (a junção das tabelas é feita no app, como no resto do projeto).
import { agendamentoService } from "./agendamentoService.js";
import { pacienteApi } from "./usuarioService.js";
import { toPaciente } from "../mappers/index.js";
import { carregarCatalogo } from "../core/catalogo.js";
import { hojeISO } from "../core/datetime.js";

export const ABERTOS = ["PENDENTE", "CONFIRMADO"];

// A justificativa do cancelamento é guardada no campo "observacao" do agendamento (a API não tem campo próprio).
const MARCA = "Justificativa:";
export const montarObservacao = (atual, justificativa) => `${atual ? `${atual} | ` : ""}${MARCA} ${justificativa}`;
export const extrairJustificativa = (obs) => {
  const i = String(obs ?? "").lastIndexOf(MARCA);
  return i < 0 ? "" : obs.slice(i + MARCA.length).trim();
};

// Devolve { cat, meus, semCadastro }. `meus` = consultas do profissional, já com nome do paciente e especialidade.
export async function carregarAgenda(sessao) {
  if (!sessao?.idProfissional) return { cat: null, meus: [], semCadastro: true };

  const [lista, cat, pacientes] = await Promise.all([agendamentoService.listar(), carregarCatalogo({ incluirInativos: true }), pacienteApi.listar()]);
  const vinculos = new Set(cat.vinculos.filter((v) => v.idProfissional === sessao.idProfissional).map((v) => v.id));
  const pacientePorId = new Map(pacientes.map(toPaciente).map((p) => [p.id, p]));

  const meus = lista
    .filter((a) => vinculos.has(a.idVinculo))
    .map((a) => ({
      ...a,
      paciente: pacientePorId.get(a.idPaciente)?.usuario?.nome ?? "Paciente",
      especialidade: a.especialidadeNome || cat.especialidadePorId.get(a.idEspecialidade)?.nome || "Consulta",
      justificativa: extrairJustificativa(a.observacao),
    }));

  return { cat, meus, semCadastro: false };
}

export const doDia = (meus, data = hojeISO()) => meus.filter((a) => a.data === data).sort((a, b) => a.hora.localeCompare(b.hora));

export const proximas = (meus) =>
  meus.filter((a) => a.data > hojeISO() && ABERTOS.includes(a.status)).sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
