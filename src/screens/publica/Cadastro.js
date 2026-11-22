// Criar conta de paciente em 2 etapas:
//   1) dados pessoais (nome, CPF, nascimento)   2) contato e acesso (telefone, e-mail, senha)
import { useState } from "react";
import { Text, View } from "react-native";
import { Alerta, AvisoLento, BarraTopo, Botao, Campo, Texto, Titulo, Tela } from "../../components/ui.js";
import { authService } from "../../services/authService.js";
import { apenasDigitos, cpfValido, dataDigitadaParaISO, formatarCPF, formatarDataDigitada, formatarTelefone } from "../../core/mascaras.js";
import { espaco, useTema } from "../../theme.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Cadastro({ navigation }) {
  const c = useTema();
  const [etapa, setEtapa] = useState(1);
  const [f, setF] = useState({ nome: "", cpf: "", nascimento: "", telefone: "", email: "", senha: "", senha2: "" });
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [feito, setFeito] = useState(false);
  const campo = (k, formatar = (v) => v) => (v) => setF((a) => ({ ...a, [k]: formatar(v) }));

  // Mensagem de cada campo (vazia = válido). O botão só liga quando a etapa inteira é válida.
  const erros = {
    nome: f.nome.trim().length >= 3 ? "" : "Informe seu nome completo.",
    cpf: cpfValido(f.cpf) ? "" : "CPF inválido.",
    nascimento: dataDigitadaParaISO(f.nascimento) ? "" : "Use o formato DD/MM/AAAA.",
    telefone: apenasDigitos(f.telefone).length >= 10 ? "" : "Informe o telefone com DDD.",
    email: EMAIL.test(f.email.trim()) ? "" : "E-mail inválido.",
    senha: f.senha.length >= 6 ? "" : "A senha precisa de pelo menos 6 caracteres.",
    senha2: f.senha === f.senha2 ? "" : "As senhas não são iguais.",
  };
  const camposDaEtapa = etapa === 1 ? ["nome", "cpf", "nascimento"] : ["telefone", "email", "senha", "senha2"];
  const etapaValida = camposDaEtapa.every((k) => !erros[k]);
  // Só mostra o erro de um campo depois que a pessoa começou a preencher.
  const mostrar = (k) => (f[k] ? erros[k] : "");

  async function avancar() {
    if (!etapaValida) return;
    if (etapa === 1) {
      setErro("");
      setEtapa(2);
      return;
    }
    setErro("");
    setOcupado(true);
    try {
      await authService.registrarPaciente({
        nome: f.nome.trim(),
        email: f.email.trim(),
        senha: f.senha,
        telefone: apenasDigitos(f.telefone),
        cpf: f.cpf,
        nascimento: dataDigitadaParaISO(f.nascimento),
        sexo: "", // não coletado no design; a API aceita vazio
      });
      setFeito(true);
    } catch (e) {
      // E-mail ou CPF repetidos chegam como erro do banco (violação de unicidade).
      setErro(/unique|duplic|already|existe/i.test(e.message) ? "Já existe um cadastro com este e-mail ou CPF." : e.message);
    } finally {
      setOcupado(false);
    }
  }

  if (feito) {
    return (
      <Tela>
        <Titulo>Conta criada!</Titulo>
        <Alerta tipo="sucesso">Pronto! Agora faça login para continuar.</Alerta>
        <Botao titulo="Ir para o login" onPress={() => navigation.reset({ index: 1, routes: [{ name: "Inicio" }, { name: "Login", params: { perfil: "paciente" } }] })} />
      </Tela>
    );
  }

  return (
    <Tela>
      <BarraTopo titulo="Criar conta" onVoltar={() => (etapa > 1 ? setEtapa(etapa - 1) : navigation.goBack())} />
      <View style={{ alignSelf: "flex-start", backgroundColor: c.primariaClara, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: espaco.p }}>
        <Text style={{ color: c.primariaEscura, fontWeight: "700", fontSize: 14 }}>Etapa {etapa} de 2</Text>
      </View>
      <Titulo>{etapa === 1 ? "Seus dados pessoais" : "Contato e acesso"}</Titulo>
      <Texto suave style={{ marginBottom: espaco.g }}>{etapa === 1 ? "Preencha as informações abaixo" : "Quase lá! Só mais alguns dados."}</Texto>

      <AvisoLento />

      {etapa === 1 ? (
        <>
          <Campo rotulo="Nome completo" value={f.nome} onChangeText={campo("nome")} placeholder="Como você se chama" autoComplete="name" maxLength={150} erro={mostrar("nome")} />
          <Campo rotulo="CPF" value={f.cpf} onChangeText={campo("cpf", formatarCPF)} placeholder="000.000.000-00" keyboardType="number-pad" maxLength={14} erro={mostrar("cpf")} />
          <Campo rotulo="Data de nascimento" value={f.nascimento} onChangeText={campo("nascimento", formatarDataDigitada)} placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} erro={mostrar("nascimento")} />
        </>
      ) : (
        <>
          <Campo rotulo="Telefone" value={f.telefone} onChangeText={campo("telefone", formatarTelefone)} placeholder="(00) 00000-0000" keyboardType="phone-pad" maxLength={15} erro={mostrar("telefone")} />
          <Campo rotulo="E-mail" value={f.email} onChangeText={campo("email")} placeholder="seuemail@exemplo.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={150} erro={mostrar("email")} />
          <Campo rotulo="Senha" value={f.senha} onChangeText={campo("senha")} placeholder="Mínimo de 6 caracteres" secureTextEntry autoCapitalize="none" erro={mostrar("senha")} />
          <Campo rotulo="Confirmar senha" value={f.senha2} onChangeText={campo("senha2")} placeholder="Repita a senha" secureTextEntry autoCapitalize="none" erro={mostrar("senha2")} />
        </>
      )}

      {!!erro && <Alerta>{erro}</Alerta>}
      <Botao titulo={etapa === 1 ? "Continuar" : ocupado ? "Criando conta..." : "Criar conta"} onPress={avancar} desabilitado={!etapaValida} ocupado={ocupado} />
    </Tela>
  );
}
