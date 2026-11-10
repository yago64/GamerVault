/**
 * Identidade visual do GamerVault: fundo escuro com detalhes em azul
 * (azul como cor de ação e azul-céu como cor de apoio). As capas dos jogos são
 * o elemento mais marcante; o resto da interface fica quieto para não competir com elas.
 */

export const Cores = {
  fundo: '#060910',
  superficie: '#0D1320',
  superficieAlt: '#141C2E',
  borda: '#1E2A45',

  texto: '#EAF1FF',
  textoSuave: '#9DB0D3',
  textoMudo: '#647599',

  primaria: '#2F80FF',
  primariaClara: '#6FA8FF',
  primariaSuave: 'rgba(47, 128, 255, 0.16)',
  destaque: '#38BDF8',

  sucesso: '#34D399',
  perigo: '#F87171',
  perigoSuave: 'rgba(248, 113, 113, 0.14)',
  alerta: '#FBBF24',
  nota: '#FBBF24',

  overlay: 'rgba(6, 9, 16, 0.72)',
  branco: '#FFFFFF',
} as const;

export const Espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const Raio = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;
