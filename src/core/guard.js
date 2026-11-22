export const PERFIS = {
  PACIENTE: "PACIENTE",
  PROFISSIONAL: "PROFISSIONAL",
  ADMIN: "ADMINISTRADOR",
};

// Perfil escolhido na tela "Como você vai usar o TriaOrto?" -> tipo da conta.
export const PERFIL_ESCOLHIDO = {
  paciente: { tipo: PERFIS.PACIENTE, nome: "paciente" },
  profissional: { tipo: PERFIS.PROFISSIONAL, nome: "profissional de saúde" },
  administrador: { tipo: PERFIS.ADMIN, nome: "administrador" },
};
