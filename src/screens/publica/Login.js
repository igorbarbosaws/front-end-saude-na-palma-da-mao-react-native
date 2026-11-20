// Login por e-mail ou CPF. O perfil escolhido na tela anterior restringe quem pode entrar.
import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Alerta, AvisoLento, BarraTopo, Botao, Campo, Texto, Titulo, Tela } from "../../components/ui.js";
import { authService } from "../../services/authService.js";
import { sessao } from "../../core/session.js";
import { PERFIL_ESCOLHIDO, PERFIS } from "../../core/guard.js";
import { espaco, useTema } from "../../theme.js";

export default function Login({ navigation, route }) {
  const c = useTema();
  const perfil = PERFIL_ESCOLHIDO[route.params?.perfil];
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function entrar() {
    setErro("");
    if (!identificador.trim() || !senha) {
      setErro("Informe seu e-mail ou CPF e a senha.");
      return;
    }
    setOcupado(true);
    try {
      const dados = await authService.login(identificador, senha, { lembrar });
      // Conta de outro tipo: desfaz a sessão (o navegador já teria trocado para o perfil errado).
      if (perfil && dados.tipo !== perfil.tipo) {
        await sessao.limpar();
        setErro(`Esta conta não é de ${perfil.nome}. Volte e escolha o perfil correto.`);
      }
      // Se deu certo, a sessão mudou e a navegação troca de perfil sozinha.
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  const embreve = (t) => setAviso(`${t} ainda não está disponível. Procure o atendimento.`);

  return (
    <Tela>
      <BarraTopo titulo="Voltar" onVoltar={() => navigation.goBack()} />
      <Titulo>Entrar{perfil ? ` como ${perfil.nome}` : ""}</Titulo>
      <Texto suave style={{ marginBottom: espaco.g }}>Use seu e-mail ou CPF e sua senha.</Texto>

      <AvisoLento />
      {!!aviso && <Alerta tipo="aviso">{aviso}</Alerta>}

      <Campo rotulo="E-mail ou CPF" value={identificador} onChangeText={setIdentificador} placeholder="seuemail@exemplo.com"
        autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="username" autoComplete="username" />
      <Campo rotulo="Senha" value={senha} onChangeText={setSenha} placeholder="Senha" secureTextEntry autoCapitalize="none"
        textContentType="password" autoComplete="password" onSubmitEditing={entrar} />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: espaco.m }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Switch value={lembrar} onValueChange={setLembrar} trackColor={{ true: c.primaria }} accessibilityLabel="Lembrar senha" />
          <Text style={{ color: c.texto, fontSize: 16, marginLeft: 8 }}>Lembrar acesso</Text>
        </View>
        <Pressable accessibilityRole="link" onPress={() => embreve("Recuperação de senha")} style={{ minHeight: 48, justifyContent: "center" }}>
          <Text style={{ color: c.primariaEscura, fontSize: 16, fontWeight: "600" }}>Esqueceu a senha?</Text>
        </Pressable>
      </View>

      {!!erro && <Alerta>{erro}</Alerta>}
      <Botao titulo={ocupado ? "Entrando..." : "Entrar"} onPress={entrar} ocupado={ocupado} />
      <Botao titulo="Entrar com o Google" variante="contorno" onPress={() => embreve("Entrar com o Google")} style={{ marginTop: espaco.m }} />

      {/* Só paciente se cadastra sozinho; profissional e administrador são criados pelo administrador. */}
      {(!perfil || perfil.tipo === PERFIS.PACIENTE) && (
        <Pressable accessibilityRole="link" onPress={() => navigation.navigate("Cadastro")} style={{ minHeight: 48, justifyContent: "center", alignItems: "center", marginTop: espaco.m }}>
          <Text style={{ color: c.texto, fontSize: 16 }}>
            Ainda não tem uma conta? <Text style={{ color: c.primariaEscura, fontWeight: "700" }}>Cadastre-se</Text>
          </Text>
        </Pressable>
      )}
    </Tela>
  );
}
