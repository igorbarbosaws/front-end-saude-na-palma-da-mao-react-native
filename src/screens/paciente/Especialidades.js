// Especialidades (paciente): lista com busca. Cada cartão leva ao detalhe da especialidade.
import { useState } from "react";
import { BarraTopo, Tela } from "../../components/ui.js";
import { Estado, LinhaItem } from "../../components/comum.js";
import Busca from "../../components/Busca.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { iconeEspecialidade } from "../../core/profissionais.js";
import { normalizar } from "../../core/triagem.js";

export default function Especialidades({ navigation }) {
  const [texto, setTexto] = useState("");
  const { dados: cat, carregando, erro, recarregar } = useCarregar(() => carregarCatalogo(), []);
  const alvo = normalizar(texto);
  const itens = (cat?.especialidades ?? []).filter((e) => !alvo || normalizar(`${e.nome} ${e.descricao}`).includes(alvo));

  return (
    <Tela>
      <BarraTopo titulo="Especialidades" onVoltar={() => navigation.goBack()} />
      <Busca placeholder="Buscar especialidade..." valor={texto} aoDigitar={setTexto} />
      <Estado carregando={carregando} erro={erro} onTentar={recarregar} vazio={itens.length === 0} textoVazio="Nenhuma especialidade encontrada." iconeVazio="medkit-outline">
        {itens.map((e) => (
          <LinhaItem key={e.id} icone={iconeEspecialidade(e.nome)} titulo={e.nome} descricao={e.descricao || undefined} onPress={() => navigation.navigate("Especialidade", { id: e.id })} />
        ))}
      </Estado>
    </Tela>
  );
}
