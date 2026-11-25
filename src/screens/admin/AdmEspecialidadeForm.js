// Formulário "Nova especialidade".
import { useState } from "react";
import { Alerta, BarraTopo, Botao, Campo, Tela } from "../../components/ui.js";
import { LinhaStatus } from "../../components/admin.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { especialidadeService } from "../../services/especialidadeService.js";
import { normalizar } from "../../core/triagem.js";

export default function AdmEspecialidadeForm({ navigation }) {
  const { ocupado, executar } = useAcao();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [erroNome, setErroNome] = useState("");
  const [msg, setMsg] = useState("");

  // A checagem de nome repetido é só um atalho: o back-end também recusa duplicados.
  const { dados: existentes } = useCarregar(() => especialidadeService.listar({ apenasAtivas: false }).catch(() => []), []);

  async function salvar() {
    setMsg("");
    setErroNome("");
    const n = nome.trim();
    if (!n) return setErroNome("Informe o nome da especialidade.");
    if ((existentes ?? []).some((x) => normalizar(x.nome).trim() === normalizar(n))) return setErroNome("Já existe uma especialidade com este nome.");
    try {
      await executar(() => especialidadeService.criar({ nome: n, descricao: descricao.trim(), ativo }));
      navigation.goBack(); // a lista recarrega ao voltar
    } catch (err) {
      setMsg(/unique|duplic|already|nome/i.test(err.message) ? "Já existe uma especialidade com este nome." : err.message);
    }
  }

  return (
    <Tela>
      <BarraTopo titulo="Nova especialidade" onVoltar={() => navigation.goBack()} />
      <Campo rotulo="Nome da especialidade" value={nome} onChangeText={setNome} erro={erroNome} placeholder="Ex: Ortopedia" maxLength={100} />
      <Campo rotulo="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Descreva a especialidade..." maxLength={255} multiline numberOfLines={3} inputStyle={{ minHeight: 90, textAlignVertical: "top", paddingTop: 12 }} />
      <LinhaStatus valor={ativo} aoMudar={setAtivo} />
      {!!msg && <Alerta>{msg}</Alerta>}
      <Botao titulo={ocupado ? "Salvando..." : "Salvar especialidade"} ocupado={ocupado} onPress={salvar} />
    </Tela>
  );
}
