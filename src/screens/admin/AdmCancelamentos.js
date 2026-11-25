// "Cancelamentos": histórico de consultas canceladas (somente leitura).
import { Text, View } from "react-native";
import { AvisoLento, Tela } from "../../components/ui.js";
import { Cartao, Estado, Selo } from "../../components/comum.js";
import { CabecalhoLista } from "../../components/admin.js";
import { useCarregar } from "../../hooks/useCarregar.js";
import { agendamentoService } from "../../services/agendamentoService.js";
import { resumoCancelamentos } from "../../services/adminService.js";
import { carregarCatalogo } from "../../core/catalogo.js";
import { dataCurta, hojeISO } from "../../core/datetime.js";
import { espaco, fonte, raio, useEscala, useTema } from "../../theme.js";

export default function AdmCancelamentos({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const [ags, cat] = await Promise.all([agendamentoService.listar(), carregarCatalogo({ incluirInativos: true })]);
    return { cat, r: resumoCancelamentos(ags, hojeISO()) };
  }, []);

  return (
    <Tela>
      <CabecalhoLista titulo="Cancelamentos" onVoltar={() => navigation.goBack()} />
      <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1, marginBottom: 12 }}>Histórico de consultas canceladas</Text>
      <AvisoLento />
      <Estado carregando={carregando && !dados} erro={!dados ? erro : ""} onTentar={recarregar}>
        {dados && (
          <>
            <View style={{ flexDirection: "row", marginBottom: espaco.m }}>
              {[["Total de cancelamentos", dados.r.total], ["Este mês", dados.r.esteMes]].map(([r, v], i) => (
                <View key={r} accessible accessibilityLabel={`${r}: ${v}`} style={{ flex: 1, marginLeft: i ? 8 : 0, backgroundColor: c.superficie, borderColor: c.erro, borderWidth: 1, borderRadius: raio, padding: 12 }}>
                  <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}>{r}</Text>
                  <Text style={{ color: c.erro, fontSize: 28 * e, fontWeight: "700" }}>{v}</Text>
                </View>
              ))}
            </View>
            {dados.r.itens.length === 0 ? (
              <Text style={{ color: c.textoSuave, fontSize: fonte.corpo * e }}>Nenhum cancelamento registrado.</Text>
            ) : (
              dados.r.itens.map((a) => {
                const v = dados.cat.vinculoPorId.get(a.idVinculo);
                const prof = v && dados.cat.profissionalPorId.get(v.idProfissional);
                const clinica = v && dados.cat.clinicaPorId.get(v.idClinica);
                const esp = dados.cat.especialidadePorId.get(a.idEspecialidade)?.nome || a.especialidadeNome;
                return (
                  <Cartao key={a.id}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text accessibilityRole="header" style={{ flex: 1, color: c.texto, fontSize: fonte.corpo * e, fontWeight: "700", paddingRight: 8 }}>{prof?.nome ?? "Profissional não encontrado"}</Text>
                      <Selo texto="Cancelado" tom="erro" />
                    </View>
                    {!!esp && <Text style={{ color: c.primariaEscura, fontSize: fonte.pequena * e + 1 }}>{esp}</Text>}
                    <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e + 1 }}>{clinica?.nome ?? "Clínica não encontrada"}{"\n"}{dataCurta(a.data)} às {a.hora}</Text>
                    {/* O back-end não tem campo próprio para o motivo: usa a observação do agendamento. */}
                    <Text style={{ color: c.texto, fontSize: fonte.pequena * e + 1, marginTop: 6 }}>{a.observacao ? `Motivo: ${a.observacao}` : "Motivo não informado"}</Text>
                  </Cartao>
                );
              })
            )}
          </>
        )}
      </Estado>
    </Tela>
  );
}
