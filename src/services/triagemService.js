// Pré-triagem inteligente: conversa com a TrIA (IA no back-end) e orientação de especialidades.
//
// CONTRATO COM O BACK-END (combinar com o Edson):
//   POST /pre-triagem/conversar
//     corpo:   { id_paciente, id_pre_triagem|null, mensagem, contexto|null }
//              contexto = { sintomas: ["febre","dor"], regiao, duracao, intensidade (1 a 5), complemento }
//     resposta: { id_pre_triagem, resposta, concluida, resultado? }
//              resultado = { urgente, orientacao, especialidades: [{ id_especialidade?, nome, motivo? }] }
//   O servidor guarda a conversa e o resultado ligados ao paciente (persistência exigida no enunciado).
//
// ENQUANTO O ENDPOINT NÃO EXISTE (404/405/501) o app usa as regras locais de core/triagem.js, para a demonstração
// continuar funcionando. Quando o endpoint estiver no ar, nada muda no app: ele passa a usar a IA sozinho.
import { http, ApiError } from "../core/http.js";
import { orientar, PADRAO_DA_AREA } from "../core/triagem.js";
import { especialidadeService } from "./especialidadeService.js";

const SEM_ENDPOINT = [404, 405, 501];
const ROTULO_AREA = { ORTOPEDIA: "Ortopedia", FISIOTERAPIA: "Fisioterapia" };

export const SINTOMAS = [
  ["febre", "Febre"],
  ["dor", "Dor"],
  ["inchaco", "Inchaço"],
  ["lesao", "Lesão"],
  ["limitacao", "Limitação de movimento"],
];
export const REGIOES = ["Joelho", "Ombro", "Coluna", "Quadril", "Mão ou punho", "Tornozelo ou pé", "Outra"];
export const DURACOES = ["Hoje", "Alguns dias", "Algumas semanas", "Meses"];
export const INTENSIDADES = [
  [1, "Leve"],
  [2, "Moderada"],
  [3, "Forte"],
  [4, "Muito forte"],
  [5, "Insuportável"],
];

// Resumo em texto do que o paciente marcou no formulário (vai como primeira mensagem da conversa).
export function contextoParaTexto(ctx) {
  if (!ctx) return "";
  const partes = [];
  const nomes = (ctx.sintomas ?? []).map((k) => SINTOMAS.find(([c]) => c === k)?.[1] ?? k).map((s) => s.toLowerCase());
  if (nomes.length) partes.push(`Estou sentindo ${nomes.join(", ")}`);
  if (ctx.regiao) partes.push(`região: ${ctx.regiao}`);
  if (ctx.duracao) partes.push(`há ${ctx.duracao.toLowerCase()}`);
  const inten = INTENSIDADES.find(([n]) => n === ctx.intensidade)?.[1];
  if (inten) partes.push(`intensidade ${inten.toLowerCase()}`);
  if (ctx.complemento?.trim()) partes.push(ctx.complemento.trim());
  return partes.join("; ") + (partes.length ? "." : "");
}

function normalizarResposta(r) {
  const res = r.resultado;
  return {
    idPreTriagem: r.id_pre_triagem ?? null,
    resposta: String(r.resposta ?? ""),
    concluida: r.concluida === true,
    origem: "ia",
    resultado: res
      ? {
          urgente: res.urgente === true,
          orientacao: res.orientacao ?? "",
          especialidades: (res.especialidades ?? []).map((e) => ({ id: e.id_especialidade != null ? Number(e.id_especialidade) : null, nome: e.nome, motivo: e.motivo ?? "" })),
        }
      : null,
  };
}

// Plano B (sem IA): usa as regras simples. A resposta conclui na primeira mensagem, como a pré-triagem do MVP web.
function respostaLocal({ mensagem, contexto, textosAnteriores = [] }) {
  const texto = [contextoParaTexto(contexto), ...textosAnteriores, mensagem].filter(Boolean).join(". ");
  const rapidas = contexto?.sintomas ?? [];
  const { area, urgente } = orientar({ texto, rapidas });
  return {
    idPreTriagem: null,
    origem: "regras",
    concluida: true,
    resposta: "Obrigada por contar. Já tenho o que preciso para uma primeira orientação. Toque em \"Ver resultado\".",
    resultado: {
      urgente,
      orientacao: "Esta é uma orientação inicial e não substitui a avaliação de um profissional de saúde.",
      especialidades: [{ id: null, nome: ROTULO_AREA[area], motivo: "Indicada pelos sintomas que você descreveu." }],
    },
  };
}

export const triagemService = {
  // Envia uma mensagem do paciente e devolve a resposta da TrIA.
  // `textosAnteriores` só é usado pelo plano B (o servidor já guarda o histórico).
  async conversar({ idPaciente, idPreTriagem = null, mensagem, contexto = null, textosAnteriores = [] }) {
    try {
      const r = await http("/pre-triagem/conversar", {
        method: "POST",
        body: { id_paciente: Number(idPaciente), id_pre_triagem: idPreTriagem, mensagem, contexto },
      });
      return normalizarResposta(r);
    } catch (e) {
      if (!(e instanceof ApiError) || !SEM_ENDPOINT.includes(e.status)) throw e;
      return respostaLocal({ mensagem, contexto, textosAnteriores });
    }
  },

  // Liga o nome indicado (ex.: "Ortopedia") a uma especialidade cadastrada na API, para pré-selecionar no agendamento.
  async acharEspecialidade(sugerida) {
    if (sugerida?.id) return sugerida.id;
    try {
      const lista = await especialidadeService.listar();
      const nome = String(sugerida?.nome ?? "");
      const area = Object.keys(PADRAO_DA_AREA).find((a) => ROTULO_AREA[a] === nome);
      const achada = lista.find((e) => e.nome.toLowerCase() === nome.toLowerCase()) ?? (area ? lista.find((e) => PADRAO_DA_AREA[area].test(e.nome)) : null);
      return achada?.id ?? null;
    } catch {
      return null;
    }
  },
};
