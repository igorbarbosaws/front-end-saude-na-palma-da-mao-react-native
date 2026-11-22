// Preferências de acessibilidade (tamanho do texto, contraste alto, menos animações).
// Ficam só neste aparelho (AsyncStorage) e valem para todas as telas: Texto/Botao/Campo e useTema() leem este contexto.
import { createContext, createElement, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE = "spm_acessibilidade";

export const TAMANHOS = [
  { valor: "normal", rotulo: "Normal", escala: 1 },
  { valor: "grande", rotulo: "Grande", escala: 1.15 },
  { valor: "extra", rotulo: "Extra-Grande", escala: 1.3 },
];

const PADRAO = { texto: "normal", contraste: false, reduzirAnimacoes: false };

const Ctx = createContext({ ...PADRAO, escala: 1, definir: () => {} });

export function AcessibilidadeProvider({ children }) {
  const [prefs, setPrefs] = useState(PADRAO);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((t) => {
        const salvo = t ? JSON.parse(t) : {};
        setPrefs({
          texto: TAMANHOS.some((x) => x.valor === salvo.texto) ? salvo.texto : PADRAO.texto,
          contraste: salvo.contraste === true,
          reduzirAnimacoes: salvo.reduzirAnimacoes === true,
        });
      })
      .catch(() => {});
  }, []);

  const definir = (parcial) => {
    const novo = { ...prefs, ...parcial };
    setPrefs(novo);
    AsyncStorage.setItem(CHAVE, JSON.stringify(novo)).catch(() => {});
  };

  const escala = TAMANHOS.find((x) => x.valor === prefs.texto)?.escala ?? 1;
  return createElement(Ctx.Provider, { value: { ...prefs, escala, definir } }, children);
}

export const useAcessibilidade = () => useContext(Ctx);
