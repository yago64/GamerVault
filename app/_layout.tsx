import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { Cores } from '@/constants/theme';
import { JogosProvider, useJogos } from '@/context/JogosContext';
import { UserProvider, useUser } from '@/context/UserContext';

// Mantém a splash na tela até o app ler o que estava salvo no aparelho.
SplashScreen.preventAutoHideAsync();

function Navegacao() {
  const { carregando: carregandoUsuario } = useUser();
  const { carregando: carregandoJogos } = useJogos();
  const pronto = !carregandoUsuario && !carregandoJogos;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Cores.fundo },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="detalhes/[id]" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="jogo/form" options={{ presentation: 'modal' }} />
        <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <JogosProvider>
        <Navegacao />
      </JogosProvider>
    </UserProvider>
  );
}
