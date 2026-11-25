// Preferências de notificação do administrador.
// O back-end ainda não tem tabela de preferências: as escolhas ficam salvas só neste aparelho (AsyncStorage).
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tela, Titulo } from "../../components/ui.js";
import { Cartao } from "../../components/comum.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { fonte, useEscala, useTema } from "../../theme.js";

const OPCOES = [
  { chave: "confirmacoes", titulo: "Confirmações de consulta", texto: "Receba notificações quando uma consulta for confirmada", padrao: true },
  { chave: "lembretes", titulo: "Lembretes", texto: "Lembrete 24h antes da sua consulta", padrao: true },
  { chave: "novidades", titulo: "Novidades", texto: "Informações sobre novas funcionalidades", padrao: false },
];

export default function AdmNotificacoes() {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const guardada = `spm_adm_notificacoes_${usuario?.idUsuario}`;
  const [valores, setValores] = useState(Object.fromEntries(OPCOES.map((o) => [o.chave, o.padrao])));

  useEffect(() => {
    AsyncStorage.getItem(guardada).then((t) => {
      const salvo = t ? JSON.parse(t) : {};
      setValores(Object.fromEntries(OPCOES.map((o) => [o.chave, typeof salvo[o.chave] === "boolean" ? salvo[o.chave] : o.padrao])));
    }).catch(() => {});
  }, [guardada]);

  function alternar(chave, v) {
    const novo = { ...valores, [chave]: v };
    setValores(novo);
    AsyncStorage.setItem(guardada, JSON.stringify(novo)).catch(() => {}); // sem armazenamento: a escolha vale só até sair da tela
  }

  return (
    <Tela>
      <Titulo>Notificações</Titulo>
      {OPCOES.map((o) => (
        <Cartao key={o.chave} style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{o.titulo}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{o.texto}</Text>
          </View>
          <Switch value={valores[o.chave]} onValueChange={(v) => alternar(o.chave, v)} trackColor={{ true: c.primaria }} accessibilityLabel={o.titulo} />
        </Cartao>
      ))}
    </Tela>
  );
}
