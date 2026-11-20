import { useColorScheme } from "react-native";

// Identidade TriaOrto+ (mesmos valores de css/base.css do front-end web).
// O público inclui pessoas idosas: fonte grande, bom contraste, alvos de toque de 48 px.
const claro = {
  primaria: "#0f7a6d",
  primariaEscura: "#0a5c51",
  primariaClara: "#e1f1ec",
  realce: "#a7d7c5",
  fundo: "#f8faf7",
  superficie: "#ffffff",
  texto: "#1f2937",
  textoSuave: "#6b7280",
  borda: "#d5e4df",
  desabilitado: "#d3d9dc",
  desabilitadoTexto: "#66737a",
  sucesso: "#176b40",
  sucessoFundo: "#e2f4ea",
  erro: "#a61e17",
  erroFundo: "#fbe9e7",
  aviso: "#7a4e00",
  avisoFundo: "#fff3d6",
  sobrePrimaria: "#ffffff",
};

const escuro = {
  primaria: "#4fc3ad",
  primariaEscura: "#8fe0cf",
  primariaClara: "#123a34",
  realce: "#1b4a42",
  fundo: "#0c1a17",
  superficie: "#132622",
  texto: "#e6f2ef",
  textoSuave: "#a5bfb8",
  borda: "#2c4741",
  desabilitado: "#2c3b38",
  desabilitadoTexto: "#8ea29c",
  sucesso: "#7fd6a2",
  sucessoFundo: "#12311f",
  erro: "#ff9d94",
  erroFundo: "#3b1714",
  aviso: "#f2c669",
  avisoFundo: "#3a2c0d",
  sobrePrimaria: "#08201b",
};

export const espaco = { p: 8, m: 16, g: 24, gg: 36 };
export const raio = 14;
export const ALVO_MINIMO = 48;
export const fonte = { corpo: 17, pequena: 14, titulo: 26, subtitulo: 20 };

// Uso: const c = useTema();  ->  c.primaria, c.texto, ...
export function useTema() {
  return useColorScheme() === "dark" ? escuro : claro;
}
