// "Meu perfil" do administrador: dados da sessão, atalhos de gestão, informações do sistema e Sair.
import { Text, View } from "react-native";
import { Botao, Tela, Texto, Titulo } from "../../components/ui.js";
import { Avatar, Cartao, LinhaItem, Secao } from "../../components/comum.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { authService } from "../../services/authService.js";
import { fonte, useEscala, useTema } from "../../theme.js";

// Atualize a cada publicação.
const VERSAO_SISTEMA = "1.0.0";
const ULTIMA_ATUALIZACAO = "26/10/2026";

const GESTAO = [
  ["business-outline", "Clínicas", "AdmClinicas"],
  ["people-outline", "Profissionais", "AdmProfissionais"],
  ["medkit-outline", "Especialidades", "AdmEspecialidades"],
  ["person-outline", "Pacientes", "AdmPacientes"],
];

export default function AdmPerfil({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const pilha = navigation.getParent();

  return (
    <Tela>
      <Titulo>Meu perfil</Titulo>
      <Texto suave style={{ marginBottom: 12 }}>Administrador do sistema</Texto>
      <Cartao>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar nome={usuario?.nome} id={usuario?.idUsuario} tamanho={64} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.subtitulo * e, fontWeight: "700" }}>{usuario?.nome ?? ""}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{usuario?.email ?? ""}</Text>
            <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e + 1, fontWeight: "600" }}>Administrador</Text>
          </View>
        </View>
      </Cartao>

      <Secao titulo="Gestão">
        {GESTAO.map(([icone, titulo, rota]) => <LinhaItem key={rota} icone={icone} titulo={titulo} onPress={() => pilha?.navigate(rota)} />)}
      </Secao>

      <Secao titulo="Sistema">
        <Cartao>
          {[["Versão do sistema", VERSAO_SISTEMA], ["Última atualização", ULTIMA_ATUALIZACAO]].map(([r, v]) => (
            <View key={r} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
              <Text style={{ color: c.textoSuave, fontSize: fonte.corpo * e }}>{r}</Text>
              <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{v}</Text>
            </View>
          ))}
        </Cartao>
      </Secao>

      <Botao titulo="Sair" variante="perigo" onPress={() => authService.logout()} />
    </Tela>
  );
}
