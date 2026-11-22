// Barramento mínimo de eventos (no web eram CustomEvents da janela).
const ouvintes = new Map();

export function ouvir(nome, fn) {
  if (!ouvintes.has(nome)) ouvintes.set(nome, new Set());
  ouvintes.get(nome).add(fn);
  return () => ouvintes.get(nome)?.delete(fn);
}

export function emitir(nome, dados) {
  ouvintes.get(nome)?.forEach((fn) => fn(dados));
}
