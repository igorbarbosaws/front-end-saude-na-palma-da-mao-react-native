// "Agendamentos hoje": resumo do dia e próximos atendimentos (somente leitura).
import { Text, View } from "react-native";
import { AvisoLento, Tela, Titulo } from "../../components/ui.js";
import { Cartao, Estado, Secao, Selo } from "../../components/comum.js";
import { CabecalhoLista } from "../../components/admin.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { agendamentoService } from "../../services/agendamentoService.js";
import { dataPorExtenso, resumoAgendamentos } from "../../services/adminService.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { agoraHHMM, dataCurta, hojeISO } from "../../core/datetime.js";
import { espaco, fonte, raio, useEscala, useTema } from "../../theme.js";

export default function AdmAgendamentos({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const hoje = hojeISO();
  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const [ags, cat] = await Promise.all([agendamentoService.listar(), carregarCatalogo({ incluirInativos: true })]);
    return { cat, r: resumoAgendamentos(ags, hojeISO(), agoraHHMM()) };
  }, []);

  return (
    <Tela>
      <CabecalhoLista titulo="Agendamentos hoje" onVoltar={() => navigation.goBack()} />
      <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1, marginBottom: 12 }}>{dataPorExtenso(hoje)}</Text>
      <AvisoLento />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar}>
        {dados && (
          <>
            <View style={{ flexDirection: "row", marginBottom: espaco.m }}>
              {[["Total hoje", dados.r.total], ["Concluídos", dados.r.concluidos], ["Pendentes", dados.r.pendentes]].map(([r, v], i) => (
                <View key={r} accessible accessibilityLabel={`${r}: ${v}`} style={{ flex: 1, marginLeft: i ? 8 : 0, backgroundColor: c.primariaClara, borderRadius: raio, padding: 12 }}>
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{r}</Text>
                  <Text style={{ color: c.primariaEscura, fontSize: 28 * e, fontWeight: "700" }}>{v}</Text>
                </View>
              ))}
            </View>
            <Secao titulo="Próximos">
              {dados.r.proximos.length === 0 ? (
                <Text style={{ color: c.textoSuave, fontSize: fonte.corpo * e }}>Nenhum atendimento pendente.</Text>
              ) : (
                dados.r.proximos.map((a) => {
                  const v = dados.cat.vinculoPorId.get(a.idVinculo);
                  const prof = v && dados.cat.profissionalPorId.get(v.idProfissional);
                  const clinica = v && dados.cat.clinicaPorId.get(v.idClinica);
                  const esp = dados.cat.especialidadePorId.get(a.idEspecialidade)?.nome || a.especialidadeNome;
                  return (
                    <Cartao key={a.id}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text accessibilityRole="header" style={{ flex: 1, color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700", paddingRight: 8 }}>{prof?.nome ?? "Profissional não encontrado"}</Text>
                        <Selo texto={a.hora} tom="sucesso" />
                      </View>
                      {!!esp && <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e + 1 }}>{esp}</Text>}
                      <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{clinica?.nome ?? "Clínica não encontrada"}{a.data !== hoje ? `\n${dataCurta(a.data)}` : ""}</Text>
                    </Cartao>
                  );
                })
              )}
            </Secao>
          </>
        )}
      </Estado>
    </Tela>
  );
}
