import { API_URL, REQUEST_TIMEOUT_MS, SLOW_NOTICE_MS } from "../config.js";
import { sessao } from "./session.js";
import { emitir } from "./events.js";

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let pendentes = 0;

// Cliente HTTP único. Services nunca chamam fetch diretamente.
// A API responde erros como { erro } (400/500) ou { mensagem } (401/403/404/409).
// O token (JWT) vai em todas as chamadas. `token` força outro (logo após o login) e `autenticar: false` não envia nenhum.
export async function http(path, { method = "GET", body, token, autenticar = true } = {}) {
  const jwt = token ?? (autenticar ? sessao.token() : null);
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const aviso = setTimeout(() => emitir("api:lenta"), SLOW_NOTICE_MS);
  pendentes++;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      // Token inválido ou vencido: a sessão não vale mais. Limpar dispara o evento "sessao",
      // e a navegação volta sozinha para o início (no web era location.replace).
      if (res.status === 401 && jwt && autenticar && !token) {
        await sessao.limpar();
        emitir("sessao:expirou");
      }
      const msg = data?.erro ?? data?.mensagem ?? `Erro ${res.status} ao falar com o servidor.`;
      throw new ApiError(msg, res.status, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError("O servidor demorou demais para responder. Tente novamente.", 0);
    }
    throw new ApiError("Sem conexão com o servidor. Verifique sua internet.", 0);
  } finally {
    clearTimeout(timeout);
    clearTimeout(aviso);
    pendentes--;
    if (pendentes === 0) emitir("api:ociosa");
  }
}

// Fábrica de CRUD para recursos padrão da API.
export const crud = (base) => ({
  listar: () => http(base),
  buscar: (id) => http(`${base}/${id}`),
  criar: (dados) => http(base, { method: "POST", body: dados }),
  atualizar: (id, dados) => http(`${base}/${id}`, { method: "PUT", body: dados }),
  remover: (id) => http(`${base}/${id}`, { method: "DELETE" }),
});
