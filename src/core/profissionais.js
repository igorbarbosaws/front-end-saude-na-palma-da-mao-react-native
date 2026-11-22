// Junta, no app, o que as telas do paciente mostram de cada profissional (a API não tem filtros nem "visões").
export function resumoProfissional(cat, p) {
  const idsEsp = cat.profEsp.filter((x) => x.idProfissional === p.id).map((x) => x.idEspecialidade);
  const especialidades = idsEsp.map((id) => cat.especialidadePorId.get(id)?.nome).filter(Boolean);
  const vinculos = cat.vinculos.filter((v) => v.idProfissional === p.id);
  const clinicasAtivas = vinculos.filter((v) => v.ativo).map((v) => cat.clinicaPorId.get(v.idClinica)).filter((c) => c?.ativo);
  const clinica = clinicasAtivas[0] ?? cat.clinicaPorId.get(vinculos[0]?.idClinica) ?? null;
  return { idsEsp, especialidades, vinculos, clinica, disponivel: p.ativo && clinicasAtivas.length > 0 };
}

// "CRM 12345-PE"
export const registroProfissional = (p) => [[p.conselho, p.registro].filter(Boolean).join(" "), p.uf].filter(Boolean).join("-");

// Ícone (Ionicons) da especialidade pelo nome; sem correspondência, usa o de ortopedia.
const ICONES = [
  [/traumat/i, "bandage-outline"],
  [/esport/i, "football-outline"],
  [/coluna/i, "body-outline"],
  [/joelho/i, "walk-outline"],
  [/ombro/i, "barbell-outline"],
  [/m[aã]o|punho/i, "hand-left-outline"],
  [/fisio|reabilit|fortalec|preven/i, "fitness-outline"],
];
export const iconeEspecialidade = (nome) => ICONES.find(([r]) => r.test(nome))?.[1] ?? "medkit-outline";

// "Dra. Ana Paula Ferreira" -> "AF"; ignora tratamentos (Dr., Dra.) e ligas de nomes (de, da...).
export function iniciais(nome) {
  const partes = String(nome ?? "")
    .replace(/\b(dr|dra|prof|profa)\.?(?=\s)/gi, "")
    .split(/\s+/)
    .filter((p) => p && !/^(de|da|do|dos|das|e)$/i.test(p));
  if (!partes.length) return "?";
  const letras = partes.length === 1 ? partes[0].slice(0, 2) : partes[0][0] + partes[partes.length - 1][0];
  return letras.toUpperCase();
}
