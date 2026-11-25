// Perfil do profissional: dados do cadastro e botão Sair.
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Botao, Tela, Titulo } from "../../components/ui.js";
import { Avatar, Cartao } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { authService } from "../../services/authService.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function ProfPerfil() {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();

  // Se a API falhar, a tela mostra o que já está na sessão.
  const { dados } = useCarregar(async () => {
    const cat = await carregarCatalogo({ incluirInativos: true });
    const p = cat.profissionalPorId.get(usuario?.idProfissional);
    const esp = cat.profEsp.filter((x) => x.idProfissional === usuario?.idProfissional).map((x) => cat.especialidadePorId.get(x.idEspecialidade)?.nome).filter(Boolean);
    const v = cat.vinculos.find((x) => x.idProfissional === usuario?.idProfissional);
    return {
      telefone: p?.telefone || "—",
      email: p?.email || usuario?.email || "—",
      registro: p ? [p.conselho, [p.registro, p.uf].filter(Boolean).join("-")].filter(Boolean).join(" ") : "",
      especialidades: esp.join(", "),
      clinica: (v && cat.clinicaPorId.get(v.idClinica)?.nome) || "—",
    };
  }, [usuario?.idProfissional]);

  const linhas = [["call-outline", dados?.telefone ?? "—"], ["mail-outline", dados?.email ?? usuario?.email ?? "—"], ["business-outline", dados?.clinica ?? "—"]];

  return (
    <Tela>
      <Titulo>Perfil</Titulo>
      <Cartao>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Avatar nome={usuario?.nome} id={usuario?.idProfissional} tamanho={64} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.subtitulo * e, fontWeight: "700" }}>{usuario?.nome ?? ""}</Text>
            {!!dados?.especialidades && <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e + 1 }}>{dados.especialidades}</Text>}
            {!!dados?.registro && <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{dados.registro}</Text>}
          </View>
        </View>
        {linhas.map(([icone, texto]) => (
          <View key={icone} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 5 }}>
            <Ionicons name={icone} size={20} color={c.primariaEscura} style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, color: c.texto, fontSize: fonte.corpo * e }}>{texto}</Text>
          </View>
        ))}
      </Cartao>
      <Botao titulo="Sair" variante="perigo" onPress={() => authService.logout()} style={{ marginTop: 8 }} />
    </Tela>
  );
}
