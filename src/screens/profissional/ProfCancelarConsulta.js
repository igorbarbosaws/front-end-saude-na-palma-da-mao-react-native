// Cancelar consulta (profissional): mostra a consulta, pede a justificativa e confirma.
// Parâmetro: { id } (id do agendamento). A justificativa vai na observação do agendamento.
import { useState } from "react";
import { Text, View } from "react-native";
import { Alerta, BarraTopo, Botao, Campo, Tela, Texto, Titulo } from "../../components/ui.js";
import { Cartao, Estado } from "../../components/comum.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { carregarAgenda, montarObservacao } from "../../services/agendaProfissionalService.js";
import { agendamentoService } from "../../services/agendamentoService.js";
import { dataBR } from "./_formatos.js";
import { fonte, useEscala, useTema } from "../../theme.js";

export default function ProfCancelarConsulta({ navigation, route }) {
  const c = useTema();
  const e = useEscala();
  const id = Number(route.params?.id);
  const { usuario } = useSessao();
  const { ocupado, executar } = useAcao();
  const [justificativa, setJustificativa] = useState("");
  const [erroForm, setErroForm] = useState("");

  const { dados, carregando, erro, recarregar } = useCarregar(() => carregarAgenda(usuario), [usuario?.idProfissional]);
  const a = dados?.meus.find((x) => x.id === id);
  const podeCancelar = a && ["PENDENTE", "CONFIRMADO"].includes(a.status);

  async function confirmar() {
    setErroForm("");
    const texto = justificativa.trim();
    if (!texto) return setErroForm("Informe a justificativa do cancelamento.");
    try {
      await executar(() => agendamentoService.cancelarComJustificativa(a.id, montarObservacao(a.observacao, texto)));
      navigation.replace("ProfConsultaCancelada", { id: a.id });
    } catch (err) {
      setErroForm(err.message);
    }
  }

  return (
    <Tela>
      <BarraTopo titulo="Cancelar consulta" onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={!a} textoVazio="Consulta não encontrada.">
        {a && (
          <>
            <Titulo>Cancelar esta consulta?</Titulo>
            <Cartao>
              <Text style={{ color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{a.paciente}</Text>
              <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{a.especialidade}</Text>
              <Text style={{ color: c.texto, fontSize: fonte.corpo * e, marginTop: 6 }}>{dataBR(a.data)} · {a.hora}</Text>
            </Cartao>

            {!podeCancelar ? (
              <Alerta tipo="aviso">Esta consulta não está mais em aberto, então não pode ser cancelada.</Alerta>
            ) : (
              <>
                <Texto suave style={{ marginBottom: 12 }}>Informe a justificativa. O paciente será notificado sobre o cancelamento.</Texto>
                <Campo rotulo="Justificativa do cancelamento" value={justificativa} onChangeText={setJustificativa} multiline numberOfLines={4} maxLength={200}
                  placeholder="Ex.: indisponibilidade médica ou emergência" inputStyle={{ minHeight: 110, textAlignVertical: "top", paddingTop: 12 }} />
                {!!erroForm && <Alerta>{erroForm}</Alerta>}
                <Botao titulo={ocupado ? "Cancelando..." : "Confirmar cancelamento"} variante="perigo" ocupado={ocupado} desabilitado={!justificativa.trim()} onPress={confirmar} />
                <Botao titulo="Voltar" variante="contorno" desabilitado={ocupado} onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
              </>
            )}
          </>
        )}
      </Estado>
    </Tela>
  );
}
