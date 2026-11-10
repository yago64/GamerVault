import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Botao from '@/components/Botao';
import CampoTexto from '@/components/CampoTexto';
import Chip from '@/components/Chip';
import Poster from '@/components/Poster';
import { Cores, Espaco, Raio } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import { GENEROS } from '@/data/generos';
import { persistirImagem } from '@/services/arquivos';
import { PLATAFORMAS, type JogoInput } from '@/types/jogo';
import { mostrarMensagem } from '@/utils/mensagem';

type Erros = Partial<Record<'titulo' | 'categoria' | 'ano' | 'nota', string>>;

export default function JogoFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { obterJogo, criar, atualizar } = useJogos();

  const existente = id ? obterJogo(String(id)) : undefined;
  const editando = Boolean(existente);

  const [titulo, setTitulo] = useState(existente?.titulo ?? '');
  const [genero, setGenero] = useState(existente?.genero ?? GENEROS[0]);
  const [categoria, setCategoria] = useState(existente?.categoria ?? '');
  const [ano, setAno] = useState(existente ? String(existente.ano) : '');
  const [nota, setNota] = useState(existente ? String(existente.nota) : '');
  const [plataformas, setPlataformas] = useState<string[]>(existente?.plataformas ?? []);
  const [descricao, setDescricao] = useState(existente?.descricao ?? '');
  const [capa, setCapa] = useState<string | undefined>(existente?.capa);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const refCategoria = useRef<TextInput>(null);
  const refAno = useRef<TextInput>(null);
  const refNota = useRef<TextInput>(null);

  const alternarPlataforma = (nome: string) =>
    setPlataformas((atuais) =>
      atuais.includes(nome) ? atuais.filter((item) => item !== nome) : [...atuais, nome],
    );

  /** Abre a galeria. O seletor do sistema não exige permissão de acesso total às fotos. */
  const escolherCapa = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });
      if (resultado.canceled) return;
      setCapa(persistirImagem(resultado.assets[0].uri, 'capa'));
    } catch {
      mostrarMensagem('Não foi possível abrir a galeria', 'Tente novamente em instantes.');
    }
  };

  const validar = (): { entrada: JogoInput } | null => {
    const novosErros: Erros = {};
    const anoNumero = Number(ano);
    const notaNumero = Number(nota.replace(',', '.'));
    const anoMaximo = new Date().getFullYear() + 2;

    if (titulo.trim().length < 2) novosErros.titulo = 'Informe o título do jogo.';
    if (categoria.trim().length < 2) novosErros.categoria = 'Informe a categoria, ex.: RPG de ação.';
    if (!Number.isInteger(anoNumero) || anoNumero < 1970 || anoNumero > anoMaximo) {
      novosErros.ano = `Use um ano entre 1970 e ${anoMaximo}.`;
    }
    if (nota.trim() === '' || Number.isNaN(notaNumero) || notaNumero < 0 || notaNumero > 10) {
      novosErros.nota = 'Use uma nota de 0 a 10.';
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return null;

    return {
      entrada: {
        titulo: titulo.trim(),
        genero,
        categoria: categoria.trim(),
        descricao: descricao.trim(),
        nota: Math.round(notaNumero * 10) / 10,
        ano: anoNumero,
        plataformas,
        capa: capa?.trim() || undefined,
        destaque: existente?.destaque,
      },
    };
  };

  const handleSalvar = async () => {
    const validado = validar();
    if (!validado) return;

    setSalvando(true);
    try {
      const resultado = existente
        ? await atualizar(existente.id, validado.entrada)
        : await criar(validado.entrada);

      if (resultado.origem === 'local') {
        mostrarMensagem(
          'Salvo neste aparelho',
          'A API não respondeu, então o jogo foi guardado só aqui. Ele não aparece em outros aparelhos.',
        );
      }

      if (existente) {
        router.back();
      } else {
        router.replace({ pathname: '/detalhes/[id]', params: { id: resultado.jogo.id } });
      }
    } catch (erro) {
      mostrarMensagem('Não foi possível salvar', erro instanceof Error ? erro.message : 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.cabecalho, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 8 }]}>
        <Text style={styles.titulo} accessibilityRole="header">
          {editando ? 'Editar jogo' : 'Novo jogo'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.fechar}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        >
          <Ionicons name="close" size={22} color={Cores.texto} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.capaLinha}>
          <Poster
            jogo={{ titulo: titulo || 'Novo jogo', genero, capa }}
            tamanhoTitulo={14}
            tamanhoMarca={110}
            estilo={styles.capaPreview}
          />
          <View style={styles.capaAcoes}>
            <Text style={styles.capaTexto}>
              Sem capa, o app cria um pôster com as cores do gênero.
            </Text>
            <Botao titulo="Escolher da galeria" icone="image-outline" variante="secundario" compacto onPress={escolherCapa} />
            {capa && (
              <Botao titulo="Remover capa" icone="close-circle-outline" variante="fantasma" compacto onPress={() => setCapa(undefined)} />
            )}
          </View>
        </View>

        <CampoTexto
          rotulo="Título"
          value={titulo}
          onChangeText={setTitulo}
          erro={erros.titulo}
          placeholder="Ex.: Hades II"
          returnKeyType="next"
          onSubmitEditing={() => refCategoria.current?.focus()}
          submitBehavior="submit"
        />

        <Text style={styles.rotulo}>Gênero</Text>
        <View style={styles.grupo}>
          {GENEROS.map((item) => (
            <Chip key={item} rotulo={item} selecionado={genero === item} onPress={() => setGenero(item)} />
          ))}
        </View>

        <CampoTexto
          rotulo="Categoria"
          inputRef={refCategoria}
          value={categoria}
          onChangeText={setCategoria}
          erro={erros.categoria}
          placeholder="Ex.: RPG de ação"
          returnKeyType="next"
          onSubmitEditing={() => refAno.current?.focus()}
          submitBehavior="submit"
        />

        <View style={styles.duasColunas}>
          <CampoTexto
            rotulo="Ano de lançamento"
            inputRef={refAno}
            value={ano}
            onChangeText={(texto) => setAno(texto.replace(/\D/g, '').slice(0, 4))}
            erro={erros.ano}
            placeholder="2024"
            keyboardType="number-pad"
            maxLength={4}
            estilo={styles.coluna}
            returnKeyType="next"
            onSubmitEditing={() => refNota.current?.focus()}
            submitBehavior="submit"
          />
          <CampoTexto
            rotulo="Nota (0 a 10)"
            inputRef={refNota}
            value={nota}
            onChangeText={(texto) => setNota(texto.replace(/[^0-9.,]/g, '').slice(0, 4))}
            erro={erros.nota}
            placeholder="9.5"
            keyboardType="decimal-pad"
            estilo={styles.coluna}
          />
        </View>

        <Text style={styles.rotulo}>Plataformas</Text>
        <View style={[styles.grupo, { marginBottom: 14 }]}>
          {PLATAFORMAS.map((item) => (
            <Chip
              key={item}
              rotulo={item}
              selecionado={plataformas.includes(item)}
              onPress={() => alternarPlataforma(item)}
            />
          ))}
        </View>

        <CampoTexto
          rotulo="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Conte em poucas linhas do que se trata."
          multiline
          maxLength={400}
        />

        <Botao
          titulo={editando ? 'Salvar alterações' : 'Adicionar à biblioteca'}
          icone="checkmark-circle-outline"
          onPress={handleSalvar}
          carregando={salvando}
          estilo={{ marginTop: Espaco.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Espaco.lg,
    paddingBottom: Espaco.md,
    borderBottomWidth: 1,
    borderBottomColor: Cores.borda,
  },
  titulo: {
    color: Cores.texto,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  fechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficieAlt,
  },
  conteudo: {
    padding: Espaco.lg,
  },
  capaLinha: {
    flexDirection: 'row',
    gap: Espaco.lg,
    marginBottom: Espaco.xl,
    alignItems: 'center',
  },
  capaPreview: {
    width: 100,
    height: 150,
    borderRadius: Raio.md,
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  capaAcoes: {
    flex: 1,
    gap: Espaco.sm,
  },
  capaTexto: {
    color: Cores.textoSuave,
    fontSize: 13,
    lineHeight: 18,
  },
  rotulo: {
    color: Cores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  grupo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  duasColunas: {
    flexDirection: 'row',
    gap: Espaco.md,
  },
  coluna: {
    flex: 1,
  },
});
