// Clínicas (paciente): lista com busca. Cada cartão leva aos detalhes da clínica.
// O Figma mostra distância e horário, mas a API não tem esses dados: no lugar vão as especialidades.
import { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarraTopo, Tela } from "../../components/ui.js";
import { Cartao, Estado, Selo } from "../../components/comum.js";
import Busca from "../../components/Busca.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { carregarCatalogo, nomesDasEspecialidades } from "../../core/catalogo.js";
import { normalizar } from "../../core/triagem.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function Clinicas({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const [texto, setTexto] = useState("");
  const { dados: cat, carregando, erro, recarregar } = useCarregar(() => carregarCatalogo({ incluirInativos: true }), []);

  const alvo = normalizar(texto);
  const itens = (cat?.clinicas ?? []).filter((x) => !alvo || normalizar(`${x.nome} ${x.endereco}`).includes(alvo));

  return (
    <Tela>
      <BarraTopo titulo="Clínicas" onVoltar={() => navigation.goBack()} />
      <Busca placeholder="Buscar clínica..." valor={texto} aoDigitar={setTexto} />
      <Estado carregando={carregando} erro={erro} onTentar={recarregar} vazio={itens.length === 0} textoVazio="Nenhuma clínica encontrada." iconeVazio="business-outline">
        {itens.map((cl) => {
          const ids = cat.clinEsp.filter((x) => x.idClinica === cl.id).map((x) => x.idEspecialidade);
          const esp = nomesDasEspecialidades(cat, ids);
          return (
            <Cartao key={cl.id} onPress={() => navigation.navigate("Clinica", { id: cl.id })} rotuloAcessibilidade={`${cl.nome}. Ver detalhes`}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="business-outline" size={32} color={c.primariaEscura} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{cl.nome}</Text>
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{[cl.ruaNumero, cl.cidadeUf].filter(Boolean).join(", ") || "Endereço não informado"}</Text>
                  {!!esp && <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e, marginTop: 2 }}>{esp}</Text>}
                  {!cl.ativo && <View style={{ marginTop: 6 }}><Selo texto="Inativa" tom="erro" /></View>}
                </View>
                <Ionicons name="chevron-forward" size={20} color={c.textoSuave} />
              </View>
            </Cartao>
          );
        })}
      </Estado>
    </Tela>
  );
}
