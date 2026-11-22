// Minhas consultas (aba Consultas): Próximas, Concluídas e Canceladas, com cancelamento e reagendamento
// de consultas futuras (regra: até 24 horas antes do horário).
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Alerta,
  AvisoLento,
  Botao,
  Tela,
  Titulo,
} from '../../components/ui.js';
import {
  Cartao,
  Chip,
  Confirmar,
  Estado,
  Selo,
} from '../../components/comum.js';
import { useAcao, useCarregar } from '../../hooks/useCarregar.js';
import { useSessao } from '../../navigation/SessaoContext.js';
import { carregarCatalogo } from '../../core/catalogo.js';
import { dataCurta, hojeISO, agoraHHMM } from '../../core/datetime.js';
import { agendamentoService } from '../../services/agendamentoService.js';
import { fonte, useEscala, useTema } from '../../theme.js';

const ABAS = [
  ['proximas', 'Próximas'],
  ['concluidas', 'Concluídas'],
  ['canceladas', 'Canceladas'],
];
const HORAS_PARA_CANCELAR = 24;
const EM_ABERTO = ['PENDENTE', 'CONFIRMADO'];
const quando = a => `${a.data} ${a.hora}`;

// Falta pelo menos 24 h para a consulta? (data e hora locais)
function podeCancelar(a) {
  const [ano, mes, dia] = a.data.split('-').map(Number);
  const [hh, mm] = a.hora.split(':').map(Number);
  return (
    new Date(ano, mes - 1, dia, hh, mm).getTime() - Date.now() >=
    HORAS_PARA_CANCELAR * 3600 * 1000
  );
}

// Separa as consultas em cada aba. Consulta em aberto que já passou fica em "Concluídas" como "Encerrada".
function separar(lista) {
  const agora = `${hojeISO()} ${agoraHHMM()}`;
  const crescente = (a, b) => quando(a).localeCompare(quando(b));
  const decrescente = (a, b) => quando(b).localeCompare(quando(a));
  return {
    proximas: lista
      .filter(a => EM_ABERTO.includes(a.status) && quando(a) >= agora)
      .sort(crescente),
    concluidas: lista
      .filter(
        a =>
          a.status === 'CONCLUIDO' ||
          (EM_ABERTO.includes(a.status) && quando(a) < agora)
      )
      .sort(decrescente),
    canceladas: lista.filter(a => a.status === 'CANCELADO').sort(decrescente),
  };
}

export default function MeusAgendamentos({ navigation }) {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const { ocupado, executar } = useAcao();
  const [aba, setAba] = useState('proximas');
  const [alvo, setAlvo] = useState(null); // consulta que o paciente quer cancelar
  const [msg, setMsg] = useState(null);

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const [lista, cat] = await Promise.all([
      agendamentoService.listar(),
      carregarCatalogo({ incluirInativos: true }),
    ]);
    return {
      cat,
      todas: lista.filter(a => a.idPaciente === Number(usuario?.idPaciente)),
    };
  }, [usuario?.idPaciente]);

  const grupos = dados
    ? separar(dados.todas)
    : { proximas: [], concluidas: [], canceladas: [] };
  const itens = grupos[aba];

  async function cancelar() {
    const a = alvo;
    if (!a) return;
    if (!podeCancelar(a)) {
      setAlvo(null);
      setMsg({
        tipo: 'erro',
        texto: `O cancelamento só é possível com ${HORAS_PARA_CANCELAR} horas de antecedência.`,
      });
      return;
    }
    try {
      await executar(() => agendamentoService.alterarStatus(a.id, 'CANCELADO'));
      setAlvo(null);
      setMsg({ tipo: 'sucesso', texto: 'Consulta cancelada.' });
      recarregar();
    } catch (err) {
      setAlvo(null);
      setMsg({ tipo: 'erro', texto: err.message });
    }
  }

  function reagendar(a) {
    if (!podeCancelar(a)) {
      setMsg({
        tipo: 'erro',
        texto: `O reagendamento só é possível com ${HORAS_PARA_CANCELAR} horas de antecedência.`,
      });
      return;
    }
    const v = dados.cat.vinculoPorId.get(a.idVinculo);
    navigation
      .getParent()
      ?.navigate('Agendamento', {
        idEspecialidade: a.idEspecialidade,
        idClinica: v?.idClinica,
        idVinculo: a.idVinculo,
        reagendarId: a.id,
      });
  }

  return (
    <Tela>
      <Titulo>Minhas consultas</Titulo>
      <AvisoLento />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {ABAS.map(([chave, rotulo]) => (
          <Chip
            key={chave}
            rotulo={rotulo}
            ativo={aba === chave}
            onPress={() => setAba(chave)}
          />
        ))}
      </View>
      {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}

      <Estado
        carregando={carregando && !dados}
        erro={!dados ? erro : ''}
        onTentar={recarregar}
        vazio={itens.length === 0}
        textoVazio="Nenhuma consulta encontrada."
        iconeVazio="calendar-outline"
      >
        {itens.map(a => {
          const v = dados.cat.vinculoPorId.get(a.idVinculo);
          const clinica = dados.cat.clinicaPorId.get(v?.idClinica);
          const prof = dados.cat.profissionalPorId.get(v?.idProfissional);
          const esp =
            a.especialidadeNome ||
            dados.cat.especialidadePorId.get(a.idEspecialidade)?.nome ||
            'Consulta';
          const emAberto = EM_ABERTO.includes(a.status);
          const passou = quando(a) < `${hojeISO()} ${agoraHHMM()}`;
          const selo =
            emAberto && passou
              ? ['Encerrada', 'neutro']
              : emAberto
              ? ['Próxima', 'sucesso']
              : a.status === 'CONCLUIDO'
              ? ['Concluída', 'neutro']
              : ['Cancelada', 'erro'];
          const endereco = [
            clinica?.ruaNumero || clinica?.endereco,
            clinica?.cidadeUf,
          ]
            .filter(Boolean)
            .join(' — ');
          return (
            <Cartao key={a.id}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <Text
                  accessibilityRole="header"
                  style={{
                    flex: 1,
                    color: c.texto,
                    fontSize: fonte.corpo * e,
                    fontWeight: '700',
                    paddingRight: 8,
                  }}
                >
                  {clinica?.nome ?? 'Clínica'}
                </Text>
                <Selo texto={selo[0]} tom={selo[1]} />
              </View>
              {!!prof && <Linha icone="person-outline" texto={prof.nome} />}
              <Linha icone="medkit-outline" texto={esp} />
              <Linha icone="calendar-outline" texto={dataCurta(a.data)} />
              <Linha icone="time-outline" texto={a.hora} />
              {!!endereco && (
                <Linha icone="location-outline" texto={endereco} />
              )}
              {!!a.observacao && (
                <Text
                  style={{
                    color: c.textoSuave,
                    fontSize: fonte.pequena * e,
                    marginTop: 4,
                  }}
                >
                  Obs.: {a.observacao}
                </Text>
              )}
              {emAberto && !passou && (
                <View style={{ marginTop: 12 }}>
                  <Botao
                    titulo="Reagendar"
                    variante="contorno"
                    onPress={() => reagendar(a)}
                  />
                  <Botao
                    titulo="Cancelar consulta"
                    variante="perigo"
                    onPress={() => {
                      setMsg(null);
                      setAlvo(a);
                    }}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}
            </Cartao>
          );
        })}
      </Estado>

      <Confirmar
        visivel={!!alvo}
        titulo="Cancelar consulta?"
        mensagem="Tem certeza de que deseja cancelar esta consulta? Essa ação não pode ser desfeita."
        textoOk="Sim, cancelar"
        textoVoltar="Manter consulta"
        perigo
        ocupado={ocupado}
        onConfirmar={cancelar}
        onCancelar={() => setAlvo(null)}
      />
    </Tela>
  );
}

function Linha({ icone, texto }) {
  const c = useTema();
  const e = useEscala();
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
    >
      <Ionicons
        name={icone}
        size={18}
        color={c.primariaEscura}
        style={{ marginRight: 8 }}
      />
      <Text
        style={{ flex: 1, color: c.texto, fontSize: fonte.pequena * e + 1 }}
      >
        {texto}
      </Text>
    </View>
  );
}
