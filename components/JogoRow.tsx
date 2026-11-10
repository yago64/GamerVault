import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import JogoCard from '@/components/JogoCard';
import { Cores, Espaco } from '@/constants/theme';
import type { Jogo } from '@/types/jogo';

type Props = {
  titulo: string;
  jogos: Jogo[];
  onVerTudo?: () => void;
};

/** Fileira horizontal de pôsteres, como nas telas de catálogo de streaming. */
export default function JogoRow({ titulo, jogos, onVerTudo }: Props) {
  return (
    <View style={styles.secao}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo} accessibilityRole="header">
          {titulo}
        </Text>
        {onVerTudo && (
          <Pressable
            onPress={onVerTudo}
            hitSlop={10}
            style={styles.verTudo}
            accessibilityRole="button"
            accessibilityLabel={`Ver tudo em ${titulo}`}
          >
            <Text style={styles.verTudoTexto}>Ver tudo</Text>
            <Ionicons name="chevron-forward" size={14} color={Cores.primariaClara} />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        data={jogos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JogoCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lista}
        initialNumToRender={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  secao: {
    marginTop: 22,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Espaco.lg,
    marginBottom: Espaco.md,
  },
  titulo: {
    color: Cores.texto,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.25,
  },
  verTudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verTudoTexto: {
    color: Cores.primariaClara,
    fontSize: 13,
    fontWeight: '600',
  },
  lista: {
    paddingHorizontal: Espaco.lg,
    gap: 10,
  },
});
