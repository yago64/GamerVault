import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Poster from '@/components/Poster';
import { Cores, Raio } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import type { Jogo } from '@/types/jogo';

type Props = {
  item: Jogo;
  largura?: number;
};


export default function JogoCard({ item, largura = 116 }: Props) {
  const router = useRouter();
  const { ehFavorito } = useJogos();
  const salvo = ehFavorito(item.id);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/detalhes/[id]', params: { id: item.id } })}
      style={({ pressed }) => [
        { width: largura },
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.titulo}, nota ${item.nota.toFixed(1)}. Abrir detalhes`}
    >
      <View style={[styles.capa, { width: largura, height: largura * 1.5 }]}>
        <Poster
          jogo={item}
          tamanhoTitulo={largura > 110 ? 15 : 13}
          tamanhoMarca={largura * 0.95}
          estilo={StyleSheet.absoluteFill}
        />

        <View style={styles.nota}>
          <Ionicons name="star" size={10} color={Cores.nota} />
          <Text style={styles.notaTexto}>{item.nota.toFixed(1)}</Text>
        </View>

        {salvo && (
          <View style={styles.selo}>
            <Ionicons name="bookmark" size={13} color={Cores.branco} />
          </View>
        )}
      </View>

      <Text style={styles.titulo} numberOfLines={1}>
        {item.titulo}
      </Text>
      <Text style={styles.sub} numberOfLines={1}>
        {item.categoria}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  capa: {
    borderRadius: Raio.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  nota: {
    position: 'absolute',
    left: 6,
    top: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6,9,16,0.78)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Raio.pill,
  },
  notaTexto: {
    color: Cores.texto,
    fontSize: 11,
    fontWeight: '700',
  },
  selo: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: Cores.primaria,
    padding: 4,
    borderRadius: Raio.pill,
  },
  titulo: {
    marginTop: 8,
    color: Cores.texto,
    fontSize: 13,
    fontWeight: '700',
  },
  sub: {
    marginTop: 2,
    color: Cores.textoMudo,
    fontSize: 12,
  },
});
