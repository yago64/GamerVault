import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Chip from '@/components/Chip';
import EstadoVazio from '@/components/EstadoVazio';
import JogoCard from '@/components/JogoCard';
import { Cores, Espaco, Raio } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import { GENEROS } from '@/data/generos';
import { filtrar, ordenar, type Ordem } from '@/utils/catalogo';

const COLUNAS = 3;
const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: 'nota', rotulo: 'Melhor nota' },
  { valor: 'ano', rotulo: 'Mais recentes' },
  { valor: 'nome', rotulo: 'A a Z' },
];

export default function BuscarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { jogos } = useJogos();
  const params = useLocalSearchParams<{ genero?: string; t?: string }>();

  const [busca, setBusca] = useState('');
  const [genero, setGenero] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<Ordem>('nota');

  // "Ver tudo" na Home chega aqui com o gênero já escolhido.
  useEffect(() => {
    if (params.genero) setGenero(params.genero);
  }, [params.genero, params.t]);

  const resultado = useMemo(
    () => ordenar(filtrar(jogos, busca, genero), ordem),
    [jogos, busca, genero, ordem],
  );

  const espacamento = Espaco.md;
  const larguraCard = Math.floor((width - Espaco.lg * 2 - espacamento * (COLUNAS - 1)) / COLUNAS);

  const filtros = (
    <View>
      <Text style={styles.titulo} accessibilityRole="header">
        Buscar
      </Text>

      <View style={styles.busca}>
        <Ionicons name="search" size={18} color={Cores.textoMudo} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Título, gênero ou categoria"
          placeholderTextColor={Cores.textoMudo}
          selectionColor={Cores.primariaClara}
          style={styles.buscaInput}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Buscar jogos"
        />
        {busca.length > 0 && (
          <Pressable
            onPress={() => setBusca('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <Ionicons name="close-circle" size={18} color={Cores.textoMudo} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip rotulo="Todos" selecionado={genero === null} onPress={() => setGenero(null)} />
        {GENEROS.map((item) => (
          <Chip
            key={item}
            rotulo={item}
            selecionado={genero === item}
            onPress={() => setGenero(genero === item ? null : item)}
          />
        ))}
      </ScrollView>

      <View style={styles.linhaOrdem}>
        <Text style={styles.contagem}>
          {resultado.length} {resultado.length === 1 ? 'jogo' : 'jogos'}
        </Text>
        <View style={styles.ordens}>
          {ORDENS.map((item) => (
            <Pressable
              key={item.valor}
              onPress={() => setOrdem(item.valor)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityState={{ selected: ordem === item.valor }}
            >
              <Text style={[styles.ordem, ordem === item.valor && styles.ordemAtiva]}>
                {item.rotulo}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.tela, { paddingTop: insets.top + 12 }]}>
      <FlatList
        key={COLUNAS}
        data={resultado}
        keyExtractor={(item) => item.id}
        numColumns={COLUNAS}
        renderItem={({ item }) => <JogoCard item={item} largura={larguraCard} />}
        ListHeaderComponent={filtros}
        ListEmptyComponent={
          <EstadoVazio
            icone="search-outline"
            titulo="Nenhum jogo encontrado"
            texto="Tente outro nome ou remova o filtro de gênero."
            acao={
              busca || genero
                ? {
                    rotulo: 'Limpar filtros',
                    onPress: () => {
                      setBusca('');
                      setGenero(null);
                    },
                  }
                : { rotulo: 'Adicionar jogo', onPress: () => router.push('/jogo/form') }
            }
          />
        }
        columnWrapperStyle={{ gap: espacamento, paddingHorizontal: Espaco.lg }}
        contentContainerStyle={{ paddingBottom: Espaco.xxl, rowGap: Espaco.lg }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
  titulo: {
    color: Cores.texto,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    paddingHorizontal: Espaco.lg,
    marginBottom: Espaco.md,
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Espaco.lg,
    paddingHorizontal: 14,
    backgroundColor: Cores.superficie,
    borderWidth: 1,
    borderColor: Cores.borda,
    borderRadius: Raio.md,
  },
  buscaInput: {
    flex: 1,
    minHeight: 46,
    color: Cores.texto,
    fontSize: 15,
  },
  chips: {
    gap: 8,
    paddingHorizontal: Espaco.lg,
    paddingVertical: Espaco.md,
  },
  linhaOrdem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Espaco.lg,
    marginBottom: Espaco.md,
  },
  contagem: {
    color: Cores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
  },
  ordens: {
    flexDirection: 'row',
    gap: 14,
  },
  ordem: {
    color: Cores.textoMudo,
    fontSize: 12,
    fontWeight: '600',
  },
  ordemAtiva: {
    color: Cores.primariaClara,
  },
});
