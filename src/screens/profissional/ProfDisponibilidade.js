// Disponibilidade do profissional: próximos 5 dias úteis, com os horários configurados e remoção.
// Adicionar horário abre a tela ProfAdicionarDisponibilidade (parâmetro opcional { data }).
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alerta, AvisoLento, BarraTopo, Botao, Tela, Texto } from "../../components/ui.js";
import { Cartao, Confirmar, Estado } from "../../components/comum.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { profissionalService } from "../../services/profissionalService.js";
import { disponibilidadeService } from "../../services/disponibilidadeService.js";
import { formatarDataLonga } from "../../core/datetime.js";
import { isoLocal, maiuscula } from "./_formatos.js";
import { ALVO_MINIMO, fonte, useEscala, useTema } from "../../theme.js";

const NOMES = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

// Próximos 5 dias úteis, começando em hoje (se for dia útil).
export function proximosDiasUteis() {
  const lista = [];
  const d = new Date();
  while (lista.length < 5) {
    if (d.getDay() !== 0 && d.getDay() !== 6) lista.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return lista;
}

export default function ProfDisponibilidade({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const { ocupado, executar } = useAcao();
  const [remover, setRemover] = useState(null);
  const [msg, setMsg] = useState(null);
  const dias = proximosDiasUteis();

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const vinculos = (await profissionalService.listarVinculos()).filter((v) => v.idProfissional === usuario?.idProfissional);
    const vinculo = vinculos[0];
    if (!vinculo) return { vinculo: null, janelas: [] };
    const todas = await disponibilidadeService.listar();
    const janelas = todas.filter((j) => j.idVinculo === vinculo.id).sort((a, b) => `${a.data} ${a.horaInicio}`.localeCompare(`${b.data} ${b.horaInicio}`));
    return { vinculo, janelas };
  }, [usuario?.idProfissional]);

  async function confirmarRemocao() {
    const j = remover;
    try {
      await executar(() => disponibilidadeService.remover(j.id));
      setRemover(null);
      setMsg({ tipo: "sucesso", texto: "Horário removido." });
      recarregar();
    } catch (err) {
      setRemover(null);
      setMsg({ tipo: "erro", texto: err.message });
    }
  }

  return (
    <Tela>
      <BarraTopo titulo="Disponibilidade" onVoltar={() => navigation.goBack()} />
      <AvisoLento />
      <Texto suave style={{ marginBottom: 12 }}>Configure as datas e os horários em que você está disponível para consultas.</Texto>
      {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}

      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={dados && !dados.vinculo} textoVazio="Seu cadastro ainda não está vinculado a uma clínica. Procure a administração." iconeVazio="business-outline">
        {dados?.vinculo && dias.map((d) => {
          const data = isoLocal(d);
          const faixas = dados.janelas.filter((j) => j.data === data);
          return (
            <Cartao key={data}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{NOMES[d.getDay()]}</Text>
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{formatarDataLonga(data)}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Adicionar horário em ${NOMES[d.getDay()]}`} onPress={() => navigation.navigate("ProfAdicionarDisponibilidade", { data })}
                  style={{ width: ALVO_MINIMO, height: ALVO_MINIMO, borderRadius: ALVO_MINIMO / 2, backgroundColor: c.primaria, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="add" size={26} color={c.sobrePrimaria} />
                </Pressable>
              </View>
              {faixas.length === 0 ? (
                <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>Nenhum horário configurado</Text>
              ) : (
                faixas.map((j) => (
                  <View key={j.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}>
                    <Text style={{ color: c.texto, fontSize: fonte.corpo * e, flex: 1 }}>
                      {j.horaInicio} — {j.horaFim}
                      {j.status === "RESERVADO" ? "  (Reservado)" : j.status === "BLOQUEADO" ? "  (Bloqueado)" : ""}
                    </Text>
                    {j.status !== "RESERVADO" && (
                      <Pressable accessibilityRole="button" accessibilityLabel={`Remover horário ${j.horaInicio} às ${j.horaFim}`} onPress={() => { setMsg(null); setRemover(j); }}
                        style={{ width: ALVO_MINIMO, height: ALVO_MINIMO, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="trash-outline" size={22} color={c.erro} />
                      </Pressable>
                    )}
                  </View>
                ))
              )}
            </Cartao>
          );
        })}
        {dados?.vinculo && <Botao titulo="Adicionar horário" onPress={() => navigation.navigate("ProfAdicionarDisponibilidade", {})} style={{ marginTop: 4 }} />}
      </Estado>

      <Confirmar visivel={!!remover} titulo="Remover horário?" mensagem="Remover este horário de atendimento?" textoOk="Remover" textoVoltar="Voltar" perigo ocupado={ocupado} onConfirmar={confirmarRemocao} onCancelar={() => setRemover(null)} />
    </Tela>
  );
}
