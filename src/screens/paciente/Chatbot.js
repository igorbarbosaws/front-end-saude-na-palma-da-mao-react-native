// Conversa com a TrIA: interface de chat para o paciente descrever o que sente em linguagem natural.
// Fala com o back-end (IA) por services/triagemService.js; sem o endpoint, usa as regras locais (plano B).
// O áudio do MVP web não entrou nesta versão (precisaria do módulo expo-av e de um endpoint de transcrição).
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Alerta, BarraTopo, Botao } from "../../components/ui.js";
import { Chip } from "../../components/comum.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { SINTOMAS, contextoParaTexto, triagemService } from "../../services/triagemService.js";
import { ALVO_MINIMO, espaco, fonte, raio, useEscala, useTema } from "../../theme.js";

const LIMITE = 500;
const SAUDACAO = "Olá! Sou a TrIA. Estou aqui para te ajudar a entender o que está acontecendo e indicar o melhor caminho para o seu atendimento.";
const PERGUNTA = "O que está te incomodando? Pode descrever com suas palavras ou escolher uma das opções abaixo.";

function Balao({ papel, texto }) {
  const c = useTema();
  const e = useEscala();
  const meu = papel === "usuario";
  return (
    <View style={{ alignSelf: meu ? "flex-end" : "flex-start", maxWidth: "85%", marginBottom: 10 }}>
      <View style={{ backgroundColor: meu ? c.primaria : c.superficie, borderWidth: meu ? 0 : 1.5, borderColor: c.borda, borderRadius: raio, padding: 12 }}>
        <Text style={{ color: meu ? c.sobrePrimaria : c.texto, fontSize: fonte.corpo * e, lineHeight: 24 * e }}>{texto}</Text>
      </View>
    </View>
  );
}

export default function Chatbot({ navigation, route }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const contexto = route.params?.contexto ?? null;
  const rolagem = useRef(null);
  const iniciou = useRef(false);

  const [mensagens, setMensagens] = useState([{ papel: "tria", texto: SAUDACAO }]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [idPreTriagem, setIdPreTriagem] = useState(null);
  const [resultado, setResultado] = useState(null); // quando a TrIA conclui
  const [mostrarChips, setMostrarChips] = useState(!contexto);

  const textosDoUsuario = mensagens.filter((m) => m.papel === "usuario").map((m) => m.texto);

  async function enviar(mensagem, { comContexto = false } = {}) {
    const msg = String(mensagem).trim();
    if (!msg || enviando) return;
    setErro("");
    setMostrarChips(false);
    setMensagens((m) => [...m, { papel: "usuario", texto: msg }]);
    setTexto("");
    setEnviando(true);
    try {
      const r = await triagemService.conversar({
        idPaciente: usuario?.idPaciente,
        idPreTriagem,
        mensagem: msg,
        contexto: comContexto ? contexto : null,
        textosAnteriores: textosDoUsuario,
      });
      if (r.idPreTriagem) setIdPreTriagem(r.idPreTriagem);
      setMensagens((m) => [...m, { papel: "tria", texto: r.resposta }]);
      if (r.concluida && r.resultado) setResultado({ ...r.resultado, idPreTriagem: r.idPreTriagem });
    } catch (err) {
      setErro(err.message || "Não foi possível falar com a TrIA agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  // Veio do formulário: o resumo do que o paciente marcou é a primeira mensagem.
  useEffect(() => {
    if (contexto && !iniciou.current) {
      iniciou.current = true;
      enviar(contextoParaTexto(contexto) || "Gostaria de uma orientação.", { comContexto: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function recomecar() {
    setMensagens([{ papel: "tria", texto: SAUDACAO }]);
    setResultado(null);
    setIdPreTriagem(null);
    setErro("");
    setMostrarChips(true);
  }

  function verResultado() {
    navigation.navigate("PreTriagemResultado", { resultado, idPreTriagem: resultado.idPreTriagem });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fundo }} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ paddingHorizontal: espaco.m, paddingTop: espaco.m }}>
          <BarraTopo
            titulo="TrIA"
            onVoltar={() => navigation.goBack()}
            direita={
              <Pressable accessibilityRole="button" accessibilityLabel="Recomeçar conversa" onPress={recomecar} style={{ width: ALVO_MINIMO, height: ALVO_MINIMO, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="refresh-outline" size={24} color={c.primariaEscura} />
              </Pressable>
            }
          />
        </View>

        <ScrollView ref={rolagem} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: espaco.m, flexGrow: 1 }}
          onContentSizeChange={() => rolagem.current?.scrollToEnd({ animated: true })}>
          {mensagens.map((m, i) => <Balao key={i} papel={m.papel} texto={m.texto} />)}

          {mostrarChips && (
            <>
              <Balao papel="tria" texto={PERGUNTA} />
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {SINTOMAS.map(([chave, rotulo]) => <Chip key={chave} rotulo={rotulo} onPress={() => enviar(rotulo)} />)}
              </View>
            </>
          )}

          {enviando && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <ActivityIndicator color={c.primaria} />
              <Text style={{ color: c.textoSuave, marginLeft: 8, fontSize: fonte.pequena * e }}>TrIA está digitando...</Text>
            </View>
          )}

          {!!erro && <Alerta>{erro}</Alerta>}

          {resultado && (
            <View style={{ backgroundColor: c.primariaClara, borderRadius: raio, padding: espaco.m, marginTop: 8 }}>
              <Text accessibilityRole="header" style={{ color: c.primariaEscura, fontSize: fonte.corpo * e, fontWeight: "700", marginBottom: 4 }}>Resultado da triagem disponível</Text>
              <Text style={{ color: c.texto, fontSize: fonte.pequena * e + 1, marginBottom: 12 }}>Você pode continuar conversando abaixo ou ver o resultado agora.</Text>
              <Botao titulo="Ver resultado da triagem" onPress={verResultado} />
            </View>
          )}
        </ScrollView>

        <View style={{ flexDirection: "row", alignItems: "flex-end", padding: espaco.p + 4, borderTopWidth: 1, borderTopColor: c.borda, backgroundColor: c.superficie }}>
          <TextInput
            accessibilityLabel="Digite o que está sentindo"
            value={texto}
            onChangeText={setTexto}
            placeholder="Digite o que está sentindo..."
            placeholderTextColor={c.textoSuave}
            multiline
            maxLength={LIMITE}
            editable={!enviando}
            style={{ flex: 1, maxHeight: 120, minHeight: ALVO_MINIMO, borderWidth: 1.5, borderColor: c.borda, borderRadius: raio, paddingHorizontal: 14, paddingTop: 12, fontSize: fonte.corpo * e, color: c.texto, backgroundColor: c.fundo }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar"
            accessibilityState={{ disabled: !texto.trim() || enviando }}
            disabled={!texto.trim() || enviando}
            onPress={() => enviar(texto)}
            style={{ width: ALVO_MINIMO, height: ALVO_MINIMO, borderRadius: ALVO_MINIMO / 2, marginLeft: 8, alignItems: "center", justifyContent: "center", backgroundColor: !texto.trim() || enviando ? c.desabilitado : c.primaria }}>
            <Ionicons name="send" size={20} color={!texto.trim() || enviando ? c.desabilitadoTexto : c.sobrePrimaria} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
