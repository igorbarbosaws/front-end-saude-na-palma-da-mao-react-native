// Perfil do paciente (aba): dados da conta, atalhos de configuração e Sair.
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Botao, Tela } from "../../components/ui.js";
import { Avatar, Cartao, LinhaItem } from "../../components/comum.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { authService } from "../../services/authService.js";
import { pacienteApi } from "../../services/usuarioService.js";
import { dataCurta } from "../../core/datetime.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function PerfilPaciente({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const pilha = navigation.getParent();

  // A data de nascimento é um complemento: se a API falhar, o cartão aparece sem ela.
  const { dados: nascimento } = useCarregar(async () => {
    if (!usuario?.idPaciente) return "";
    try {
      const p = await pacienteApi.buscar(usuario.idPaciente);
      return dataCurta(String(p?.data_nascimento ?? "").slice(0, 10));
    } catch {
      return "";
    }
  }, [usuario?.idPaciente]);

  return (
    <Tela>
      <Cartao style={{ flexDirection: "row", alignItems: "center" }}>
        <Avatar nome={usuario?.nome} id={usuario?.idPaciente ?? 1} tamanho={64} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.subtitulo * e, fontWeight: "700" }}>{usuario?.nome}</Text>
          <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{usuario?.email}</Text>
          {!!nascimento && <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>Nascimento: {nascimento}</Text>}
        </View>
      </Cartao>

      <LinhaItem icone="create-outline" titulo="Editar perfil" onPress={() => pilha?.navigate("PerfilEditar")} />
      <LinhaItem icone="lock-closed-outline" titulo="Alterar senha" onPress={() => pilha?.navigate("PerfilSenha")} />
      <LinhaItem icone="notifications-outline" titulo="Notificações" onPress={() => navigation.navigate("Avisos")} />
      <LinhaItem icone="accessibility-outline" titulo="Acessibilidade" onPress={() => pilha?.navigate("PerfilAcessibilidade")} />

      <View style={{ height: 8 }} />
      <Botao titulo="Sair" variante="perigo" onPress={() => authService.logout()} />
    </Tela>
  );
}
