export type Jogo = {
  id: string;
  titulo: string;
  /** Gênero principal (define a fileira na Home e a cor do pôster). */
  genero: string;
  /** Subtítulo livre, ex.: "RPG / Soulslike". */
  categoria: string;
  descricao: string;
  /** Nota de 0 a 10. */
  nota: number;
  ano: number;
  plataformas: string[];
  /** URL remota ou caminho local da capa. Sem capa, o app gera um pôster. */
  capa?: string;
  destaque?: boolean;
};

export type JogoInput = Omit<Jogo, 'id'>;

export const PLATAFORMAS = ['PC', 'PS5', 'Xbox', 'Switch', 'Mobile'] as const;
