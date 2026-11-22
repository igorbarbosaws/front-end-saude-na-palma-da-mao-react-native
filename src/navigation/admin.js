// Navegador do ADMINISTRADOR: 3 abas (Início, Avisos, Perfil) + pilha com os cadastros.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useOpcoesAbas } from "./tabOptions.js";
import AdmHome from "../screens/admin/AdmHome.js";
import AdmNotificacoes from "../screens/admin/AdmNotificacoes.js";
import AdmPerfil from "../screens/admin/AdmPerfil.js";
import AdmClinicas from "../screens/admin/AdmClinicas.js";
import AdmClinicaForm from "../screens/admin/AdmClinicaForm.js";
import AdmEspecialidades from "../screens/admin/AdmEspecialidades.js";
import AdmEspecialidadeForm from "../screens/admin/AdmEspecialidadeForm.js";
import AdmProfissionais from "../screens/admin/AdmProfissionais.js";
import AdmProfissionalForm from "../screens/admin/AdmProfissionalForm.js";
import AdmPacientes from "../screens/admin/AdmPacientes.js";
import AdmAgendamentos from "../screens/admin/AdmAgendamentos.js";
import AdmCancelamentos from "../screens/admin/AdmCancelamentos.js";

const Abas = createBottomTabNavigator();
const Pilha = createNativeStackNavigator();

const ICONES = {
  Inicio: ["home-outline", "home"],
  Avisos: ["notifications-outline", "notifications"],
  Perfil: ["person-outline", "person"],
};

function AbasAdmin() {
  const opcoes = useOpcoesAbas(ICONES);
  return (
    <Abas.Navigator screenOptions={opcoes}>
      <Abas.Screen name="Inicio" component={AdmHome} options={{ title: "Início" }} />
      <Abas.Screen name="Avisos" component={AdmNotificacoes} />
      <Abas.Screen name="Perfil" component={AdmPerfil} />
    </Abas.Navigator>
  );
}

export default function AdminNavegador() {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false }}>
      <Pilha.Screen name="Abas" component={AbasAdmin} />
      <Pilha.Screen name="AdmClinicas" component={AdmClinicas} />
      <Pilha.Screen name="AdmClinicaForm" component={AdmClinicaForm} />
      <Pilha.Screen name="AdmEspecialidades" component={AdmEspecialidades} />
      <Pilha.Screen name="AdmEspecialidadeForm" component={AdmEspecialidadeForm} />
      <Pilha.Screen name="AdmProfissionais" component={AdmProfissionais} />
      <Pilha.Screen name="AdmProfissionalForm" component={AdmProfissionalForm} />
      <Pilha.Screen name="AdmPacientes" component={AdmPacientes} />
      <Pilha.Screen name="AdmAgendamentos" component={AdmAgendamentos} />
      <Pilha.Screen name="AdmCancelamentos" component={AdmCancelamentos} />
    </Pilha.Navigator>
  );
}
