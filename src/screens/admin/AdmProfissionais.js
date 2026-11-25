// Lista de profissionais do administrador: busca, editar e ativar/desativar.
import { useState } from "react";
import { Text, View } from "react-native";
import { Alerta, AvisoLento, Botao, Tela } from "../../components/ui.js";
import { Avatar, Cartao, Confirmar, Estado, Selo } from "../../components/comum.js";
import { CabecalhoLista } from "../../components/admin.js";
import Busca from "../../components/Busca.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { profissionalService } from "../../services/profissionalService.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { normalizar } from "../../core/triagem.js";
import { fonte, useEscala, useTema } from "../../theme.js";

// "CRM 12345-PE" (não repete a UF se o registro já terminar com ela)
const registro = (p) => {
  const num = p.registro && p.uf && !String(p.registro).toUpperCase().endsWith(`-${p.uf.toUpperCase()}`) ? `${p.registro}-${p.uf}` : (p.registro ?? "");
  return [p.conselho, num].filter(Boolean).join(" ");
};

export default function AdmProfissionais({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { ocupado, executar } = useAcao();
  const [busca, setBusca] = useState("");
  const [alvo, setAlvo] = useState(null);
  const [msg, setMsg] = useState(null);

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const cat = await carregarCatalogo({ incluirInativos: true });
    const especialidades = (id) => cat.profEsp.filter((x) => x.idProfissional === id).map((x) => cat.especialidadePorId.get(x.idEspecialidade)?.nome).filter(Boolean).join(", ");
    const clinica = (id) => {
      const v = cat.vinculos.find((x) => x.idProfissional === id && x.ativo) ?? cat.vinculos.find((x) => x.idProfissional === id);
      return v ? cat.clinicaPorId.get(v.idClinica)?.nome : "";
    };
    return [...cat.profissionais].sort((a, b) => a.id - b.id).map((p) => ({ ...p, especialidadesTexto: especialidades(p.id), clinicaTexto: clinica(p.id) }));
  }, []);

  const termo = normalizar(busca.trim());
  const lista = (dados ?? []).filter((p) => !termo || normalizar(`${p.nome} ${p.especialidadesTexto} ${registro(p)} ${p.clinicaTexto}`).includes(termo));

  async function alternar(p, ativo) {
    setMsg(null);
    try {
      await executar(() => profissionalService.alterarAtivo(p.id, ativo));
      setMsg({ tipo: "sucesso", texto: ativo ? "Profissional ativado." : "Profissional desativado." });
      setAlvo(null);
      recarregar();
    } catch (err) {
      setAlvo(null);
      setMsg({ tipo: "erro", texto: err.message });
    }
  }

  return (
    <Tela>
      <CabecalhoLista titulo="Profissionais" onVoltar={() => navigation.goBack()} onAdicionar={() => navigation.navigate("AdmProfissionalForm", {})} />
      <AvisoLento />
      <Busca placeholder="Buscar profissional..." valor={busca} aoDigitar={setBusca} />
      {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={lista.length === 0} textoVazio={dados?.length ? "Nenhum profissional encontrado." : "Nenhum profissional cadastrado."} iconeVazio="people-outline">
        {lista.map((p) => (
          <Cartao key={p.id}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Avatar nome={p.nome} id={p.id} tamanho={48} />
              <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{p.nome}</Text>
                <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e + 1 }}>{p.especialidadesTexto || "Sem especialidade"}</Text>
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{registro(p)}</Text>
              </View>
              <Selo texto={p.ativo ? "Ativo" : "Inativo"} tom={p.ativo ? "sucesso" : "neutro"} />
            </View>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1, marginTop: 8 }}>{p.clinicaTexto || "Sem clínica vinculada"}</Text>
            <View style={{ marginTop: 10 }}>
              <Botao titulo="Editar" variante="contorno" onPress={() => navigation.navigate("AdmProfissionalForm", { id: p.id })} />
              {p.ativo ? <Botao titulo="Desativar" variante="perigo" onPress={() => setAlvo(p)} style={{ marginTop: 8 }} /> : <Botao titulo="Ativar" ocupado={ocupado} onPress={() => alternar(p, true)} style={{ marginTop: 8 }} />}
            </View>
          </Cartao>
        ))}
      </Estado>
      <Confirmar visivel={!!alvo} titulo="Desativar profissional?" mensagem={`Desativar ${alvo?.nome}? Ele deixa de aparecer para agendamento.`} textoOk="Desativar" perigo ocupado={ocupado}
        onConfirmar={() => alternar(alvo, false)} onCancelar={() => setAlvo(null)} />
    </Tela>
  );
}
