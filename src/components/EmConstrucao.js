import { View } from "react-native";
import { Botao, Texto, Titulo, Tela } from "./ui.js";
import { authService } from "../services/authService.js";
import { useSessao } from "../navigation/SessaoContext.js";

// Tela provisória dos perfis cujas telas ainda não foram portadas. Substituída lote a lote.
export default function EmConstrucao({ perfil }) {
  const { usuario } = useSessao();
  return (
    <Tela>
      <Titulo>Olá, {usuario?.nome}!</Titulo>
      <Texto suave>As telas do perfil {perfil} entram nos próximos lotes. O login já está funcionando.</Texto>
      <View style={{ height: 24 }} />
      <Botao titulo="Sair" variante="contorno" onPress={() => authService.logout()} />
    </Tela>
  );
}
