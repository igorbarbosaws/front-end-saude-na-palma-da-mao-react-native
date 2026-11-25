// Avisos (aba): lembretes e novidades sobre as consultas do paciente + preferências de aviso.
//
// ESTRATÉGIA DE NOTIFICAÇÃO (decisão da equipe): a API ainda não tem canal de aviso. Por isso os avisos são
// CALCULADOS no app a partir das consultas do paciente (confirmada, cancelada, lembrete de 24 h). As preferências
// (ligar/desligar cada tipo) ficam guardadas só neste aparelho. Quando existir notificação push no back-end,
// só a função `montarAvisos` precisa mudar.
import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AvisoLento, Tela, Titulo } from '../../components/ui.js';
import { Cartao, Estado, Secao } from '../../components/comum.js';
import { useCarregar } from '../../hooks/useCarregar.js';
import { useSessao } from '../../navigation/SessaoContext.js';
import { carregarCatalogo } from '../../core/catalogo.js';
import { dataCurta } from '../../core/datetime.js';
import { agendamentoService } from '../../services/agendamentoService.js';
import { fonte, useEscala, useTema } from '../../theme.js';

const OPCOES = [
  {
    chave: 'confirmacoes',
    titulo: 'Confirmações de consulta',
    texto: 'Receba avisos quando uma consulta for confirmada ou cancelada',
    padrao: true,
  },
  {
    chave: 'lembretes',
    titulo: 'Lembretes',
    texto: 'Lembrete 24h antes da sua consulta',
    padrao: true,
  },
];

const inicio = a => {
  const [ano, mes, dia] = a.data.split('-').map(Number);
  const [hh, mm] = a.hora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, hh, mm).getTime();
};

// Transforma as consultas do paciente em avisos, do mais importante ao menos.
function montarAvisos(consultas, cat, prefs) {
  const agora = Date.now();
  const lista = [];
  for (const a of consultas) {
    const v = cat.vinculoPorId.get(a.idVinculo);
    const quem =
      cat.profissionalPorId.get(v?.idProfissional)?.nome ?? 'seu profissional';
    const quando = `${dataCurta(a.data)} às ${a.hora}`;
    const t = inicio(a);
    if (
      prefs.lembretes &&
      ['PENDENTE', 'CONFIRMADO'].includes(a.status) &&
      t > agora &&
      t - agora <= 24 * 3600 * 1000
    ) {
      lista.push({
        id: `l${a.id}`,
        ordem: 0,
        icone: 'alarm-outline',
        titulo: 'Lembrete: sua consulta é em breve',
        texto: `${quando}, com ${quem}.`,
      });
    }
    if (prefs.confirmacoes && a.status === 'CONFIRMADO' && t > agora) {
      lista.push({
        id: `c${a.id}`,
        ordem: 1,
        icone: 'checkmark-circle-outline',
        titulo: 'Consulta confirmada',
        texto: `${quando}, com ${quem}.`,
      });
    }
    if (
      prefs.confirmacoes &&
      a.status === 'CANCELADO' &&
      t > agora - 7 * 24 * 3600 * 1000
    ) {
      lista.push({
        id: `x${a.id}`,
        ordem: 2,
        icone: 'close-circle-outline',
        titulo: 'Consulta cancelada',
        texto: `${quando}, com ${quem}.${
          a.observacao ? ` Motivo: ${a.observacao}` : ''
        }`,
      });
    }
  }
  return lista.sort((x, y) => x.ordem - y.ordem);
}

export default function Avisos() {
  const c = useTema();
  const e = useEscala();
  const { usuario } = useSessao();
  const chave = `spm_notificacoes_${usuario?.idUsuario}`;
  const [prefs, setPrefs] = useState(
    Object.fromEntries(OPCOES.map(o => [o.chave, o.padrao]))
  );

  useEffect(() => {
    AsyncStorage.getItem(chave)
      .then(t => {
        const salvo = t ? JSON.parse(t) : {};
        setPrefs(
          Object.fromEntries(
            OPCOES.map(o => [
              o.chave,
              typeof salvo[o.chave] === 'boolean' ? salvo[o.chave] : o.padrao,
            ])
          )
        );
      })
      .catch(() => {});
  }, [chave]);

  function alternar(k, v) {
    const novo = { ...prefs, [k]: v };
    setPrefs(novo);
    AsyncStorage.setItem(chave, JSON.stringify(novo)).catch(() => {});
  }

  const { dados, carregando, erro, recarregar } = useCarregar(async () => {
    const [lista, cat] = await Promise.all([
      agendamentoService.listar(),
      carregarCatalogo({ incluirInativos: true }),
    ]);
    return {
      cat,
      minhas: lista.filter(a => a.idPaciente === Number(usuario?.idPaciente)),
    };
  }, [usuario?.idPaciente]);

  const avisos = dados ? montarAvisos(dados.minhas, dados.cat, prefs) : [];

  return (
    <Tela>
      <Titulo>Avisos</Titulo>
      <AvisoLento />
      <Secao titulo="Novidades sobre suas consultas">
        <Estado
          carregando={carregando && !dados}
          erro={!dados ? erro : ''}
          onTentar={recarregar}
          vazio={avisos.length === 0}
          textoVazio="Você não tem avisos no momento."
          iconeVazio="notifications-off-outline"
        >
          {avisos.map(a => (
            <Cartao
              key={a.id}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons
                name={a.icone}
                size={28}
                color={c.primaria}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: c.texto,
                    fontSize: fonte.corpo * e,
                    fontWeight: '700',
                  }}
                >
                  {a.titulo}
                </Text>
                <Text
                  style={{
                    color: c.textoSuave,
                    fontSize: fonte.pequena * e + 1,
                  }}
                >
                  {a.texto}
                </Text>
              </View>
            </Cartao>
          ))}
        </Estado>
      </Secao>

      <Secao titulo="Preferências de aviso">
        {OPCOES.map(o => (
          <Cartao
            key={o.chave}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  color: c.texto,
                  fontSize: fonte.corpo * e,
                  fontWeight: '700',
                }}
              >
                {o.titulo}
              </Text>
              <Text
                style={{ color: c.textoSuave, fontSize: fonte.pequena * e }}
              >
                {o.texto}
              </Text>
            </View>
            <Switch
              value={prefs[o.chave]}
              onValueChange={v => alternar(o.chave, v)}
              trackColor={{ true: c.primaria }}
              accessibilityLabel={o.titulo}
            />
          </Cartao>
        ))}
      </Secao>
    </Tela>
  );
}
