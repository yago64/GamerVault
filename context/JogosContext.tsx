import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  atualizarJogo,
  criarJogo,
  excluirJogo,
  lerCatalogoLocal,
  listarJogos,
  type Origem,
} from '@/services/jogosRepository';
import { CHAVES, carregarJSON, removerVarias, salvarJSON } from '@/services/storage';
import { JOGOS_INICIAIS } from '@/data/jogos';
import type { Jogo, JogoInput } from '@/types/jogo';

type JogosContextValue = {
  jogos: Jogo[];
  favoritos: string[];
  /** true só até o app ler o que estava salvo no aparelho (rápido, sem rede). */
  carregando: boolean;
  /** true durante a busca na API (usado no pull-to-refresh). */
  atualizando: boolean;
  /** De onde vieram os dados atuais. null até a primeira resposta. */
  origem: Origem | null;
  recarregar: () => Promise<void>;
  obterJogo: (id: string) => Jogo | undefined;
  criar: (entrada: JogoInput) => Promise<{ jogo: Jogo; origem: Origem }>;
  atualizar: (id: string, entrada: JogoInput) => Promise<{ jogo: Jogo; origem: Origem }>;
  excluir: (id: string) => Promise<Origem>;
  ehFavorito: (id: string) => boolean;
  alternarFavorito: (id: string) => void;
  definirFavoritos: (ids: string[]) => void;
  resetarDados: () => Promise<void>;
};

const JogosContext = createContext<JogosContextValue | undefined>(undefined);

export function JogosProvider({ children }: React.PropsWithChildren) {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [origem, setOrigem] = useState<Origem | null>(null);

  const recarregar = useCallback(async () => {
    setAtualizando(true);
    try {
      const resultado = await listarJogos();
      setJogos(resultado.dados);
      setOrigem(resultado.origem);
    } finally {
      setAtualizando(false);
    }
  }, []);

  // 1) Mostra na hora o que está salvo no aparelho; 2) atualiza pela API em segundo plano.
  useEffect(() => {
    let ativo = true;
    (async () => {
      const [salvosFavoritos, catalogo] = await Promise.all([
        carregarJSON<string[]>(CHAVES.favoritos),
        lerCatalogoLocal(),
      ]);
      if (!ativo) return;
      setFavoritos(salvosFavoritos ?? []);
      setJogos(catalogo);
      setCarregando(false);
      await recarregar();
    })();
    return () => {
      ativo = false;
    };
  }, [recarregar]);

  const obterJogo = useCallback((id: string) => jogos.find((jogo) => jogo.id === id), [jogos]);

  const criar = useCallback(async (entrada: JogoInput) => {
    const resultado = await criarJogo(entrada);
    setJogos((atuais) => [...atuais, resultado.dados]);
    setOrigem(resultado.origem);
    return { jogo: resultado.dados, origem: resultado.origem };
  }, []);

  const atualizar = useCallback(async (id: string, entrada: JogoInput) => {
    const resultado = await atualizarJogo(id, entrada);
    setJogos((atuais) => atuais.map((jogo) => (jogo.id === id ? resultado.dados : jogo)));
    setOrigem(resultado.origem);
    return { jogo: resultado.dados, origem: resultado.origem };
  }, []);

  const excluir = useCallback(
    async (id: string) => {
      const resultado = await excluirJogo(id);
      setJogos((atuais) => atuais.filter((jogo) => jogo.id !== id));
      setOrigem(resultado);
      if (favoritos.includes(id)) {
        const novos = favoritos.filter((fav) => fav !== id);
        setFavoritos(novos);
        await salvarJSON(CHAVES.favoritos, novos);
      }
      return resultado;
    },
    [favoritos],
  );

  const ehFavorito = useCallback((id: string) => favoritos.includes(id), [favoritos]);

  const definirFavoritos = useCallback((ids: string[]) => {
    setFavoritos(ids);
    salvarJSON(CHAVES.favoritos, ids);
  }, []);

  const alternarFavorito = useCallback(
    (id: string) => {
      definirFavoritos(
        favoritos.includes(id) ? favoritos.filter((fav) => fav !== id) : [...favoritos, id],
      );
    },
    [favoritos, definirFavoritos],
  );

  /** Apaga tudo que o app guardou no aparelho e volta ao catálogo inicial. */
  const resetarDados = useCallback(async () => {
    await removerVarias([CHAVES.favoritos, CHAVES.jogos, CHAVES.localizacao]);
    setFavoritos([]);
    setJogos(JOGOS_INICIAIS);
    await recarregar();
  }, [recarregar]);

  const valor = useMemo(
    () => ({
      jogos,
      favoritos,
      carregando,
      atualizando,
      origem,
      recarregar,
      obterJogo,
      criar,
      atualizar,
      excluir,
      ehFavorito,
      alternarFavorito,
      definirFavoritos,
      resetarDados,
    }),
    [
      jogos,
      favoritos,
      carregando,
      atualizando,
      origem,
      recarregar,
      obterJogo,
      criar,
      atualizar,
      excluir,
      ehFavorito,
      alternarFavorito,
      definirFavoritos,
      resetarDados,
    ],
  );

  return <JogosContext.Provider value={valor}>{children}</JogosContext.Provider>;
}

export function useJogos() {
  const context = useContext(JogosContext);

  if (!context) {
    throw new Error('useJogos deve ser usado dentro de JogosProvider');
  }

  return context;
}
