import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type NomeIcone = ComponentProps<typeof Ionicons>['name'];

export const GENEROS = [
  'RPG',
  'Ação',
  'Aventura',
  'Metroidvania',
  'Roguelike',
  'Terror',
  'Corrida',
  'Simulação',
  'Estratégia',
  'Indie',
] as const;

type TemaGenero = { cores: [string, string]; icone: NomeIcone };

/** Cores e ícone usados nos pôsteres gerados quando o jogo não tem capa. */
const TEMAS: Record<string, TemaGenero> = {
  RPG: { cores: ['#6D28D9', '#1E1B4B'], icone: 'shield' },
  Ação: { cores: ['#EA580C', '#450A0A'], icone: 'flame' },
  Aventura: { cores: ['#0891B2', '#082F49'], icone: 'compass' },
  Metroidvania: { cores: ['#0D9488', '#042F2E'], icone: 'map' },
  Roguelike: { cores: ['#DB2777', '#3B0764'], icone: 'dice' },
  Terror: { cores: ['#991B1B', '#0C0A09'], icone: 'skull' },
  Corrida: { cores: ['#2563EB', '#172554'], icone: 'speedometer' },
  Simulação: { cores: ['#65A30D', '#1A2E05'], icone: 'leaf' },
  Estratégia: { cores: ['#CA8A04', '#422006'], icone: 'extension-puzzle' },
  Indie: { cores: ['#C026D3', '#2E1065'], icone: 'sparkles' },
};

const TEMA_PADRAO: TemaGenero = { cores: ['#475569', '#0F172A'], icone: 'game-controller' };

export function temaDoGenero(genero: string): TemaGenero {
  return TEMAS[genero] ?? TEMA_PADRAO;
}
