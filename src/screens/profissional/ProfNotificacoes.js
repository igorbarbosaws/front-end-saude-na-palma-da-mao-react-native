// Notificações do profissional (aba Avisos): consultas aguardando confirmação + preferências de aviso.
// Ainda não existe endpoint de notificação: as preferências ficam só neste aparelho (AsyncStorage)
// e os avisos são calculados a partir das consultas (mesma estratégia do paciente).
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { AvisoLento, Tela, Titulo } from "../../components/ui.js";
import { Cartao, Estado, Secao } from "../../components/comum.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { carregarAgenda } from "../../services/agendaProfissionalService.js";
import { hojeISO } from "../../core/datetime.js";
import { dataBR } from "./_formatos.js";
import { fonte, useEscala, useTema } from "../../theme.js";

const CHAVE = "spm_prof_notificacoes";
const ITENS = [
  { id: "confirmacoes", titulo: "Confirmações de consulta", texto: "Receba notificações quando uma consulta for confirmada", padrao: true },
  { id: "lembretes", titulo: "Lembretes", texto: "Lembrete 24h antes da sua consulta", padrao: true },
  { id: "novidades", titulo: "Novidades", texto: "Informações sobre novas funcionalidades", padrao: false },
];

export default function ProfNotificacoes() {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const [prefs, setPrefs] = useState(Object.fromEntries(ITENS.map((i) => [i.id, i.padrao])));

  useEffect(() => {
    AsyncStorage.getItem(CHAVE).then((t) => {
      const salvo = t ? JSON.parse(t) : {};
      setPrefs(Object.fromEntries(ITENS.map((i) => [i.id, typeof salvo[i.id] === "boolean" ? salvo[i.id] : i.padrao])));
    }).catch(() => {});
  }, []);

  function alternar(id, v) {
    const novo = { ...prefs, [id]: v };
    setPrefs(novo);
    AsyncStorage.setItem(CHAVE, JSON.stringify(novo)).catch(() => {});
  }

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const r = await carregarAgenda(usuario);
    return r.meus.filter((a) => a.status === "PENDENTE" && a.data >= hojeISO()).sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
  }, [usuario?.idProfissional]);

  const lista = prefs.confirmacoes ? dados ?? [] : [];

  return (
    <Tela>
      <Titulo>Notificações</Titulo>
      <AvisoLento />
      <Secao titulo="Aguardando confirmação">
        <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={lista.length === 0} textoVazio="Nenhuma consulta aguardando confirmação." iconeVazio="notifications-off-outline">
          {lista.map((a) => (
            <Cartao key={a.id} style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={28} color={c.primaria} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{a.paciente}</Text>
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{a.especialidade} · {dataBR(a.data)} às {a.hora}</Text>
              </View>
            </Cartao>
          ))}
        </Estado>
      </Secao>
      <Secao titulo="Preferências">
        {ITENS.map((i) => (
          <Cartao key={i.id} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{i.titulo}</Text>
              <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{i.texto}</Text>
            </View>
            <Switch value={prefs[i.id]} onValueChange={(v) => alternar(i.id, v)} trackColor={{ true: c.primaria }} accessibilityLabel={i.titulo} />
          </Cartao>
        ))}
      </Secao>
    </Tela>
  );
}
