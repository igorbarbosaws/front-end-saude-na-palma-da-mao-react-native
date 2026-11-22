import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import { useSessao } from "./SessaoContext.js";
import { PERFIS } from "../core/guard.js";
import { Carregando } from "../components/ui.js";
import { useTema } from "../theme.js";
import Inicio from "../screens/publica/Inicio.js";
import EscolherPerfil from "../screens/publica/EscolherPerfil.js";
import Login from "../screens/publica/Login.js";
import Cadastro from "../screens/publica/Cadastro.js";
import PacienteNavegador from "./paciente.js";
import ProfissionalNavegador from "./profissional.js";
import AdminNavegador from "./admin.js";

const Pilha = createNativeStackNavigator();

// Telas públicas (sem login). Ao entrar, a sessão muda e o app troca de navegador sozinho.
function Publico() {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false }}>
      <Pilha.Screen name="Inicio" component={Inicio} />
      <Pilha.Screen name="EscolherPerfil" component={EscolherPerfil} />
      <Pilha.Screen name="Login" component={Login} />
      <Pilha.Screen name="Cadastro" component={Cadastro} />
    </Pilha.Navigator>
  );
}

// Cada perfil tem seu navegador em um arquivo próprio (paciente.js, profissional.js, admin.js),
// para que as pessoas do time não editem o mesmo arquivo ao adicionar telas.
export default function Navegacao() {
  const { carregando, usuario } = useSessao();
  const c = useTema();
  const escuro = useColorScheme() === "dark";

  // Parte do tema padrão do React Navigation (que já traz as fontes) e troca só as cores da marca.
  const base = escuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...base,
    colors: { ...base.colors, primary: c.primaria, background: c.fundo, card: c.superficie, text: c.texto, border: c.borda, notification: c.erro },
  };

  if (carregando) return <Carregando />;

  let corpo = <Publico />;
  if (usuario?.tipo === PERFIS.PACIENTE) corpo = <PacienteNavegador />;
  else if (usuario?.tipo === PERFIS.PROFISSIONAL) corpo = <ProfissionalNavegador />;
  else if (usuario?.tipo === PERFIS.ADMIN) corpo = <AdminNavegador />;

  return <NavigationContainer theme={tema}>{corpo}</NavigationContainer>;
}
