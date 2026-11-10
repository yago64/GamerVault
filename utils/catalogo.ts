import { GENEROS } from '@/data/generos';
import type { Jogo } from '@/types/jogo';

export type Secao = {
  id: string;
  titulo: string;
  jogos: Jogo[];
  /** Quando a fileira é de um gênero, permite abrir a busca já filtrada. */
  genero?: string;
};

/** Remove acentos e caixa para comparar textos na busca. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export type Ordem = 'nota' | 'ano' | 'nome';

export function ordenar(jogos: Jogo[], ordem: Ordem): Jogo[] {
  const copia = [...jogos];
  if (ordem === 'nota') return copia.sort((a, b) => b.nota - a.nota);
  if (ordem === 'ano') return copia.sort((a, b) => b.ano - a.ano);
  return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
}

export function filtrar(jogos: Jogo[], busca: string, genero: string | null): Jogo[] {
  const termo = normalizar(busca);
  return jogos.filter((jogo) => {
    if (genero && jogo.genero !== genero) return false;
    if (!termo) return true;
    return normalizar(`${jogo.titulo} ${jogo.categoria} ${jogo.genero}`).includes(termo);
  });
}

/** Monta as fileiras da Home, no estilo "catálogo de streaming". */
export function montarSecoes(jogos: Jogo[], favoritos: string[]): Secao[] {
  const secoes: Secao[] = [];

  const minhaLista = jogos.filter((jogo) => favoritos.includes(jogo.id));
  if (minhaLista.length > 0) {
    secoes.push({ id: 'lista', titulo: 'Minha Lista', jogos: minhaLista });
  }

  secoes.push({ id: 'alta', titulo: 'Em alta agora', jogos: ordenar(jogos, 'nota').slice(0, 10) });
  secoes.push({ id: 'recentes', titulo: 'Lançamentos recentes', jogos: ordenar(jogos, 'ano').slice(0, 10) });

  for (const genero of GENEROS) {
    const doGenero = jogos.filter((jogo) => jogo.genero === genero);
    if (doGenero.length >= 2) {
      secoes.push({ id: `genero-${genero}`, titulo: genero, jogos: ordenar(doGenero, 'nota'), genero });
    }
  }

  return secoes.filter((secao) => secao.jogos.length > 0);
}
