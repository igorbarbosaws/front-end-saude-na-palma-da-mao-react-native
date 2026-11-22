import { Ionicons } from "@expo/vector-icons";
import { useTema } from "../theme.js";

// Opções comuns das abas inferiores dos 3 perfis. `icones` = { NomeDaRota: ["icone", "icone-ativo"] }.
export function useOpcoesAbas(icones) {
  const c = useTema();
  return ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: c.primaria,
    tabBarInactiveTintColor: c.textoSuave,
    tabBarStyle: { backgroundColor: c.superficie, borderTopColor: c.borda, minHeight: 60, paddingBottom: 6, paddingTop: 4 },
    tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
    tabBarIcon: ({ focused, color }) => {
      const [normal, ativo] = icones[route.name];
      return <Ionicons name={focused ? ativo : normal} size={24} color={color} />;
    },
  });
}
