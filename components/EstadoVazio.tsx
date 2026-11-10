import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Botao from '@/components/Botao';
import { Cores } from '@/constants/theme';
import type { NomeIcone } from '@/data/generos';

type Props = {
  icone: NomeIcone;
  titulo: string;
  texto?: string;
  acao?: { rotulo: string; onPress: () => void };
};

/** Tela vazia que explica o que aconteceu e o que fazer a seguir. */
export default function EstadoVazio({ icone, titulo, texto, acao }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icone}>
        <Ionicons name={icone} size={34} color={Cores.primariaClara} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!texto && <Text style={styles.texto}>{texto}</Text>}
      {acao && <Botao titulo={acao.rotulo} onPress={acao.onPress} estilo={styles.botao} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  icone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: {
    color: Cores.texto,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  texto: {
    color: Cores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  botao: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
