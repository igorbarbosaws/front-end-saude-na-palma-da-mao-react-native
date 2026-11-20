import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

// Carrega dados de uma tela e cuida de "carregando" e "erro".
//
//   const { dados, carregando, erro, recarregar } = useCarregar(() => clinicaService.listar(), []);
//
// - roda de novo toda vez que a tela volta a ficar em foco (ex.: depois de cancelar uma consulta e voltar);
// - `deps` funciona como no useEffect: muda -> busca de novo;
// - `recarregar()` busca de novo na mão (botão "Tentar novamente" ou puxar para atualizar).
export function useCarregar(buscar, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: "" });
  const contador = useRef(0);

  const executar = useCallback(async () => {
    const minha = ++contador.current;
    setEstado((e) => ({ ...e, carregando: true, erro: "" }));
    try {
      const dados = await buscar();
      if (minha === contador.current) setEstado({ dados, carregando: false, erro: "" });
    } catch (e) {
      if (minha === contador.current) setEstado((a) => ({ ...a, carregando: false, erro: e.message || "Algo deu errado." }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      executar();
      return () => {
        contador.current++; // ignora resposta que chegar depois de sair da tela
      };
    }, [executar]),
  );

  return { ...estado, recarregar: executar };
}

// Versão para ações (salvar, cancelar...): `executar()` devolve o resultado ou lança o erro e controla `ocupado`.
export function useAcao() {
  const [ocupado, setOcupado] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  const executar = async (fn) => {
    setOcupado(true);
    try {
      return await fn();
    } finally {
      if (mounted.current) setOcupado(false);
    }
  };
  return { ocupado, executar };
}
