// Profissionais (paciente): lista com busca por nome, especialidade ou clínica. Cada cartão leva ao perfil.
import { useState } from "react";
import { Text, View } from "react-native";
import { BarraTopo, Tela } from "../../components/ui.js";
import { Avatar, Cartao, Estado, Selo } from "../../components/comum.js";
import Busca from "../../components/Busca.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { resumoProfissional } from "../../core/profissionais.js";
import { normalizar } from "../../core/triagem.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function Profissionais({ navigation, route }) {
  const c = useTema();
  const e = useEscala();
  const filtroEsp = route.params?.idEspecialidade ? Number(route.params.idEspecialidade) : null;
  const [texto, setTexto] = useState("");
  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const cat = await carregarCatalogo({ incluirInativos: true });
    return cat.profissionais.map((p) => ({ p, r: resumoProfissional(cat, p) }));
  }, []);

  const alvo = normalizar(texto);
  const itens = (dados ?? [])
    .filter((i) => !filtroEsp || i.r.idsEsp.includes(filtroEsp))
    .filter((i) => !alvo || normalizar(`${i.p.nome} ${i.r.especialidades.join(" ")} ${i.r.clinica?.nome ?? ""}`).includes(alvo));

  return (
    <Tela>
      <BarraTopo titulo="Profissionais" onVoltar={() => navigation.goBack()} />
      <Busca placeholder="Buscar profissional..." valor={texto} aoDigitar={setTexto} />
      <Estado carregando={carregando} erro={erro} onTentar={recarregar} vazio={itens.length === 0} textoVazio="Nenhum profissional encontrado." iconeVazio="people-outline">
        {itens.map(({ p, r }) => (
          <Cartao key={p.id} onPress={() => navigation.navigate("Profissional", { id: p.id })} rotuloAcessibilidade={`${p.nome}. Ver perfil`}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Avatar nome={p.nome} id={p.id} tamanho={52} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{p.nome}</Text>
                {r.especialidades.length > 0 && <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e }}>{r.especialidades.join(", ")}</Text>}
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e, marginBottom: 4 }}>{r.clinica?.nome ?? "Sem clínica vinculada"}</Text>
                <Selo texto={r.disponivel ? "Disponível" : "Indisponível"} tom={r.disponivel ? "sucesso" : "neutro"} />
              </View>
            </View>
          </Cartao>
        ))}
      </Estado>
    </Tela>
  );
}
