// Navegador do PROFISSIONAL: 4 abas (Início, Agenda, Avisos, Perfil) + pilha com as demais telas.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useOpcoesAbas } from "./tabOptions.js";
import ProfHome from "../screens/profissional/ProfHome.js";
import ProfAgenda from "../screens/profissional/ProfAgenda.js";
import ProfNotificacoes from "../screens/profissional/ProfNotificacoes.js";
import ProfPerfil from "../screens/profissional/ProfPerfil.js";
import ProfCancelarConsulta from "../screens/profissional/ProfCancelarConsulta.js";
import ProfConsultaCancelada from "../screens/profissional/ProfConsultaCancelada.js";
import ProfDisponibilidade from "../screens/profissional/ProfDisponibilidade.js";
import ProfAdicionarDisponibilidade from "../screens/profissional/ProfAdicionarDisponibilidade.js";
import ProfHistorico from "../screens/profissional/ProfHistorico.js";

const Abas = createBottomTabNavigator();
const Pilha = createNativeStackNavigator();

const ICONES = {
  Inicio: ["home-outline", "home"],
  Agenda: ["calendar-outline", "calendar"],
  Avisos: ["notifications-outline", "notifications"],
  Perfil: ["person-outline", "person"],
};

function AbasProfissional() {
  const opcoes = useOpcoesAbas(ICONES);
  return (
    <Abas.Navigator screenOptions={opcoes}>
      <Abas.Screen name="Inicio" component={ProfHome} options={{ title: "Início" }} />
      <Abas.Screen name="Agenda" component={ProfAgenda} />
      <Abas.Screen name="Avisos" component={ProfNotificacoes} />
      <Abas.Screen name="Perfil" component={ProfPerfil} />
    </Abas.Navigator>
  );
}

export default function ProfissionalNavegador() {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false }}>
      <Pilha.Screen name="Abas" component={AbasProfissional} />
      <Pilha.Screen name="ProfCancelarConsulta" component={ProfCancelarConsulta} />
      <Pilha.Screen name="ProfConsultaCancelada" component={ProfConsultaCancelada} />
      <Pilha.Screen name="ProfDisponibilidade" component={ProfDisponibilidade} />
      <Pilha.Screen name="ProfAdicionarDisponibilidade" component={ProfAdicionarDisponibilidade} />
      <Pilha.Screen name="ProfHistorico" component={ProfHistorico} />
    </Pilha.Navigator>
  );
}
