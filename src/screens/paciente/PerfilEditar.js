// Editar perfil: nome, telefone e e-mail do paciente (PUT /usuarios/:id). A foto ainda não tem suporte na API.
// Se o servidor não deixar o paciente alterar os próprios dados, volta 403 e a tela avisa.
import { useEffect, useState } from "react";
import { Alerta, AvisoLento, BarraTopo, Botao, Campo, Tela } from "../../components/ui.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { useAcao } from "../../hooks/useCarregar.js";
import { sessao } from "../../core/session.js";
import { pacienteApi, usuarioApi } from "../../services/usuarioService.js";
import { apenasDigitos, formatarTelefone } from "../../core/mascaras.js";

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function PerfilEditar({ navigation }) {
  const { usuario } = useSessao();
  const { ocupado, executar } = useAcao();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [erros, setErros] = useState({});
  const [msg, setMsg] = useState(null); // { tipo, texto }

  // O telefone não fica na sessão: vem do cadastro do paciente (o usuário vem embutido).
  useEffect(() => {
    if (!usuario?.idPaciente) return;
    pacienteApi.buscar(usuario.idPaciente).then((p) => p?.usuario && setTelefone(formatarTelefone(p.usuario.telefone ?? ""))).catch(() => {});
  }, [usuario?.idPaciente]);

  async function salvar() {
    const n = nome.trim().replace(/\s+/g, " ");
    const t = apenasDigitos(telefone);
    const m = email.trim().toLowerCase();
    const e = {
      nome: n.length < 3 ? "Informe seu nome completo." : "",
      telefone: t && t.length < 10 ? "Informe o telefone com DDD." : "",
      email: EMAIL_OK.test(m) ? "" : "Informe um e-mail válido.",
    };
    setErros(e);
    if (Object.values(e).some(Boolean)) return;
    setMsg(null);
    try {
      await executar(() => usuarioApi.atualizar(usuario.idUsuario, { nome: n, email: m, telefone: t || null }));
      await sessao.atualizar({ nome: n, email: m });
      setMsg({ tipo: "sucesso", texto: "Perfil atualizado." });
      setTimeout(() => navigation.goBack(), 800);
    } catch (err) {
      setMsg({ tipo: "erro", texto: err.status === 403 ? "O servidor ainda não permite alterar estes dados. Procure o atendimento." : err.message });
    }
  }

  return (
    <Tela>
      <BarraTopo titulo="Editar perfil" onVoltar={() => navigation.goBack()} />
      <AvisoLento />
      <Campo rotulo="Nome completo" value={nome} onChangeText={setNome} autoComplete="name" erro={erros.nome} />
      <Campo rotulo="Telefone" value={telefone} onChangeText={(v) => setTelefone(formatarTelefone(v))} keyboardType="phone-pad" maxLength={15} erro={erros.telefone} />
      <Campo rotulo="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} erro={erros.email} />
      {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}
      <Botao titulo={ocupado ? "Salvando..." : "Salvar alterações"} onPress={salvar} ocupado={ocupado} />
    </Tela>
  );
}
