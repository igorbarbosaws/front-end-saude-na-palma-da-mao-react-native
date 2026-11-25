// Adicionar disponibilidade: data (um dos próximos 5 dias úteis), início e fim. Parâmetro opcional: { data: "AAAA-MM-DD" }.
// Regras (as mesmas do site): início < fim, janela mínima de 30 min, sem sobreposição com outra janela do mesmo dia.
import { useState } from "react";
import { View } from "react-native";
import { Alerta, BarraTopo, Botao, Campo, Tela, Texto } from "../../components/ui.js";
import { Chip, Estado } from "../../components/comum.js";
import { useAcao, useCarregar } from "../../hooks/useCarregar.js";
import { useSessao } from "../../navigation/SessaoContext.js";
import { profissionalService } from "../../services/profissionalService.js";
import { disponibilidadeService } from "../../services/disponibilidadeService.js";
import { dataCurta, hojeISO } from "../../core/datetime.js";
import { emMinutos, formatarHoraDigitada, horaValida, isoLocal } from "./_formatos.js";
import { proximosDiasUteis } from "./ProfDisponibilidade.js";

const DURACAO_PADRAO_MIN = 30;

export default function ProfAdicionarDisponibilidade({ navigation, route }) {
  const { usuario } = useSessao();
  const { ocupado, executar } = useAcao();
  const dias = proximosDiasUteis().map(isoLocal);
  const inicial = dias.includes(route.params?.data) ? route.params.data : dias[0];
  const [data, setData] = useState(inicial);
  const [ini, setIni] = useState("");
  const [fim, setFim] = useState("");
  const [erroForm, setErroForm] = useState("");

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const vinculo = (await profissionalService.listarVinculos()).find((v) => v.idProfissional === usuario?.idProfissional);
    const janelas = vinculo ? (await disponibilidadeService.listar()).filter((j) => j.idVinculo === vinculo.id) : [];
    return { vinculo, janelas };
  }, [usuario?.idProfissional]);

  async function salvar() {
    setErroForm("");
    if (!data || !ini || !fim) return setErroForm("Preencha data, início e fim.");
    if (!horaValida(ini) || !horaValida(fim)) return setErroForm("Use o formato HH:MM, por exemplo 08:30.");
    if (data < hojeISO()) return setErroForm("Escolha uma data de hoje em diante.");
    if (emMinutos(fim) <= emMinutos(ini)) return setErroForm("O horário final precisa ser depois do inicial.");
    if (emMinutos(fim) - emMinutos(ini) < DURACAO_PADRAO_MIN) return setErroForm(`A janela precisa ter pelo menos ${DURACAO_PADRAO_MIN} minutos.`);
    const conflito = dados.janelas.some((j) => j.data === data && emMinutos(j.horaInicio) < emMinutos(fim) && emMinutos(ini) < emMinutos(j.horaFim));
    if (conflito) return setErroForm("Já existe um horário que se sobrepõe a este.");
    try {
      await executar(() => disponibilidadeService.criar({ idVinculo: dados.vinculo.id, data, horaInicio: ini, horaFim: fim, duracaoMinutos: DURACAO_PADRAO_MIN }));
      navigation.goBack(); // a lista recarrega ao voltar
    } catch (err) {
      setErroForm(err.message);
    }
  }

  return (
    <Tela>
      <BarraTopo titulo="Adicionar disponibilidade" onVoltar={() => navigation.goBack()} />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar} vazio={dados && !dados.vinculo} textoVazio="Seu cadastro ainda não está vinculado a uma clínica. Procure a administração.">
        <Texto suave style={{ marginBottom: 8 }}>Escolha o dia:</Texto>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
          {dias.map((d) => <Chip key={d} rotulo={dataCurta(d).slice(0, 5)} ativo={data === d} onPress={() => setData(d)} />)}
        </View>
        <Campo rotulo="Início (HH:MM)" value={ini} onChangeText={(t) => setIni(formatarHoraDigitada(t))} keyboardType="number-pad" maxLength={5} placeholder="08:00" />
        <Campo rotulo="Fim (HH:MM)" value={fim} onChangeText={(t) => setFim(formatarHoraDigitada(t))} keyboardType="number-pad" maxLength={5} placeholder="12:00" />
        {!!erroForm && <Alerta>{erroForm}</Alerta>}
        <Botao titulo={ocupado ? "Salvando..." : "Salvar horário"} ocupado={ocupado} onPress={salvar} />
        <Botao titulo="Cancelar" variante="contorno" desabilitado={ocupado} onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
      </Estado>
    </Tela>
  );
}
