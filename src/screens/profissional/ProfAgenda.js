// Minha agenda (aba): consultas de hoje e dos próximos dias. Cada consulta aberta pode ser confirmada,
// concluída ou cancelada (o cancelamento abre a tela de justificativa).
import { useState } from "react";
import { Text, View } from "react-native";
import { Alerta, AvisoLento, Botao, Tela, Texto, Titulo } from "../../components/ui.js";
import { Cartao, Chip, Estado, Selo } from "../../components/comum.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { ABERTOS, carregarAgenda, doDia, proximas } from "../../services/agendaProfissionalService.js";
import { agendamentoService } from "../../services/agendamentoService.js";
import { dataBR } from "./_formatos.js";
import { hojeISO, formatarData } from "../../core/datetime.js";
import { fonte, useEscala, useTema } from "../../theme.js";

const SELO = { PENDENTE: ["Pendente", "aviso"], CONFIRMADO: ["Confirmada", "sucesso"], CANCELADO: ["Cancelada", "erro"], CONCLUIDO: ["Concluída", "neutro"] };

export default function ProfAgenda({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const { ocupado, executar } = useAcao();
  const [aba, setAba] = useState("hoje");
  const [msg, setMsg] = useState(null);

  const { dados, carregando, erro, recarregar } = useCarregar(() => carregarAgenda(usuario), [usuario?.idProfissional]);

  const lista = !dados || dados.semCadastro ? [] : aba === "hoje" ? doDia(dados.meus) : proximas(dados.meus);

  async function mudarStatus(a, status, texto) {
    setMsg(null);
    try {
      await executar(() => agendamentoService.alterarStatus(a.id, status));
      setMsg({ tipo: "sucesso", texto });
      recarregar();
    } catch (err) {
      setMsg({ tipo: "erro", texto: err.message });
    }
  }

  return (
    <Tela>
      <Titulo>Minha agenda</Titulo>
      <AvisoLento />
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <Chip rotulo="Hoje" ativo={aba === "hoje"} onPress={() => setAba("hoje")} />
        <Chip rotulo="Próximos dias" ativo={aba === "proximas"} onPress={() => setAba("proximas")} />
      </View>
      <Texto suave style={{ marginBottom: 12 }}>{aba === "hoje" ? `Hoje · ${formatarData(hojeISO())}` : "Consultas futuras em aberto"}</Texto>
      {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}

      {dados?.semCadastro ? (
        <Alerta tipo="aviso">Seu usuário ainda não tem cadastro de profissional.</Alerta>
      ) : (
        <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={lista.length === 0} textoVazio={aba === "hoje" ? "Nenhuma consulta para hoje." : "Nenhuma consulta nos próximos dias."} iconeVazio="calendar-outline">
          {lista.map((a) => {
            const [rotulo, tom] = SELO[a.status] ?? [a.status, "neutro"];
            const aberta = ABERTOS.includes(a.status);
            return (
              <Cartao key={a.id}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ minWidth: 64 }}>
                    <Text style={{ color: a.status === "CANCELADO" ? c.textoSuave : c.primariaEscura, fontSize: fonte.subtitulo * e, fontWeight: "700", textDecorationLine: a.status === "CANCELADO" ? "line-through" : "none" }}>{a.hora}</Text>
                    {aba === "proximas" && <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{dataBR(a.data)}</Text>}
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{a.paciente}</Text>
                    <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{a.especialidade}</Text>
                  </View>
                  <Selo texto={rotulo} tom={tom} />
                </View>

                {a.status === "CANCELADO" && (
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1, marginTop: 10 }}>
                    <Text style={{ fontWeight: "700" }}>Justificativa: </Text>{a.justificativa || "Não informada"}
                  </Text>
                )}

                {aberta && (
                  <View style={{ marginTop: 12 }}>
                    {a.status === "PENDENTE" && <Botao titulo="Confirmar consulta" ocupado={ocupado} onPress={() => mudarStatus(a, "CONFIRMADO", "Consulta confirmada.")} />}
                    {a.status === "CONFIRMADO" && <Botao titulo="Marcar como concluída" ocupado={ocupado} onPress={() => mudarStatus(a, "CONCLUIDO", "Consulta concluída.")} />}
                    <Botao titulo="Cancelar consulta" variante="perigo" desabilitado={ocupado} onPress={() => navigation.getParent()?.navigate("ProfCancelarConsulta", { id: a.id })} style={{ marginTop: 8 }} />
                  </View>
                )}
              </Cartao>
            );
          })}
        </Estado>
      )}
    </Tela>
  );
}
