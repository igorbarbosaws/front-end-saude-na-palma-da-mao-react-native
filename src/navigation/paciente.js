// Navegador do PACIENTE: 4 abas (Início, Consultas, Avisos, Perfil) + pilha com as demais telas.
// Para adicionar uma tela: crie o arquivo em src/screens/paciente/ e registre aqui (veja ROTAS.md).
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useOpcoesAbas } from "./tabOptions.js";
import Home from "../screens/paciente/Home.js";
import MeusAgendamentos from "../screens/paciente/MeusAgendamentos.js";
import Avisos from "../screens/paciente/Avisos.js";
import PerfilPaciente from "../screens/paciente/PerfilPaciente.js";
import Clinicas from "../screens/paciente/Clinicas.js";
import Clinica from "../screens/paciente/Clinica.js";
import Especialidades from "../screens/paciente/Especialidades.js";
import Especialidade from "../screens/paciente/Especialidade.js";
import Profissionais from "../screens/paciente/Profissionais.js";
import Profissional from "../screens/paciente/Profissional.js";
import PreTriagem from "../screens/paciente/PreTriagem.js";
import PreTriagemResultado from "../screens/paciente/PreTriagemResultado.js";
import Chatbot from "../screens/paciente/Chatbot.js";
import Agendamento from "../screens/paciente/Agendamento.js";
import PerfilEditar from "../screens/paciente/PerfilEditar.js";
import PerfilSenha from "../screens/paciente/PerfilSenha.js";
import PerfilAcessibilidade from "../screens/paciente/PerfilAcessibilidade.js";

const Abas = createBottomTabNavigator();
const Pilha = createNativeStackNavigator();

const ICONES = {
  Inicio: ["home-outline", "home"],
  Consultas: ["calendar-outline", "calendar"],
  Avisos: ["notifications-outline", "notifications"],
  Perfil: ["person-outline", "person"],
};

function AbasPaciente() {
  const opcoes = useOpcoesAbas(ICONES);
  return (
    <Abas.Navigator screenOptions={opcoes}>
      <Abas.Screen name="Inicio" component={Home} options={{ title: "Início" }} />
      <Abas.Screen name="Consultas" component={MeusAgendamentos} />
      <Abas.Screen name="Avisos" component={Avisos} />
      <Abas.Screen name="Perfil" component={PerfilPaciente} />
    </Abas.Navigator>
  );
}

export default function PacienteNavegador() {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false }}>
      <Pilha.Screen name="Abas" component={AbasPaciente} />
      <Pilha.Screen name="Clinicas" component={Clinicas} />
      <Pilha.Screen name="Clinica" component={Clinica} />
      <Pilha.Screen name="Especialidades" component={Especialidades} />
      <Pilha.Screen name="Especialidade" component={Especialidade} />
      <Pilha.Screen name="Profissionais" component={Profissionais} />
      <Pilha.Screen name="Profissional" component={Profissional} />
      <Pilha.Screen name="PreTriagem" component={PreTriagem} />
      <Pilha.Screen name="PreTriagemResultado" component={PreTriagemResultado} />
      <Pilha.Screen name="Chatbot" component={Chatbot} />
      <Pilha.Screen name="Agendamento" component={Agendamento} />
      <Pilha.Screen name="PerfilEditar" component={PerfilEditar} />
      <Pilha.Screen name="PerfilSenha" component={PerfilSenha} />
      <Pilha.Screen name="PerfilAcessibilidade" component={PerfilAcessibilidade} />
    </Pilha.Navigator>
  );
}
