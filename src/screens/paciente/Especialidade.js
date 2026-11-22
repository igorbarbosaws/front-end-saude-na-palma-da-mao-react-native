// Detalhe da especialidade (paciente): descrição, profissionais e clínicas que a atendem e atalho para agendar.
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarraTopo, Botao, Tela, Texto } from "../../components/ui.js";
import { Cartao, Estado, LinhaItem, Secao, Avatar } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { iconeEspecialidade, resumoProfissional } from "../../core/profissionais.js";
import { fonte, useTema } from "../../theme.js";

export default function Especialidade({ navigation, route }) {
  const id = Number(route.params?.id);
  const { dados: cat, carregando, erro, recarregar } = useCarregar(() => carregarCatalogo(), []);
  const e = cat?.especialidadePorId.get(id);

  return (
    <Tela>
      <BarraTopo titulo={e?.nome ?? "Especialidade"} onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando} erro={erro} onTentar={recarregar} vazio={!e} textoVazio="Especialidade não encontrada.">
        {e && <Conteudo cat={cat} e={e} navigation={navigation} />}
      </Estado>
    </Tela>
  );
}

function Conteudo({ cat, e, navigation }) {
  const c = useTema();
  const profissionais = cat.profissionais.map((p) => ({ p, r: resumoProfissional(cat, p) })).filter(({ r }) => r.disponivel && r.idsEsp.includes(e.id));
  const idsClinicas = new Set(cat.clinEsp.filter((x) => x.idEspecialidade === e.id).map((x) => x.idClinica));
  const clinicas = cat.clinicas.filter((cl) => cl.ativo && idsClinicas.has(cl.id));

  return (
    <>
      <Cartao>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name={iconeEspecialidade(e.nome)} size={36} color={c.primaria} style={{ marginRight: 12 }} />
          <Text accessibilityRole="header" style={{ flex: 1, color: c.texto, fontSize: fonte.subtitulo, fontWeight: "700" }}>{e.nome}</Text>
        </View>
        {!!e.descricao && <Texto suave style={{ marginTop: 8 }}>{e.descricao}</Texto>}
      </Cartao>

      {profissionais.length > 0 && (
        <Secao titulo="Profissionais disponíveis">
          {profissionais.map(({ p, r }) => (
            <LinhaItem key={p.id} titulo={p.nome} descricao={r.clinica?.nome} direita={<Avatar nome={p.nome} id={p.id} tamanho={40} />} onPress={() => navigation.navigate("Profissional", { id: p.id })} />
          ))}
        </Secao>
      )}

      {clinicas.length > 0 && (
        <Secao titulo="Clínicas disponíveis">
          {clinicas.map((cl) => (
            <LinhaItem key={cl.id} icone="business-outline" titulo={cl.nome} descricao={[cl.bairro, cl.cidadeUf].filter(Boolean).join(", ") || cl.ruaNumero} onPress={() => navigation.navigate("Clinica", { id: cl.id })} />
          ))}
        </Secao>
      )}

      {!profissionais.length && !clinicas.length && <Texto suave>Nenhum profissional ou clínica disponível para esta especialidade no momento.</Texto>}

      <Botao
        titulo={profissionais.length ? "Agendar consulta" : "Indisponível para agendar"}
        desabilitado={!profissionais.length}
        onPress={() => navigation.navigate("Agendamento", { idEspecialidade: e.id })}
        style={{ marginTop: 12 }}
      />
    </>
  );
}
