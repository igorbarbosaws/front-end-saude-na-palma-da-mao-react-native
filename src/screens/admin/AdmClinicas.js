// Lista de clínicas do administrador: busca, editar e ativar/desativar.
import { useState } from "react";
import { Text, View } from "react-native";
import { Alerta, AvisoLento, Botao, Tela } from "../../components/ui.js";
import { Cartao, Confirmar, Estado, Selo } from "../../components/comum.js";
import { CabecalhoLista } from "../../components/admin.js";
import Busca from "../../components/Busca.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { clinicaService } from "../../services/clinicaService.js";
import { normalizar } from "../../core/triagem.js";
import { fonte, useEscala, useTema } from "../../theme.js";

const endereco = (c) => [c.ruaNumero, c.cidadeUf].filter(Boolean).join(", ") || "Endereço não informado";

export default function AdmClinicas({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { ocupado, executar } = useAcao();
  const [busca, setBusca] = useState("");
  const [alvo, setAlvo] = useState(null);
  const [msg, setMsg] = useState(null);

  const { dados, carregando, erro, recarregar } = useCarregar(async () => (await clinicaService.listar({ apenasAtivas: false })).sort((a, b) => a.id - b.id), []);
  const termo = normalizar(busca.trim());
  const lista = (dados ?? []).filter((x) => !termo || normalizar(`${x.nome} ${x.cnpj} ${endereco(x)}`).includes(termo));

  async function alternar(x, ativo) {
    setMsg(null);
    try {
      await executar(() => clinicaService.alterarAtivo(x.id, ativo));
      setMsg({ tipo: "sucesso", texto: ativo ? "Clínica ativada." : "Clínica desativada." });
      setAlvo(null);
      recarregar();
    } catch (err) {
      setAlvo(null);
      setMsg({ tipo: "erro", texto: err.message });
    }
  }

  return (
    <Tela>
      <CabecalhoLista titulo="Clínicas" onVoltar={() => navigation.goBack()} onAdicionar={() => navigation.navigate("AdmClinicaForm", {})} />
      <AvisoLento />
      <Busca placeholder="Buscar clínica..." valor={busca} aoDigitar={setBusca} />
      {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={lista.length === 0} textoVazio={dados?.length ? "Nenhuma clínica encontrada." : "Nenhuma clínica cadastrada."} iconeVazio="business-outline">
        {lista.map((x) => (
          <Cartao key={x.id} style={x.ativo ? undefined : { opacity: 0.7 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text accessibilityRole="header" style={{ flex: 1, color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700", paddingRight: 8 }}>{x.nome}</Text>
              <Selo texto={x.ativo ? "Ativa" : "Desativada"} tom={x.ativo ? "sucesso" : "neutro"} />
            </View>
            {x.ativo && (
              <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1, marginTop: 4 }}>{endereco(x)}{"\n"}CNPJ: {x.cnpj ?? "—"}</Text>
            )}
            <View style={{ marginTop: 10 }}>
              {x.ativo ? (
                <>
                  <Botao titulo="Editar" variante="contorno" onPress={() => navigation.navigate("AdmClinicaForm", { id: x.id })} />
                  <Botao titulo="Desativar" variante="perigo" onPress={() => setAlvo(x)} style={{ marginTop: 8 }} />
                </>
              ) : (
                <Botao titulo="Reativar" ocupado={ocupado} onPress={() => alternar(x, true)} />
              )}
            </View>
          </Cartao>
        ))}
      </Estado>
      <Confirmar visivel={!!alvo} titulo="Desativar clínica?" mensagem={`Desativar a clínica "${alvo?.nome}"? Ela deixa de aparecer para os pacientes.`} textoOk="Desativar" perigo ocupado={ocupado}
        onConfirmar={() => alternar(alvo, false)} onCancelar={() => setAlvo(null)} />
    </Tela>
  );
}
