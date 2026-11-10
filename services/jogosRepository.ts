import { JOGOS_INICIAIS } from '@/data/jogos';
import type { Jogo, JogoInput } from '@/types/jogo';

import { RedeError, requisitar } from './api';
import { CHAVES, carregarJSON, salvarJSON } from './storage';

/**
 * Repositório de jogos.
 *
 * A API (Node + Express) é a fonte da verdade quando está acessível. Cada
 * resposta bem-sucedida é copiada para o AsyncStorage; sem conexão, o app
 * usa essa cópia e continua funcionando (inclusive no APK instalado, onde
 * não existe "localhost").
 *
 * - 'api'   : o dado veio do servidor / foi gravado no servidor.
 * - 'local' : o dado veio do aparelho / foi gravado só neste aparelho.
 */
export type Origem = 'api' | 'local';
export type Resultado<T> = { dados: T; origem: Origem };

const PREFIXO_LOCAL = 'local-';
const ehIdLocal = (id: string) => id.startsWith(PREFIXO_LOCAL);

/** O servidor usa id numérico; o app trabalha com string. */
function normalizar(bruto: Partial<Jogo> & { id: string | number }): Jogo {
  return {
    id: String(bruto.id),
    titulo: bruto.titulo ?? 'Sem título',
    genero: bruto.genero ?? 'Indie',
    categoria: bruto.categoria ?? '',
    descricao: bruto.descricao ?? '',
    nota: Number(bruto.nota ?? 0),
    ano: Number(bruto.ano ?? 0),
    plataformas: Array.isArray(bruto.plataformas) ? bruto.plataformas : [],
    capa: bruto.capa || undefined,
    destaque: Boolean(bruto.destaque),
  };
}

async function lerCache(): Promise<Jogo[]> {
  return (await carregarJSON<Jogo[]>(CHAVES.jogos)) ?? JOGOS_INICIAIS;
}

export async function lerCatalogoLocal(): Promise<Jogo[]> {
  return lerCache();
}

export async function listarJogos(): Promise<Resultado<Jogo[]>> {
  try {
    const bruto = await requisitar<Jogo[]>('/jogos');
    const dados = bruto.map(normalizar);
    await salvarJSON(CHAVES.jogos, dados);
    return { dados, origem: 'api' };
  } catch {
    return { dados: await lerCache(), origem: 'local' };
  }
}

export async function criarJogo(entrada: JogoInput): Promise<Resultado<Jogo>> {
  try {
    const criado = normalizar(
      await requisitar<Jogo>('/jogos', { method: 'POST', body: JSON.stringify(entrada) }),
    );
    await salvarJSON(CHAVES.jogos, [...(await lerCache()), criado]);
    return { dados: criado, origem: 'api' };
  } catch (erro) {
    if (!(erro instanceof RedeError)) throw erro;
    const criado: Jogo = { ...entrada, id: `${PREFIXO_LOCAL}${Date.now()}` };
    await salvarJSON(CHAVES.jogos, [...(await lerCache()), criado]);
    return { dados: criado, origem: 'local' };
  }
}

export async function atualizarJogo(id: string, entrada: JogoInput): Promise<Resultado<Jogo>> {
  const salvarLocal = async (): Promise<Resultado<Jogo>> => {
    const atualizado: Jogo = { ...entrada, id };
    const cache = await lerCache();
    await salvarJSON(
      CHAVES.jogos,
      cache.map((jogo) => (jogo.id === id ? atualizado : jogo)),
    );
    return { dados: atualizado, origem: 'local' };
  };

  if (ehIdLocal(id)) return salvarLocal();

  try {
    const atualizado = normalizar(
      await requisitar<Jogo>(`/jogos/${id}`, { method: 'PUT', body: JSON.stringify(entrada) }),
    );
    const cache = await lerCache();
    await salvarJSON(
      CHAVES.jogos,
      cache.map((jogo) => (jogo.id === id ? atualizado : jogo)),
    );
    return { dados: atualizado, origem: 'api' };
  } catch (erro) {
    if (!(erro instanceof RedeError)) throw erro;
    return salvarLocal();
  }
}

export async function excluirJogo(id: string): Promise<Origem> {
  const removerLocal = async (): Promise<Origem> => {
    const cache = await lerCache();
    await salvarJSON(
      CHAVES.jogos,
      cache.filter((jogo) => jogo.id !== id),
    );
    return 'local';
  };

  if (ehIdLocal(id)) return removerLocal();

  try {
    await requisitar<void>(`/jogos/${id}`, { method: 'DELETE' });
    const cache = await lerCache();
    await salvarJSON(
      CHAVES.jogos,
      cache.filter((jogo) => jogo.id !== id),
    );
    return 'api';
  } catch (erro) {
    if (!(erro instanceof RedeError)) throw erro;
    return removerLocal();
  }
}
