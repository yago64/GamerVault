import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EstadoVazio from '@/components/EstadoVazio';
import HeroBanner from '@/components/HeroBanner';
import JogoRow from '@/components/JogoRow';
import { Cores, Espaco, Raio } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import { montarSecoes, ordenar } from '@/utils/catalogo';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jogos, favoritos, origem, atualizando, recarregar } = useJogos();

  const destaque = useMemo(
    () => jogos.find((jogo) => jogo.destaque) ?? ordenar(jogos, 'nota')[0],
    [jogos],
  );
  const secoes = useMemo(() => montarSecoes(jogos, favoritos), [jogos, favoritos]);

  const verGenero = (genero: string) =>
    router.push({ pathname: '/buscar', params: { genero, t: String(Date.now()) } });

  const cabecalho = (
    <View style={[styles.cabecalho, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
      <LinearGradient
        colors={['rgba(6,9,16,0.85)', 'transparent']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.marca}>
        <Ionicons name="game-controller" size={21} color={Cores.primariaClara} />
        <Text style={styles.logo} accessibilityRole="header">
          GAMER<Text style={styles.logoDestaque}>VAULT</Text>
        </Text>
      </View>
      <View style={styles.acoesCabecalho}>
        <Pressable
          onPress={() => router.push('/buscar')}
          hitSlop={8}
          style={styles.botaoIcone}
          accessibilityRole="button"
          accessibilityLabel="Buscar jogos"
        >
          <Ionicons name="search" size={20} color={Cores.texto} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/jogo/form')}
          hitSlop={8}
          style={styles.botaoIcone}
          accessibilityRole="button"
          accessibilityLabel="Adicionar jogo"
        >
          <Ionicons name="add" size={22} color={Cores.texto} />
        </Pressable>
      </View>
    </View>
  );

  if (!destaque) {
    return (
      <View style={[styles.tela, { paddingTop: insets.top + 64 }]}>
        {cabecalho}
        <EstadoVazio
          icone="game-controller-outline"
          titulo="Sua biblioteca está vazia"
          texto="Adicione o primeiro jogo para montar o seu catálogo."
          acao={{ rotulo: 'Adicionar jogo', onPress: () => router.push('/jogo/form') }}
        />
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Espaco.xxl }}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={recarregar}
            tintColor={Cores.primariaClara}
            colors={[Cores.primaria]}
            progressViewOffset={insets.top + 40}
          />
        }
      >
        <HeroBanner jogo={destaque} topo={insets.top} />

        {origem === 'local' && (
          <Pressable
            onPress={recarregar}
            style={styles.aviso}
            accessibilityRole="button"
            accessibilityLabel="Tentar conectar à API de novo"
          >
            <Ionicons name="cloud-offline-outline" size={18} color={Cores.alerta} />
            <Text style={styles.avisoTexto}>
              Sem conexão com a API. Mostrando a biblioteca salva no aparelho.
            </Text>
            <Text style={styles.avisoAcao}>Tentar de novo</Text>
          </Pressable>
        )}

        {secoes.map((secao) => (
          <JogoRow
            key={secao.id}
            titulo={secao.titulo}
            jogos={secao.jogos}
            onVerTudo={secao.genero ? () => verGenero(secao.genero as string) : undefined}
          />
        ))}
      </ScrollView>

      {cabecalho}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  cabecalho: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Espaco.lg,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logo: {
    color: Cores.texto,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  logoDestaque: {
    color: Cores.primariaClara,
  },
  acoesCabecalho: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoIcone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,9,16,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(234,241,255,0.18)',
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: Espaco.lg,
    marginTop: Espaco.sm,
    padding: Espaco.md,
    borderRadius: Raio.md,
    backgroundColor: Cores.superficie,
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  avisoTexto: {
    flex: 1,
    minWidth: 180,
    color: Cores.textoSuave,
    fontSize: 12,
    lineHeight: 17,
  },
  avisoAcao: {
    color: Cores.primariaClara,
    fontSize: 12,
    fontWeight: '700',
  },
});
