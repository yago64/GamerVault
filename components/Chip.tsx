import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Cores, Raio } from '@/constants/theme';

type Props = {
  rotulo: string;
  selecionado?: boolean;
  onPress?: () => void;
};

/** Botão em formato de pílula, usado em filtros e seleções. */
export default function Chip({ rotulo, selecionado = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selecionado && styles.selecionado,
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
    >
      <Text style={[styles.texto, selecionado && styles.textoSelecionado]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Raio.pill,
    backgroundColor: Cores.superficie,
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  selecionado: {
    backgroundColor: Cores.primaria,
    borderColor: Cores.primaria,
  },
  texto: {
    color: Cores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
  },
  textoSelecionado: {
    color: Cores.branco,
  },
});
