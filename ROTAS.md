# Mapa de rotas e parâmetros (TriaOrto+ mobile)

Combinado entre os lotes: use SEMPRE estes nomes e parâmetros ao navegar, para as telas de pessoas diferentes se encontrarem.
`navigation.navigate("Nome", { parametros })`. As abas ficam dentro da rota `Abas`; para ir a uma aba de outra tela use
`navigation.navigate("Abas", { screen: "Consultas" })`.

## Paciente
| Rota | Parâmetros | Lote |
|---|---|---|
| Abas > Inicio / Consultas / Avisos / Perfil | - | 1 / 3 / 3 / 1 |
| Clinicas | - | 1 |
| Clinica | `{ id }` | 1 |
| Especialidades | - | 1 |
| Especialidade | `{ id }` | 1 |
| Profissionais | `{ idEspecialidade? }` | 1 |
| Profissional | `{ id }` | 1 |
| PreTriagem | - | 2 |
| PreTriagemResultado | `{ area, urgente, texto, rapidas }` | 2 |
| Chatbot | - | 2 |
| Agendamento | `{ idEspecialidade?, idClinica?, idProfissional?, idVinculo? }` (o que vier preenchido pula o passo) | 3 |
| PerfilEditar / PerfilSenha / PerfilAcessibilidade | - | 1 |

## Profissional
| Rota | Parâmetros | Lote |
|---|---|---|
| Abas > Inicio / Agenda / Avisos / Perfil | - | 4 |
| ProfCancelarConsulta | `{ id }` (id do agendamento) | 4 |
| ProfConsultaCancelada | `{ id }` | 4 |
| ProfDisponibilidade | - | 4 |
| ProfAdicionarDisponibilidade | - | 4 |
| ProfHistorico | - | 4 |

## Administrador
| Rota | Parâmetros | Lote |
|---|---|---|
| Abas > Inicio / Avisos / Perfil | - | 5 / 6 / 6 |
| AdmClinicas / AdmClinicaForm | `{ id? }` (sem id = nova) | 5 |
| AdmEspecialidades / AdmEspecialidadeForm | `{ id? }` | 5 |
| AdmProfissionais / AdmProfissionalForm | `{ id? }` | 6 |
| AdmPacientes / AdmAgendamentos / AdmCancelamentos | - | 6 |

## Peças compartilhadas (não duplique)
- `src/components/ui.js`: Tela, Titulo, Texto, Botao, Campo, Alerta, AvisoLento, Carregando, BarraTopo
- `src/components/comum.js`: Cartao, LinhaItem, Vazio, ErroTela, Estado, Selo, Chip, Avatar, Secao, Confirmar
- `src/hooks/useCarregar.js`: `useCarregar(buscar, deps)` e `useAcao()`
- `src/core/catalogo.js`: `carregarCatalogo()` (clínicas, especialidades, profissionais e vínculos já ligados)
- `src/core/profissionais.js`: `resumoProfissional`, `registroProfissional`, `iconeEspecialidade`, `iniciais`
- `src/core/status.js`: `STATUS_TOM`
- `src/core/datetime.js`: datas e horas; `src/core/mascaras.js`: CPF, telefone, CNPJ, data digitada
