// Lista de pacientes do administrador (somente leitura): busca por nome ou CPF.
import { useState } from "react";
import { Text, View } from "react-native";
import { AvisoLento, Tela } from "../../components/ui.js";
import { Avatar, Cartao, Estado, Selo } from "../../components/comum.js";
import { CabecalhoLista } from "../../components/admin.js";
import Busca from "../../components/Busca.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { pacienteService } from "../../services/pacienteService.js";
import { apenasDigitos, formatarCPF } from "../../core/mascaras.js";
import { normalizar } from "../../core/triagem.js";
import { fonte, useEscala, useTema } from "../../theme.js";

const nascimento = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? "")); // sem `new Date`: evita voltar um dia por causa do fuso
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
};
const cpf = (v) => (apenasDigitos(v).length === 11 ? formatarCPF(v) : (v ?? "—"));

export default function AdmPacientes({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const [busca, setBusca] = useState("");
  const { dados, carregando, erro, recarregar } = useCarregar(async () => (await pacienteService.listar()).sort((a, b) => a.id - b.id), []);

  const termo = normalizar(busca.trim());
  const digitos = apenasDigitos(busca);
  const lista = (dados ?? []).filter((p) => !termo || normalizar(p.usuario?.nome ?? "").includes(termo) || (digitos.length >= 3 && apenasDigitos(p.cpf).includes(digitos)));

  return (
    <Tela>
      <CabecalhoLista titulo="Pacientes" onVoltar={() => navigation.goBack()} />
      <AvisoLento />
      <Busca placeholder="Buscar paciente..." valor={busca} aoDigitar={setBusca} />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={lista.length === 0} textoVazio={dados?.length ? "Nenhum paciente encontrado." : "Nenhum paciente cadastrado."} iconeVazio="person-outline">
        {lista.map((p) => {
          const nome = p.usuario?.nome ?? `Paciente ${p.id}`;
          const ativo = p.usuario?.ativo !== false;
          return (
            <Cartao key={p.id}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar nome={nome} id={p.id} tamanho={48} />
                <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                  <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{nome}</Text>
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>CPF: {cpf(p.cpf)}</Text>
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>Nasc.: {nascimento(p.nascimento)}</Text>
                </View>
                <Selo texto={ativo ? "Ativo" : "Inativo"} tom={ativo ? "sucesso" : "neutro"} />
              </View>
            </Cartao>
          );
        })}
      </Estado>
    </Tela>
  );
}
