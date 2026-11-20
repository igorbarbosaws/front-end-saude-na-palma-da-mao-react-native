import AsyncStorage from "@react-native-async-storage/async-storage";
import { SESSION_KEY } from "../config.js";
import { emitir } from "./events.js";

// Sessão do usuário. Nunca guarda a senha.
// Formato: { idUsuario, nome, email, tipo, token, idPaciente?, idProfissional? }
//
// No navegador o storage era síncrono; no app o AsyncStorage é assíncrono. Para o http.js continuar
// síncrono, a sessão fica em memória (`atual`) e o AsyncStorage só persiste. `carregar()` roda uma vez na abertura.
// "lembrar" = true  -> grava no aparelho (continua conectado ao reabrir o app)
// "lembrar" = false -> vale só enquanto o app estiver aberto
let atual = null;

export const sessao = {
  async carregar() {
    try {
      const texto = await AsyncStorage.getItem(SESSION_KEY);
      atual = texto ? JSON.parse(texto) : null;
    } catch {
      atual = null;
    }
    return atual;
  },
  get: () => atual,
  async set(dados, { lembrar = true } = {}) {
    atual = dados;
    try {
      if (lembrar) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(dados));
      else await AsyncStorage.removeItem(SESSION_KEY);
    } catch {
      /* armazenamento indisponível: a sessão vale só até fechar o app */
    }
    emitir("sessao", atual);
  },
  // Atualiza campos (ex.: nome e e-mail depois de editar o perfil) mantendo onde estava guardada.
  async atualizar(parcial) {
    if (!atual) return;
    atual = { ...atual, ...parcial };
    try {
      if (await AsyncStorage.getItem(SESSION_KEY)) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(atual));
    } catch {
      /* ignora */
    }
    emitir("sessao", atual);
  },
  token: () => atual?.token ?? null,
  async limpar() {
    atual = null;
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignora */
    }
    emitir("sessao", null);
  },
};
