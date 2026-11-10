import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Poster from '@/components/Poster';
import { Cores, Raio } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import type { Jogo } from '@/types/jogo';

type Props = {
  jogo: Jogo;
  /** Espaço extra no topo para o conteúdo não ficar sob o cabeçalho flutuante. */
  topo?: number;
};

/** Destaque grande no topo da Home. */
export default function HeroBanner({ jogo, topo = 0 }: Props) {
  const { width } = useWindowDimensions();
  const { ehFavorito, alternarFavorito } = useJogos();
  const salvo = ehFavorito(jogo.id);
  const altura = Math.min(Math.round(width * 1.08), 500) + topo;

  return (
    <View style={{ height: altura }}>
      <Poster
        jogo={jogo}
        mostrarTitulo={false}
        tamanhoMarca={width * 0.9}
        estilo={StyleSheet.absoluteFill}
      />

      {/* Escurece a base para o texto ficar legível e emendar com o fundo do app. */}
      <LinearGradient
        colors={['rgba(6,9,16,0.16)', 'transparent', 'rgba(6,9,16,0.88)', Cores.fundo]}
        locations={[0, 0.22, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.conteudo}>
        <View style={styles.etiquetas}>
          <View style={styles.etiqueta}>
            <Text style={styles.etiquetaTexto}>EM DESTAQUE</Text>
          </View>
          <View style={styles.nota}>
            <Ionicons name="star" size={13} color={Cores.nota} />
            <Text style={styles.notaTexto}>{jogo.nota.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.titulo} numberOfLines={3}>
          {jogo.titulo}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {jogo.categoria}  •  {jogo.ano}
        </Text>
        <Text style={styles.descricao} numberOfLines={2}>
          {jogo.descricao}
        </Text>

        <View style={styles.acoes}>
          {/* Navegação declarativa: <Link> com asChild repassa o onPress ao Pressable. */}
          <Link href={{ pathname: '/detalhes/[id]', params: { id: jogo.id } }} asChild>
            <Pressable
              style={({ pressed }) => [styles.botaoPrimario, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalhes de ${jogo.titulo}`}
            >
              <Ionicons name="information-circle" size={20} color={Cores.fundo} />
              <Text style={styles.botaoPrimarioTexto}>Ver detalhes</Text>
            </Pressable>
          </Link>

          <Pressable
            onPress={() => alternarFavorito(jogo.id)}
            style={({ pressed }) => [styles.botaoSecundario, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={salvo ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
          >
            <Ionicons
              name={salvo ? 'checkmark' : 'add'}
              size={20}
              color={Cores.texto}
            />
            <Text style={styles.botaoSecundarioTexto}>Minha Lista</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 22,
  },
  etiquetas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  etiqueta: {
    backgroundColor: Cores.primaria,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Raio.pill,
  },
  etiquetaTexto: {
    color: Cores.branco,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6,9,16,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Raio.pill,
  },
  notaTexto: {
    color: Cores.texto,
    fontSize: 12,
    fontWeight: '700',
  },
  titulo: {
    color: Cores.branco,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.9,
    textShadowColor: 'rgba(0,0,0,0.38)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  sub: {
    color: Cores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
  },
  descricao: {
    color: 'rgba(234,241,255,0.86)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    maxWidth: 340,
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  botaoPrimario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: Raio.md,
    backgroundColor: Cores.texto,
  },
  botaoPrimarioTexto: {
    color: Cores.fundo,
    fontSize: 15,
    fontWeight: '800',
  },
  botaoSecundario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: Raio.md,
    backgroundColor: 'rgba(234,241,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(234,241,255,0.22)',
  },
  botaoSecundarioTexto: {
    color: Cores.texto,
    fontSize: 15,
    fontWeight: '700',
  },
});
