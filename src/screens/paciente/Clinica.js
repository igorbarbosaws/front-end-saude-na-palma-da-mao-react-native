// Detalhes de uma clínica (paciente): endereço, contato, especialidades e atalho para agendar.
import { Linking, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarraTopo, Botao, Tela, Texto } from "../../components/ui.js";
import { Cartao, Estado, Secao, Selo } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { apenasDigitos, formatarTelefone } from "../../core/mascaras.js";
import { fonte, useEscala, useTema } from "../../theme.js";

function Linha({ icone, texto, onPress }) {
  const c = useTema();
  const e = useEscala();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
      <Ionicons name={icone} size={20} color={c.primariaEscura} style={{ marginRight: 10 }} />
      <Text accessibilityRole={onPress ? "link" : undefined} onPress={onPress}
        style={{ flex: 1, color: onPress ? c.primariaEscura : c.texto, fontSize: fonte.corpo * e, textDecorationLine: onPress ? "underline" : "none" }}>{texto}</Text>
    </View>
  );
}

export default function Clinica({ navigation, route }) {
  const id = Number(route.params?.id);
  const { dados: cat, carregando, erro, recarregar } = useCarregar(() => carregarCatalogo({ incluirInativos: true }), []);
  const clinica = cat?.clinicaPorId.get(id);

  return (
    <Tela>
      <BarraTopo titulo={clinica?.nome ?? "Clínica"} onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando} erro={erro} onTentar={recarregar} vazio={!clinica} textoVazio="Clínica não encontrada.">
        {clinica && <Conteudo cat={cat} c={clinica} navigation={navigation} />}
      </Estado>
    </Tela>
  );
}

function Conteudo({ cat, c, navigation }) {
  const esps = cat.clinEsp.filter((x) => x.idClinica === c.id).map((x) => cat.especialidadePorId.get(x.idEspecialidade)?.nome).filter(Boolean);
  const tel = apenasDigitos(c.telefone);
  const endereco = [c.ruaNumero, c.cidadeUf].filter(Boolean).join(", ");
  const tema = useTema();
  return (
    <>
      <Cartao>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Ionicons name="business" size={40} color={tema.primaria} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={{ color: tema.texto, fontSize: fonte.subtitulo, fontWeight: "700" }}>{c.nome}</Text>
            {!c.ativo && <Selo texto="Inativa" tom="erro" />}
          </View>
        </View>
        {!!endereco && <Linha icone="location-outline" texto={endereco} />}
        {!!tel && <Linha icone="call-outline" texto={formatarTelefone(tel)} onPress={() => Linking.openURL(`tel:${tel}`)} />}
        {!!c.email && <Linha icone="mail-outline" texto={c.email} onPress={() => Linking.openURL(`mailto:${c.email}`)} />}
      </Cartao>

      {esps.length > 0 && (
        <Secao titulo="Especialidades">
          {esps.map((n) => <Texto key={n}>• {n}</Texto>)}
        </Secao>
      )}

      <Botao
        titulo={c.ativo ? "Agendar nesta clínica" : "Indisponível para agendar"}
        desabilitado={!c.ativo}
        onPress={() => navigation.navigate("Agendamento", { idClinica: c.id })}
        style={{ marginTop: 12 }}
      />
    </>
  );
}
