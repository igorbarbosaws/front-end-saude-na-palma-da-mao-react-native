// Formulário de profissional: "Novo profissional" (sem params) e "Editar profissional" ({ id }). Mesmos campos nas duas.
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Alerta, BarraTopo, Botao, Campo, Tela, Texto } from "../../components/ui.js";
import { Chip, Estado, Secao } from "../../components/comum.js";
import { LinhaStatus } from "../../components/admin.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { profissionalService } from "../../services/profissionalService.js";
import { clinicaService } from "../../services/clinicaService.js";
import { especialidadeService } from "../../services/especialidadeService.js";
import { apenasDigitos, cpfValido, formatarCPF, formatarTelefone } from "../../core/mascaras.js";

const CONSELHOS = ["CRM", "CREFITO", "CRO"];

// "12345-PE" -> { registro: "12345", uf: "PE" } (aceita "/" no lugar do hífen); null se estiver fora do formato.
function lerRegistro(texto) {
  const m = /^\s*(\d{3,10})\s*[-/]\s*([A-Za-z]{2})\s*$/.exec(String(texto ?? ""));
  return m ? { registro: m[1], uf: m[2].toUpperCase() } : null;
}
// Mostra o registro como no placeholder, sem repetir a UF quando o registro já a traz.
const registroParaCampo = (registro, uf) => (!registro ? "" : !uf || new RegExp(`[-/]${uf}$`, "i").test(registro) ? String(registro) : `${registro}-${uf}`);

export default function AdmProfissionalForm({ navigation, route }) {
  const idEdicao = Number(route.params?.id) || null;
  const { ocupado, executar } = useAcao();
  const [f, setF] = useState({ nome: "", cpf: "", registro: "", telefone: "", email: "" });
  const [conselho, setConselho] = useState("CRM");
  const [idsEsp, setIdsEsp] = useState([]);
  const [idsClinicas, setIdsClinicas] = useState([]);
  const [ativo, setAtivo] = useState(true);
  const [erros, setErros] = useState({});
  const [msg, setMsg] = useState("");
  const [cpfOriginal, setCpfOriginal] = useState("");
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const [clinicas, especialidades, prof, vinculos, profEsp] = await Promise.all([
      clinicaService.listar({ apenasAtivas: false }),
      especialidadeService.listar({ apenasAtivas: false }),
      idEdicao ? profissionalService.buscar(idEdicao) : null,
      idEdicao ? profissionalService.listarVinculos({ apenasAtivos: true }) : [],
      idEdicao ? profissionalService.listarEspecialidades() : [],
    ]);
    if (idEdicao && !prof) throw new Error("Profissional não encontrado.");
    return { clinicas, especialidades, prof, vinculos, profEsp };
  }, [idEdicao]);

  // Preenche o formulário uma vez, quando o profissional chega.
  useEffect(() => {
    const p = dados?.prof;
    if (!p) return;
    setF({ nome: p.nome, cpf: formatarCPF(p.cpf), registro: registroParaCampo(p.registro, p.uf), telefone: formatarTelefone(p.telefone), email: p.email });
    setCpfOriginal(apenasDigitos(p.cpf));
    if (CONSELHOS.includes(String(p.conselho ?? "").toUpperCase())) setConselho(String(p.conselho).toUpperCase());
    setAtivo(p.ativo);
    setIdsEsp(dados.profEsp.filter((x) => x.idProfissional === idEdicao).map((x) => x.idEspecialidade));
    setIdsClinicas(dados.vinculos.filter((v) => v.idProfissional === idEdicao).map((v) => v.idClinica));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const alternar = (lista, setLista, id) => setLista(lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);
  // Clínicas inativas só aparecem se o profissional já estiver vinculado a elas.
  const clinicasVisiveis = (dados?.clinicas ?? []).filter((c) => c.ativo || idsClinicas.includes(c.id)).sort((a, b) => a.id - b.id);
  const especialidadesVisiveis = (dados?.especialidades ?? []).filter((x) => x.ativo || idsEsp.includes(x.id));

  async function salvar() {
    setMsg("");
    const e = {};
    const nome = f.nome.trim();
    if (!nome) e.nome = "Informe o nome completo.";
    const cpf = apenasDigitos(f.cpf);
    // CPF já gravado e não alterado não é revalidado (os dados de teste do banco usam CPFs fictícios).
    if (cpf.length !== 11 || (!(idEdicao && cpf === cpfOriginal) && !cpfValido(cpf))) e.cpf = "CPF inválido.";
    const reg = lerRegistro(f.registro);
    if (!reg) e.registro = "Use o formato 12345-PE (número e UF).";
    const tel = apenasDigitos(f.telefone);
    if (tel && tel.length < 10) e.telefone = "Telefone incompleto.";
    const email = f.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Informe um e-mail válido.";
    if (!idsEsp.length) e.especialidades = "Selecione ao menos uma especialidade.";
    if (!idsClinicas.length) e.clinicas = "Selecione ao menos uma clínica.";
    setErros(e);
    if (Object.keys(e).length) return;

    const corpo = { nome, email, telefone: f.telefone, cpf: f.cpf, conselho, registro: reg.registro, uf: reg.uf, ativo, idsClinicas, idsEspecialidades: idsEsp };
    try {
      if (idEdicao) await executar(() => profissionalService.atualizarPeloAdmin(idEdicao, { ...corpo, idUsuario: dados.prof.idUsuario }));
      else await executar(() => profissionalService.criarPeloAdmin(corpo));
      navigation.goBack(); // a lista recarrega ao voltar
    } catch (err) {
      setMsg(/unique|duplic|already|e-?mail|cpf/i.test(err.message) ? "Já existe um cadastro com este e-mail ou CPF." : err.message);
    }
  }

  return (
    <Tela>
      <BarraTopo titulo={idEdicao ? "Editar profissional" : "Novo profissional"} onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar}>
        {dados && (
          <>
            <Campo rotulo="Nome completo" value={f.nome} onChangeText={set("nome")} erro={erros.nome} maxLength={150} />
            <Campo rotulo="CPF" value={f.cpf} onChangeText={(v) => set("cpf")(formatarCPF(v))} erro={erros.cpf} placeholder="000.000.000-00" keyboardType="number-pad" maxLength={14} />
            <Secao titulo="Conselho">
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {CONSELHOS.map((x) => <Chip key={x} rotulo={x} ativo={conselho === x} onPress={() => setConselho(x)} />)}
              </View>
            </Secao>
            <Campo rotulo="Registro profissional" value={f.registro} onChangeText={set("registro")} erro={erros.registro} placeholder="Ex: 12345-PE" autoCapitalize="characters" maxLength={16} />

            <Secao titulo="Especialidades">
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {especialidadesVisiveis.map((x) => <Chip key={x.id} rotulo={x.nome} ativo={idsEsp.includes(x.id)} onPress={() => alternar(idsEsp, setIdsEsp, x.id)} />)}
              </View>
              {!!erros.especialidades && <Texto style={{ color: "#b3261e" }}>{erros.especialidades}</Texto>}
              {especialidadesVisiveis.length === 0 && <Texto suave>Nenhuma especialidade cadastrada. Cadastre em Especialidades.</Texto>}
            </Secao>

            <Campo rotulo="Telefone" value={f.telefone} onChangeText={(v) => set("telefone")(formatarTelefone(v))} erro={erros.telefone} keyboardType="phone-pad" maxLength={15} />
            <Campo rotulo="E-mail" value={f.email} onChangeText={set("email")} erro={erros.email} keyboardType="email-address" autoCapitalize="none" maxLength={150} />

            <Secao titulo="Clínicas vinculadas">
              <Texto suave style={{ marginBottom: 8 }}>Selecione uma ou mais clínicas</Texto>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {clinicasVisiveis.map((x) => <Chip key={x.id} rotulo={x.nome} ativo={idsClinicas.includes(x.id)} onPress={() => alternar(idsClinicas, setIdsClinicas, x.id)} />)}
              </View>
              {!!erros.clinicas && <Texto style={{ color: "#b3261e" }}>{erros.clinicas}</Texto>}
              {clinicasVisiveis.length === 0 && <Texto suave>Nenhuma clínica cadastrada.</Texto>}
            </Secao>

            <LinhaStatus valor={ativo} aoMudar={setAtivo} />
            {!idEdicao && <Texto suave style={{ marginBottom: 8 }}>A senha inicial do profissional é o CPF (somente números).</Texto>}
            {!!msg && <Alerta>{msg}</Alerta>}
            <Botao titulo={ocupado ? "Salvando..." : "Salvar profissional"} ocupado={ocupado} onPress={salvar} />
          </>
        )}
      </Estado>
    </Tela>
  );
}
