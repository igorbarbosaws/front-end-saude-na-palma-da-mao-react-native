// Lista de especialidades do administrador: adicionar e apagar (com confirmação).
import { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alerta, AvisoLento, Botao, Tela } from "../../components/ui.js";
import { Cartao, Confirmar, Estado, Selo } from "../../components/comum.js";
import { CabecalhoLista } from "../../components/admin.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { especialidadeService } from "../../services/especialidadeService.js";
import { iconeEspecialidade } from "../../core/profissionais.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function AdmEspecialidades({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { ocupado, executar } = useAcao();
  const [alvo, setAlvo] = useState(null);
  const [msg, setMsg] = useState(null);
  const { dados, carregando, erro, recarregar } = useCarregar(async () => (await especialidadeService.listar({ apenasAtivas: false })).sort((a, b) => a.id - b.id), []);

  async function apagar() {
    const x = alvo;
    try {
      await executar(async () => {
        const uso = await especialidadeService.contarUso(x.id);
        if (uso.clinicas || uso.profissionais) {
          const partes = [];
          if (uso.clinicas) partes.push(`${uso.clinicas} ${uso.clinicas === 1 ? "clínica" : "clínicas"}`);
          if (uso.profissionais) partes.push(`${uso.profissionais} ${uso.profissionais === 1 ? "profissional" : "profissionais"}`);
          throw new Error(`"${x.nome}" está em uso por ${partes.join(" e ")}. Remova esses vínculos antes de apagar.`);
        }
        await especialidadeService.remover(x.id);
      });
      setMsg({ tipo: "sucesso", texto: "Especialidade apagada." });
      setAlvo(null);
      recarregar();
    } catch (err) {
      setAlvo(null);
      setMsg({ tipo: "erro", texto: err.message });
    }
  }

  return (
    <Tela>
      <CabecalhoLista titulo="Especialidades" onVoltar={() => navigation.goBack()} onAdicionar={() => navigation.navigate("AdmEspecialidadeForm")} />
      <AvisoLento />
      {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={dados?.length === 0} textoVazio="Nenhuma especialidade cadastrada." iconeVazio="medkit-outline">
        {dados?.map((x) => (
          <Cartao key={x.id}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name={iconeEspecialidade(x.nome)} size={28} color={c.primaria} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{x.nome}</Text>
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }} numberOfLines={2}>{x.descricao || "Sem descrição"}</Text>
              </View>
              <Selo texto={x.ativo ? "Ativa" : "Inativa"} tom={x.ativo ? "sucesso" : "neutro"} />
            </View>
            <Botao titulo="Apagar" variante="perigo" onPress={() => { setMsg(null); setAlvo(x); }} style={{ marginTop: 10 }} />
          </Cartao>
        ))}
      </Estado>
      <Confirmar visivel={!!alvo} titulo="Apagar especialidade?" mensagem="Esta ação não pode ser desfeita." textoOk="Apagar" perigo ocupado={ocupado} onConfirmar={apagar} onCancelar={() => setAlvo(null)} />
    </Tela>
  );
}
