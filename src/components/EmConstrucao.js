import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BarraTopo, Botao, Texto, Titulo, Tela } from "./ui.js";
import { authService } from "../services/authService.js";
import { useSessao } from "../navigation/SessaoContext.js";

// Tela provisória: cada arquivo de tela começa assim e é SUBSTITUÍDO pelo dono do lote.
export default function EmConstrucao({ titulo = "Em construção", lote, dono }) {
  const nav = useNavigation();
  const { usuario } = useSessao();
  return (
    <Tela>
      {nav.canGoBack() && <BarraTopo titulo="Voltar" onVoltar={() => nav.goBack()} />}
      <Titulo>{titulo}</Titulo>
      <Texto suave>
        Esta tela será feita no lote {lote}{dono ? ` (${dono})` : ""}. {usuario ? `Você está logado como ${usuario.nome}.` : ""}
      </Texto>
      <View style={{ height: 24 }} />
      {!nav.canGoBack() && <Botao titulo="Sair" variante="contorno" onPress={() => authService.logout()} />}
    </Tela>
  );
}
