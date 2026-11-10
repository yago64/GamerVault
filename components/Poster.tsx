import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Cores } from '@/constants/theme';
import { temaDoGenero } from '@/data/generos';
import type { Jogo } from '@/types/jogo';

// Mantém as capas dos jogos Nintendo também em instalações com cache antigo.
const CAPAS_PADRAO: Record<string, string> = {
  'Mario Kart 8 Deluxe':
    'https://www.mariowiki.com/images/thumb/9/9b/MK8_Deluxe_-_Box_NA.png/370px-MK8_Deluxe_-_Box_NA.png',
  'Zelda: Breath of the Wild':
    'https://www.zelda-temple.net/images/igallery/resized/1501-1600/599665_front-1503-800-600-100.jpg',
};

type Props = {
  jogo: Pick<Jogo, 'titulo' | 'genero' | 'capa'>;
  /** O pôster gerado exibe o título; desligue quando o título já aparece por perto. */
  mostrarTitulo?: boolean;
  tamanhoTitulo?: number;
  tamanhoMarca?: number;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Capa do jogo. Usa a imagem quando existe; sem imagem (ou se ela falhar ao
 * carregar), desenha um pôster com as cores e o ícone do gênero.
 */
export default function Poster({
  jogo,
  mostrarTitulo = true,
  tamanhoTitulo = 15,
  tamanhoMarca = 120,
  estilo,
}: Props) {
  const tema = temaDoGenero(jogo.genero);
  const [falhou, setFalhou] = useState(false);
  const uriCapa = jogo.capa || CAPAS_PADRAO[jogo.titulo];
  const usarImagem = Boolean(uriCapa) && !falhou;

  return (
    <View style={[styles.base, estilo]}>
      {usarImagem ? (
        <Image
          source={{ uri: uriCapa! }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setFalhou(true)}
          accessibilityLabel={`Capa de ${jogo.titulo}`}
        />
      ) : (
        <LinearGradient
          colors={tema.cores}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          <Ionicons
            name={tema.icone}
            size={tamanhoMarca}
            color="rgba(255,255,255,0.13)"
            style={[styles.marca, { right: -tamanhoMarca * 0.15, top: -tamanhoMarca * 0.08 }]}
          />
          {mostrarTitulo && (
            <Text
              style={[styles.titulo, { fontSize: tamanhoTitulo, lineHeight: tamanhoTitulo * 1.15 }]}
              numberOfLines={4}
            >
              {jogo.titulo}
            </Text>
          )}
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: Cores.superficieAlt,
  },
  marca: {
    position: 'absolute',
    transform: [{ rotate: '-12deg' }],
  },
  titulo: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 12,
    color: Cores.branco,
    fontWeight: '800',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
