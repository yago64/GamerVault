import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Botao from '@/components/Botao';
import EstadoVazio from '@/components/EstadoVazio';
import JogoRow from '@/components/JogoRow';
import Poster from '@/components/Poster';
import { Cores, Espaco, Raio } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import { compartilharJogo } from '@/services/arquivos';
import { ordenar } from '@/utils/catalogo';
import { confirmar, mostrarMensagem } from '@/utils/mensagem';

export default function DetalhesScreen() {
  // O [id] do nome do arquivo chega como parâmetro da rota.
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { jogos, obterJogo, ehFavorito, alternarFavorito, excluir } = useJogos();

  const jogo = obterJogo(String(id));
  const parecidos = useMemo(
    () =>
      jogo
        ? ordenar(
            jogos.filter((item) => item.genero === jogo.genero && item.id !== jogo.id),
            'nota',
          )
        : [],
    [jogos, jogo],
  );

  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!jogo) {
    return (
      <View style={[styles.tela, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={voltar} style={styles.voltarSolto} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={Cores.texto} />
        </Pressable>
        <EstadoVazio
          icone="help-circle-outline"
          titulo="Jogo não encontrado"
          texto={`Não existe um jogo com o código ${id}. Ele pode ter sido removido da biblioteca.`}
          acao={{ rotulo: 'Voltar ao início', onPress: () => router.replace('/') }}
        />
      </View>
    );
  }

  const salvo = ehFavorito(jogo.id);
  const alturaCapa = Math.min(Math.round(width * 1.1), 480) + insets.top;

  const handleCompartilhar = async () => {
    try {
      await compartilharJogo(jogo);
    } catch {
      mostrarMensagem('Não foi possível compartilhar', 'Tente novamente em instantes.');
    }
  };

  const handleExcluir = async () => {
    const ok = await confirmar(
      'Excluir jogo',
      `"${jogo.titulo}" será removido da biblioteca. Essa ação não pode ser desfeita.`,
      'Excluir',
    );
    if (!ok) return;

    try {
      const origem = await excluir(jogo.id);
      if (origem === 'local') {
        mostrarMensagem('Jogo excluído', 'A API não respondeu, então a exclusão vale só neste aparelho.');
      }
      voltar();
    } catch (erro) {
      mostrarMensagem('Não foi possível excluir', erro instanceof Error ? erro.message : 'Tente novamente.');
    }
  };

  return (
    <View style={styles.tela}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Espaco.xxl }}>
        <View style={{ height: alturaCapa }}>
          <Poster
            jogo={jogo}
            mostrarTitulo={false}
            tamanhoMarca={width * 0.95}
            estilo={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(6,9,16,0.55)', 'transparent', Cores.fundo]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </View>

        <View style={styles.conteudo}>
          <Text style={styles.titulo}>{jogo.titulo}</Text>
          <Text style={styles.categoria}>{jogo.categoria}</Text>

          <View style={styles.meta}>
            <View style={styles.nota}>
              <Ionicons name="star" size={15} color={Cores.nota} />
              <Text style={styles.notaTexto}>{jogo.nota.toFixed(1)}</Text>
              <Text style={styles.notaDe}>/ 10</Text>
            </View>
            <Text style={styles.ano}>{jogo.ano}</Text>
            <View style={styles.generoTag}>
              <Text style={styles.generoTagTexto}>{jogo.genero}</Text>
            </View>
          </View>

          {jogo.plataformas.length > 0 && (
            <View style={styles.plataformas}>
              {jogo.plataformas.map((plataforma) => (
                <View key={plataforma} style={styles.plataforma}>
                  <Text style={styles.plataformaTexto}>{plataforma}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.descricao}>{jogo.descricao || 'Este jogo ainda não tem descrição.'}</Text>

          <View style={styles.acoesPrincipais}>
            <Botao
              titulo={salvo ? 'Na Minha Lista' : 'Minha Lista'}
              icone={salvo ? 'checkmark' : 'add'}
              variante={salvo ? 'secundario' : 'primario'}
              onPress={() => alternarFavorito(jogo.id)}
              estilo={styles.flex}
            />
            <Botao
              titulo="Compartilhar"
              icone="share-social-outline"
              variante="secundario"
              onPress={handleCompartilhar}
              estilo={styles.flex}
            />
          </View>

          <View style={styles.acoesSecundarias}>
            <Botao
              titulo="Editar"
              icone="create-outline"
              variante="fantasma"
              compacto
              onPress={() => router.push({ pathname: '/jogo/form', params: { id: jogo.id } })}
              estilo={styles.flex}
            />
            <Botao
              titulo="Excluir"
              icone="trash-outline"
              variante="perigo"
              compacto
              onPress={handleExcluir}
              estilo={styles.flex}
            />
          </View>
        </View>

        {parecidos.length > 0 && <JogoRow titulo={`Mais de ${jogo.genero}`} jogos={parecidos} />}
      </ScrollView>

      {/* Botões flutuantes sobre a capa */}
      <View style={[styles.barraTopo, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={voltar} style={styles.botaoRedondo} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={Cores.texto} />
        </Pressable>
        <Pressable
          onPress={handleCompartilhar}
          style={styles.botaoRedondo}
          accessibilityRole="button"
          accessibilityLabel="Compartilhar"
        >
          <Ionicons name="share-outline" size={20} color={Cores.texto} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  flex: {
    flex: 1,
  },
  voltarSolto: {
    marginLeft: Espaco.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficie,
  },
  barraTopo: {
    position: 'absolute',
    left: Espaco.lg,
    right: Espaco.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoRedondo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,9,16,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(234,241,255,0.18)',
  },
  conteudo: {
    paddingHorizontal: Espaco.lg,
    marginTop: -Espaco.xl,
  },
  titulo: {
    color: Cores.branco,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  categoria: {
    color: Cores.textoSuave,
    fontSize: 15,
    marginTop: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: Espaco.lg,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  notaTexto: {
    color: Cores.texto,
    fontSize: 16,
    fontWeight: '800',
  },
  notaDe: {
    color: Cores.textoMudo,
    fontSize: 13,
  },
  ano: {
    color: Cores.textoSuave,
    fontSize: 14,
    fontWeight: '600',
  },
  generoTag: {
    backgroundColor: Cores.primariaSuave,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Raio.pill,
  },
  generoTagTexto: {
    color: Cores.primariaClara,
    fontSize: 12,
    fontWeight: '700',
  },
  plataformas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Espaco.md,
  },
  plataforma: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Raio.sm,
    backgroundColor: Cores.superficie,
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  plataformaTexto: {
    color: Cores.textoSuave,
    fontSize: 12,
    fontWeight: '600',
  },
  descricao: {
    color: Cores.textoSuave,
    fontSize: 15,
    lineHeight: 23,
    marginTop: Espaco.lg,
  },
  acoesPrincipais: {
    flexDirection: 'row',
    gap: Espaco.md,
    marginTop: Espaco.xl,
  },
  acoesSecundarias: {
    flexDirection: 'row',
    gap: Espaco.md,
    marginTop: Espaco.md,
  },
});
