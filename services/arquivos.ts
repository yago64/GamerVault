import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

import type { Jogo } from '@/types/jogo';

/* -------------------------------------------------------------------------- */
/* Compartilhar texto (Share API do React Native)                              */
/* -------------------------------------------------------------------------- */

export async function compartilharJogo(jogo: Jogo): Promise<void> {
  await Share.share({
    title: jogo.titulo,
    message:
      `🎮 ${jogo.titulo} (${jogo.ano})\n` +
      `${jogo.categoria} - nota ${jogo.nota.toFixed(1)}/10\n\n` +
      `${jogo.descricao}\n\n` +
      'Salvo no meu GamerVault.',
  });
}

/* -------------------------------------------------------------------------- */
/* Imagens: copiar da pasta temporária para a pasta permanente do app         */
/* -------------------------------------------------------------------------- */

/**
 * Fotos tiradas e imagens escolhidas na galeria ficam em um diretório de CACHE,
 * que o sistema pode limpar a qualquer momento. Para guardar o caminho no
 * AsyncStorage, antes copiamos o arquivo para a pasta de documentos do app.
 */
export function persistirImagem(uri: string, prefixo: string): string {
  if (Platform.OS === 'web') return uri;

  try {
    const extensao = /\.(\w{3,4})(?:\?|$)/.exec(uri)?.[1] ?? 'jpg';
    const destino = new File(Paths.document, `${prefixo}-${Date.now()}.${extensao}`);
    new File(uri).copy(destino);
    return destino.uri;
  } catch (erro) {
    console.error('Erro ao salvar imagem no app:', erro);
    return uri;
  }
}

/** Apaga uma imagem antiga, mas só se ela estiver na pasta do próprio app. */
export function removerImagem(uri?: string): void {
  if (!uri || Platform.OS === 'web') return;
  try {
    if (!uri.startsWith(Paths.document.uri)) return;
    const arquivo = new File(uri);
    if (arquivo.exists) arquivo.delete();
  } catch (erro) {
    console.error('Erro ao remover imagem:', erro);
  }
}

/* -------------------------------------------------------------------------- */
/* Backup da Minha Lista (arquivo JSON)                                        */
/* -------------------------------------------------------------------------- */

export type BackupLista = {
  app: 'GamerVault';
  versao: 1;
  geradoEm: string;
  favoritos: { id: string; titulo: string }[];
};

function ehBackup(dados: unknown): dados is BackupLista {
  if (typeof dados !== 'object' || dados === null) return false;
  const candidato = dados as Partial<BackupLista>;
  return (
    candidato.app === 'GamerVault' &&
    Array.isArray(candidato.favoritos) &&
    candidato.favoritos.every((item) => typeof item?.id === 'string')
  );
}

/** Grava a lista num .json temporário e abre o menu de compartilhamento. */
export async function exportarLista(favoritos: Jogo[]): Promise<'compartilhado' | 'indisponivel'> {
  if (Platform.OS === 'web') {
    throw new Error('A exportação de arquivos funciona no aplicativo (Android e iOS).');
  }

  const backup: BackupLista = {
    app: 'GamerVault',
    versao: 1,
    geradoEm: new Date().toISOString(),
    favoritos: favoritos.map((jogo) => ({ id: jogo.id, titulo: jogo.titulo })),
  };

  const arquivo = new File(Paths.cache, 'minha-lista-gamervault.json');
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  arquivo.write(JSON.stringify(backup, null, 2));

  if (!(await Sharing.isAvailableAsync())) return 'indisponivel';

  await Sharing.shareAsync(arquivo.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Exportar Minha Lista',
    UTI: 'public.json',
  });
  return 'compartilhado';
}

/** Abre o seletor de documentos, lê o arquivo escolhido e valida o conteúdo. */
export async function importarLista(): Promise<BackupLista | null> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (resultado.canceled) return null;

  const texto = await new File(resultado.assets[0].uri).text();

  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new Error('O arquivo escolhido não é um JSON válido.');
  }

  if (!ehBackup(dados)) {
    throw new Error('Este arquivo não parece ser um backup do GamerVault.');
  }
  return dados;
}
