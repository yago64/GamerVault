import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { Cores, Raio } from '@/constants/theme';
import type { NomeIcone } from '@/data/generos';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo';

type Props = {
  titulo: string;
  onPress?: () => void;
  onLongPress?: () => void;
  variante?: Variante;
  icone?: NomeIcone;
  carregando?: boolean;
  desabilitado?: boolean;
  compacto?: boolean;
  estilo?: StyleProp<ViewStyle>;
};

const FUNDO: Record<Variante, string> = {
  primario: Cores.primaria,
  secundario: Cores.superficieAlt,
  fantasma: 'transparent',
  perigo: Cores.perigoSuave,
};

const COR_TEXTO: Record<Variante, string> = {
  primario: Cores.branco,
  secundario: Cores.texto,
  fantasma: Cores.primariaClara,
  perigo: Cores.perigo,
};

export default function Botao({
  titulo,
  onPress,
  onLongPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  compacto = false,
  estilo,
}: Props) {
  const inativo = desabilitado || carregando;
  const cor = COR_TEXTO[variante];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={800}
      disabled={inativo}
      style={({ pressed }) => [
        styles.botao,
        compacto && styles.compacto,
        { backgroundColor: FUNDO[variante] },
        variante === 'secundario' && styles.borda,
        inativo && { opacity: 0.5 },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        estilo,
      ]}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={cor} />
      ) : (
        icone && <Ionicons name={icone} size={compacto ? 16 : 18} color={cor} />
      )}
      <Text style={[styles.texto, compacto && styles.textoCompacto, { color: cor }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: Raio.md,
  },
  compacto: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: Raio.sm,
  },
  borda: {
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  texto: {
    fontSize: 15,
    fontWeight: '700',
  },
  textoCompacto: {
    fontSize: 13,
  },
});
