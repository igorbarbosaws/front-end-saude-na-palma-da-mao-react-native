// Perfil do profissional (paciente): dados, clínica vinculada e atalho para agendar.
import { Linking, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarraTopo, Botao, Tela, Texto } from "../../components/ui.js";
import { Avatar, Cartao, Estado, LinhaItem, Secao, Selo } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { registroProfissional, resumoProfissional } from "../../core/profissionais.js";
import { apenasDigitos, formatarTelefone } from "../../core/mascaras.js";
import { fonte, useEscala, useTema } from "../../theme.js";

function Linha({ icone, texto, onPress }) {
  const c = useTema();
  const e = useEscala();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
      <Ionicons name={icone} size={20} color={c.primariaEscura} style={{ marginRight: 10 }} />
      <Text accessibilityRole={onPress ? "link" : undefined} onPress={onPress}
        style={{ flex: 1, color: onPress ? c.primariaEscura : c.texto, fontSize: fonte.corpo * e, textDecorationLine: onPress ? "underline" : "none" }}>{texto}</Text>
    </View>
  );
}

export default function Profissional({ navigation, route }) {
  const id = Number(route.params?.id);
  const { dados: cat, carregando, erro, recarregar } = useCarregar(() => carregarCatalogo({ incluirInativos: true }), []);
  const p = cat?.profissionalPorId.get(id);

  return (
    <Tela>
      <BarraTopo titulo="Profissional" onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando} erro={erro} onTentar={recarregar} vazio={!p} textoVazio="Profissional não encontrado.">
        {p && <Conteudo cat={cat} p={p} navigation={navigation} />}
      </Estado>
    </Tela>
  );
}

function Conteudo({ cat, p, navigation }) {
  const c = useTema();
  const r = resumoProfissional(cat, p);
  const cl = r.clinica;
  const tel = apenasDigitos(p.telefone);
  const registro = registroProfissional(p);

  return (
    <>
      <Cartao>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar nome={p.nome} id={p.id} tamanho={64} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.subtitulo, fontWeight: "700" }}>{p.nome}</Text>
            {r.especialidades.length > 0 && <Text style={{ color: c.primariaEscura, fontSize: fonte.corpo }}>{r.especialidades.join(", ")}</Text>}
            {!!registro && <Text style={{ color: c.textoSuave, fontSize: fonte.pequena }}>{registro}</Text>}
          </View>
        </View>
        {cl && <Linha icone="business-outline" texto={cl.nome} />}
        {!!tel && <Linha icone="call-outline" texto={formatarTelefone(tel)} onPress={() => Linking.openURL(`tel:${tel}`)} />}
        {!!p.email && <Linha icone="mail-outline" texto={p.email} onPress={() => Linking.openURL(`mailto:${p.email}`)} />}
        <View style={{ marginTop: 12 }}><Selo texto={r.disponivel ? "Disponível para consultas" : "Indisponível no momento"} tom={r.disponivel ? "sucesso" : "neutro"} /></View>
      </Cartao>

      {cl && (
        <Secao titulo="Clínica vinculada">
          <LinhaItem icone="business-outline" titulo={cl.nome} descricao={[cl.ruaNumero, cl.cidadeUf].filter(Boolean).join(", ") || undefined} onPress={() => navigation.navigate("Clinica", { id: cl.id })} />
        </Secao>
      )}

      <Botao
        titulo={r.disponivel ? "Agendar com este profissional" : "Indisponível para agendar"}
        desabilitado={!r.disponivel}
        onPress={() => navigation.navigate("Agendamento", { idEspecialidade: r.idsEsp[0], idClinica: cl?.ativo ? cl.id : undefined, idProfissional: p.id })}
        style={{ marginTop: 12 }}
      />
    </>
  );
}
