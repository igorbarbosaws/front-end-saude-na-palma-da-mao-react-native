// Formulário de clínica: "Nova clínica" (sem params) e "Editar clínica" ({ id }). Mesmos campos nas duas.
import { useEffect, useState } from "react";
import { Alerta, BarraTopo, Botao, Campo, Tela, Texto } from "../../components/ui.js";
import { Chip, Estado, Secao } from "../../components/comum.js";
import { LinhaStatus } from "../../components/admin.js";
import Busca from "../../components/Busca.js";
import { View } from "react-native";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { clinicaService } from "../../services/clinicaService.js";
import { especialidadeService } from "../../services/especialidadeService.js";
import { apenasDigitos, formatarCNPJ, formatarTelefone } from "../../core/mascaras.js";
import { normalizar } from "../../core/triagem.js";

export default function AdmClinicaForm({ navigation, route }) {
  const idEdicao = Number(route.params?.id) || null;
  const { ocupado, executar } = useAcao();
  const [f, setF] = useState({ nome: "", cnpj: "", endereco: "", telefone: "", email: "", horario: "" });
  const [escolhidas, setEscolhidas] = useState([]);
  const [ativo, setAtivo] = useState(true);
  const [buscaEsp, setBuscaEsp] = useState("");
  const [erros, setErros] = useState({});
  const [msg, setMsg] = useState("");
  const [antes, setAntes] = useState([]);
  const [enderecoOriginal, setEnderecoOriginal] = useState("");
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const [especialidades, vinculos, clinica] = await Promise.all([
      especialidadeService.listar({ apenasAtivas: true }),
      idEdicao ? clinicaService.listarEspecialidades() : [],
      idEdicao ? clinicaService.buscar(idEdicao) : null,
    ]);
    return { especialidades: especialidades.sort((a, b) => a.id - b.id), vinculos, clinica };
  }, [idEdicao]);

  // Preenche o formulário uma vez, quando a clínica chega.
  useEffect(() => {
    if (!dados?.clinica) return;
    const cl = dados.clinica;
    setF({ nome: cl.nome, cnpj: formatarCNPJ(cl.cnpj ?? ""), endereco: cl.endereco ?? "", telefone: formatarTelefone(cl.telefone), email: cl.email ?? "", horario: "" });
    setEnderecoOriginal(cl.endereco ?? "");
    setAtivo(cl.ativo);
    const atuais = dados.vinculos.filter((v) => v.idClinica === idEdicao).map((v) => v.idEspecialidade);
    setAntes(atuais);
    setEscolhidas(atuais);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const alternarEsp = (id) => setEscolhidas((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const termo = normalizar(buscaEsp.trim());
  const espVisiveis = (dados?.especialidades ?? []).filter((x) => !termo || normalizar(x.nome).includes(termo));

  async function salvar() {
    setMsg("");
    const e = {};
    const nome = f.nome.trim();
    if (!nome) e.nome = "Informe o nome da clínica.";
    // Só confere os 14 dígitos: os dados de teste usam CNPJs fictícios.
    if (apenasDigitos(f.cnpj).length !== 14) e.cnpj = "CNPJ incompleto. Informe os 14 dígitos.";
    const email = f.email.trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "E-mail inválido.";
    const tel = apenasDigitos(f.telefone);
    if (tel && tel.length < 10) e.telefone = "Telefone incompleto.";
    setErros(e);
    if (Object.keys(e).length) return;

    const corpo = { nome, cnpj: f.cnpj, endereco: f.endereco.trim(), telefone: f.telefone, email, ativo };
    try {
      if (idEdicao) {
        const mudou = corpo.endereco !== enderecoOriginal;
        if (!mudou) delete corpo.endereco; // endereço igual: não envia (preserva número, bairro, cidade e UF já gravados)
        await executar(() => clinicaService.atualizar(idEdicao, corpo, { antes, depois: escolhidas, enderecoMudou: mudou }));
      } else {
        await executar(() => clinicaService.criar(corpo, escolhidas));
      }
      navigation.goBack(); // a lista recarrega ao voltar
    } catch (err) {
      setMsg(/cnpj|unique|duplic|already/i.test(err.message) ? "Já existe uma clínica com este CNPJ." : err.message);
    }
  }

  return (
    <Tela>
      <BarraTopo titulo={idEdicao ? "Editar clínica" : "Nova clínica"} onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar}>
        {dados && (
          <>
            <Campo rotulo="Nome da clínica" value={f.nome} onChangeText={set("nome")} erro={erros.nome} placeholder="Ex: Clínica Ortopédica Central" maxLength={150} />
            <Campo rotulo="CNPJ" value={f.cnpj} onChangeText={(v) => set("cnpj")(formatarCNPJ(v))} erro={erros.cnpj} placeholder="00.000.000/0000-00" keyboardType="number-pad" maxLength={18} />
            <Campo rotulo="Endereço completo" value={f.endereco} onChangeText={set("endereco")} placeholder="Rua, número, bairro, cidade" maxLength={180} />
            <Campo rotulo="Telefone" value={f.telefone} onChangeText={(v) => set("telefone")(formatarTelefone(v))} erro={erros.telefone} placeholder="(00) 0000-0000" keyboardType="phone-pad" maxLength={15} />
            <Campo rotulo="E-mail" value={f.email} onChangeText={set("email")} erro={erros.email} placeholder="contato@clinica.com.br" keyboardType="email-address" autoCapitalize="none" maxLength={150} />
            {/* O back-end ainda não tem a coluna de horário de funcionamento: o campo existe no design, mas não é gravado. */}
            <Campo rotulo="Horário de funcionamento" value={f.horario} onChangeText={set("horario")} placeholder="Seg–Sex: 08h–18h" />

            <Secao titulo="Especialidades atendidas">
              <Busca placeholder="Buscar especialidade..." valor={buscaEsp} aoDigitar={setBuscaEsp} />
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {espVisiveis.map((x) => <Chip key={x.id} rotulo={x.nome} ativo={escolhidas.includes(x.id)} onPress={() => alternarEsp(x.id)} />)}
              </View>
              {espVisiveis.length === 0 && <Texto suave>Nenhuma especialidade encontrada.</Texto>}
            </Secao>

            <LinhaStatus valor={ativo} aoMudar={setAtivo} />
            {!!msg && <Alerta>{msg}</Alerta>}
            <Botao titulo={ocupado ? "Salvando..." : "Salvar clínica"} ocupado={ocupado} onPress={salvar} />
          </>
        )}
      </Estado>
    </Tela>
  );
}
