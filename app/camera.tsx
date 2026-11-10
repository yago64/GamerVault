import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Botao from '@/components/Botao';
import { Cores, Espaco } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { persistirImagem } from '@/services/arquivos';
import { mostrarMensagem } from '@/utils/mensagem';

/** Câmera para tirar a foto de perfil. */
export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { atualizarAvatar } = useUser();

  // Estado da permissão: null enquanto carrega, depois { granted, canAskAgain, ... }.
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [lado, setLado] = useState<CameraType>('front');
  const [foto, setFoto] = useState<string | null>(null);
  const [fotografando, setFotografando] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const fechar = () => router.back();

  if (!permissao) {
    return <View style={styles.tela} />;
  }

  // Permissão negada: explica o motivo e oferece um caminho, sem travar o app.
  if (!permissao.granted) {
    return (
      <View style={[styles.tela, styles.centro, { paddingTop: insets.top }]}>
        <View style={styles.iconeAviso}>
          <Ionicons name="camera-outline" size={36} color={Cores.primariaClara} />
        </View>
        <Text style={styles.avisoTitulo}>Precisamos da câmera</Text>
        <Text style={styles.avisoTexto}>
          {permissao.canAskAgain
            ? 'O GamerVault usa a câmera só para tirar a sua foto de perfil. Nada é enviado para fora do aparelho.'
            : 'O acesso à câmera foi bloqueado. Libere a permissão nas configurações do aparelho para tirar a foto.'}
        </Text>
        {permissao.canAskAgain ? (
          <Botao titulo="Permitir câmera" icone="camera" onPress={pedirPermissao} estilo={styles.botaoAviso} />
        ) : (
          <Botao titulo="Abrir configurações" icone="settings-outline" onPress={() => Linking.openSettings()} estilo={styles.botaoAviso} />
        )}
        <Botao titulo="Agora não" variante="fantasma" onPress={fechar} />
      </View>
    );
  }

  const tirarFoto = async () => {
    if (!cameraRef.current || fotografando) return;
    setFotografando(true);
    try {
      const resultado = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setFoto(resultado.uri);
    } catch (erro) {
      console.error('Erro ao tirar foto:', erro);
      mostrarMensagem('Não foi possível tirar a foto', 'Tente novamente.');
    } finally {
      setFotografando(false);
    }
  };

  const usarFoto = async () => {
    if (!foto) return;
    // A foto nasce numa pasta temporária; copiamos para a pasta permanente do app.
    await atualizarAvatar(persistirImagem(foto, 'avatar'));
    router.back();
  };

  if (foto) {
    return (
      <View style={styles.tela}>
        <Image source={{ uri: foto }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={[styles.rodape, { paddingBottom: insets.bottom + Espaco.lg }]}>
          <Botao titulo="Tirar outra" variante="secundario" onPress={() => setFoto(null)} estilo={styles.flex} />
          <Botao titulo="Usar foto" icone="checkmark" onPress={usarFoto} estilo={styles.flex} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={lado} />

      <View style={[styles.topo, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={fechar} style={styles.botaoRedondo} accessibilityRole="button" accessibilityLabel="Fechar câmera">
          <Ionicons name="close" size={24} color={Cores.branco} />
        </Pressable>
        <Pressable
          onPress={() => setLado((atual) => (atual === 'front' ? 'back' : 'front'))}
          style={styles.botaoRedondo}
          accessibilityRole="button"
          accessibilityLabel="Virar câmera"
        >
          <Ionicons name="camera-reverse-outline" size={24} color={Cores.branco} />
        </Pressable>
      </View>

      <View style={[styles.obturadorArea, { paddingBottom: insets.bottom + Espaco.xl }]}>
        <Pressable
          onPress={tirarFoto}
          disabled={fotografando}
          style={({ pressed }) => [styles.obturador, pressed && { transform: [{ scale: 0.94 }] }, fotografando && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Tirar foto"
        >
          <View style={styles.obturadorMiolo} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  centro: {
    backgroundColor: Cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Espaco.xl,
  },
  iconeAviso: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Espaco.lg,
  },
  avisoTitulo: {
    color: Cores.texto,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  avisoTexto: {
    color: Cores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Espaco.sm,
    marginBottom: Espaco.xl,
  },
  botaoAviso: {
    alignSelf: 'stretch',
    marginBottom: Espaco.sm,
  },
  topo: {
    position: 'absolute',
    left: Espaco.lg,
    right: Espaco.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoRedondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  obturadorArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  obturador: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: Cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obturadorMiolo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Cores.branco,
  },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: Espaco.md,
    paddingHorizontal: Espaco.lg,
    paddingTop: Espaco.lg,
    backgroundColor: 'rgba(6,9,16,0.85)',
  },
});
