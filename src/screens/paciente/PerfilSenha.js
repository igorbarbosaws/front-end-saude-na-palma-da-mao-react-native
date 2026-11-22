// Alterar senha do paciente. A tela valida os campos, mas o servidor ainda não tem rota para o paciente trocar a própria
// senha (PUT /usuarios é só do administrador e não faz o hash). Quando existir, o envio entra no fim de `salvar` (hoje só avisa).
import { useState } from "react";
import { Alerta, BarraTopo, Botao, Campo, Tela } from "../../components/ui.js";

const MINIMO = 8;

export default function PerfilSenha({ navigation }) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState("");

  const preenchido = atual !== "" && nova !== "" && confirmacao !== "";

  function salvar() {
    const e = {
      nova: nova.length < MINIMO ? `A nova senha precisa ter pelo menos ${MINIMO} caracteres.` : nova === atual ? "A nova senha deve ser diferente da atual." : "",
      confirmacao: confirmacao !== nova ? "As senhas não são iguais." : "",
    };
    setErros(e);
    if (Object.values(e).some(Boolean)) return;
    setAviso("A troca de senha ainda não está disponível no servidor. Em breve!");
  }

  return (
    <Tela>
      <BarraTopo titulo="Alterar senha" onVoltar={() => navigation.goBack()} />
      <Campo rotulo="Senha atual" value={atual} onChangeText={setAtual} secureTextEntry autoCapitalize="none" />
      <Campo rotulo="Nova senha" value={nova} onChangeText={setNova} secureTextEntry autoCapitalize="none" placeholder={`Mínimo ${MINIMO} caracteres`} erro={erros.nova} />
      <Campo rotulo="Confirmar nova senha" value={confirmacao} onChangeText={setConfirmacao} secureTextEntry autoCapitalize="none" placeholder="Repita a nova senha" erro={erros.confirmacao} />
      {!!aviso && <Alerta tipo="aviso">{aviso}</Alerta>}
      <Botao titulo="Salvar nova senha" onPress={salvar} desabilitado={!preenchido} />
    </Tela>
  );
}
