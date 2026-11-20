import { createContext, useContext, useEffect, useState } from "react";
import { sessao } from "../core/session.js";
import { ouvir } from "../core/events.js";

const Ctx = createContext({ carregando: true, usuario: null });

// Lê a sessão salva uma vez na abertura e acompanha login/logout/expiração (evento "sessao").
export function SessaoProvider({ children }) {
  const [estado, setEstado] = useState({ carregando: true, usuario: null });

  useEffect(() => {
    let vivo = true;
    sessao.carregar().then((u) => vivo && setEstado({ carregando: false, usuario: u?.token ? u : null }));
    const parar = ouvir("sessao", (u) => setEstado({ carregando: false, usuario: u?.token ? u : null }));
    return () => { vivo = false; parar(); };
  }, []);

  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>;
}

export const useSessao = () => useContext(Ctx);
