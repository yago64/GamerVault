import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Botao from '@/components/Botao';
import EstadoVazio from '@/components/EstadoVazio';
import JogoCard from '@/components/JogoCard';
import { Cores, Espaco } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import { exportarLista, importarLista } from '@/services/arquivos';
import { mostrarMensagem } from '@/utils/mensagem';

const COLUNAS = 3;

export default function ListaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { jogos, favoritos, definirFavoritos } = useJogos();
  const [ocupado, setOcupado] = useState<'exportar' | 'importar' | null>(null);

  const minhaLista = useMemo(
    () => jogos.filter((jogo) => favoritos.includes(jogo.id)),
    [jogos, favoritos],
  );

  const espacamento = Espaco.md;
  const larguraCard = Math.floor((width - Espaco.lg * 2 - espacamento * (COLUNAS - 1)) / COLUNAS);

  const handleExportar = async () => {
    if (minhaLista.length === 0) {
      mostrarMensagem('Lista vazia', 'Adicione jogos à Minha Lista antes de exportar.');
      return;
    }
    setOcupado('exportar');
    try {
      const resultado = await exportarLista(minhaLista);
      if (resultado === 'indisponivel') {
        mostrarMensagem('Compartilhamento indisponível', 'Este aparelho não permite compartilhar arquivos.');
      }
    } catch (erro) {
      mostrarMensagem('Não foi possível exportar', erro instanceof Error ? erro.message : 'Tente de novo.');
    } finally {
      setOcupado(null);
    }
  };

  const handleImportar = async () => {
    setOcupado('importar');
    try {
      const backup = await importarLista();
      if (!backup) return; // a pessoa cancelou o seletor

      const idsExistentes = new Set(jogos.map((jogo) => jogo.id));
      const importaveis = backup.favoritos.map((item) => item.id).filter((id) => idsExistentes.has(id));
      const unicos = Array.from(new Set([...favoritos, ...importaveis]));
      const novos = unicos.length - favoritos.length;
      const ignorados = backup.favoritos.length - importaveis.length;

      definirFavoritos(unicos);
      mostrarMensagem(
        'Lista importada',
        `${novos} ${novos === 1 ? 'jogo adicionado' : 'jogos adicionados'}` +
          (ignorados > 0 ? `. ${ignorados} não existem mais na biblioteca.` : '.'),
      );
    } catch (erro) {
      mostrarMensagem('Não foi possível importar', erro instanceof Error ? erro.message : 'Tente de novo.');
    } finally {
      setOcupado(null);
    }
  };

  const topo = (
    <View style={styles.topo}>
      <Text style={styles.titulo} accessibilityRole="header">
        Minha Lista
      </Text>
      <Text style={styles.sub}>
        {minhaLista.length === 0
          ? 'Os jogos que você marcar aparecem aqui.'
          : `${minhaLista.length} ${minhaLista.length === 1 ? 'jogo salvo' : 'jogos salvos'}`}
      </Text>

      <View style={styles.acoes}>
        <Botao
          titulo="Exportar"
          icone="share-outline"
          variante="secundario"
          compacto
          carregando={ocupado === 'exportar'}
          desabilitado={ocupado !== null}
          onPress={handleExportar}
          estilo={styles.acao}
        />
        <Botao
          titulo="Importar"
          icone="document-text-outline"
          variante="secundario"
          compacto
          carregando={ocupado === 'importar'}
          desabilitado={ocupado !== null}
          onPress={handleImportar}
          estilo={styles.acao}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.tela, { paddingTop: insets.top + 12 }]}>
      <FlatList
        data={minhaLista}
        keyExtractor={(item) => item.id}
        numColumns={COLUNAS}
        renderItem={({ item }) => <JogoCard item={item} largura={larguraCard} />}
        ListHeaderComponent={topo}
        ListEmptyComponent={
          <EstadoVazio
            icone="bookmark-outline"
            titulo="Nada por aqui ainda"
            texto="Abra um jogo e toque em Minha Lista para guardá-lo. Quem já tem um backup pode importar o arquivo."
            acao={{ rotulo: 'Explorar jogos', onPress: () => router.push('/buscar') }}
          />
        }
        columnWrapperStyle={{ gap: espacamento, paddingHorizontal: Espaco.lg }}
        contentContainerStyle={{ paddingBottom: Espaco.xxl, rowGap: Espaco.lg }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  topo: {
    paddingHorizontal: Espaco.lg,
    marginBottom: Espaco.lg,
  },
  titulo: {
    color: Cores.texto,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  sub: {
    color: Cores.textoSuave,
    fontSize: 14,
    marginTop: 4,
  },
  acoes: {
    flexDirection: 'row',
    gap: Espaco.sm,
    marginTop: Espaco.lg,
  },
  acao: {
    flex: 1,
  },
});
