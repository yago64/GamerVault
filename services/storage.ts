import AsyncStorage from '@react-native-async-storage/async-storage';

/** Todas as chaves do app em um só lugar, para não digitar string solta por aí. */
export const CHAVES = {
  usuario: '@gamervault:usuario',
  favoritos: '@gamervault:favoritos',
  jogos: '@gamervault:jogos',
  apiUrl: '@gamervault:apiUrl',
  localizacao: '@gamervault:localizacao',
} as const;

/** Objetos viram texto com JSON.stringify antes de ir para o AsyncStorage. */
export async function salvarJSON<T>(chave: string, valor: T): Promise<void> {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.error(`Erro ao salvar "${chave}":`, erro);
  }
}

/** getItem devolve null se a chave não existe; aqui isso vira `null` tipado. */
export async function carregarJSON<T>(chave: string): Promise<T | null> {
  try {
    const texto = await AsyncStorage.getItem(chave);
    return texto ? (JSON.parse(texto) as T) : null;
  } catch (erro) {
    console.error(`Erro ao carregar "${chave}":`, erro);
    return null;
  }
}

export async function salvarTexto(chave: string, valor: string): Promise<void> {
  try {
    await AsyncStorage.setItem(chave, valor);
  } catch (erro) {
    console.error(`Erro ao salvar "${chave}":`, erro);
  }
}

export async function carregarTexto(chave: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(chave);
  } catch (erro) {
    console.error(`Erro ao carregar "${chave}":`, erro);
    return null;
  }
}

export async function removerChave(chave: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(chave);
  } catch (erro) {
    console.error(`Erro ao remover "${chave}":`, erro);
  }
}

export async function removerVarias(chaves: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(chaves);
  } catch (erro) {
    console.error('Erro ao remover chaves:', erro);
  }
}
