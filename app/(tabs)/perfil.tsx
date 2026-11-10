import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Botao from '@/components/Botao';
import CampoTexto from '@/components/CampoTexto';
import { Cores, Espaco, Raio } from '@/constants/theme';
import { useJogos } from '@/context/JogosContext';
import { useUser } from '@/context/UserContext';
import {
  definirUrlBase,
  obterUrlBase,
  restaurarUrlPadrao,
  testarConexao,
} from '@/services/api';
import { persistirImagem } from '@/services/arquivos';
import { CHAVES, carregarJSON, salvarJSON } from '@/services/storage';
import { confirmar, mostrarMensagem } from '@/utils/mensagem';
import { ocultarCpf } from '@/utils/validacao';

type Localizacao = {
  latitude: number;
  longitude: number;
  cidade?: string;
  atualizadoEm: string;
};

type StatusApi = 'desconhecido' | 'testando' | 'online' | 'offline';

const TECNOLOGIAS = [
  { nome: 'expo-router', uso: 'Rotas por arquivos, abas e parâmetros de URL' },
  { nome: 'AsyncStorage', uso: 'Perfil, Minha Lista e cópia do catálogo no aparelho' },
  { nome: 'expo-camera', uso: 'Foto de perfil' },
  { nome: 'expo-location', uso: 'Latitude e longitude do jogador' },
  { nome: 'expo-image-picker', uso: 'Escolher fotos e capas na galeria' },
  { nome: 'expo-file-system / document-picker / sharing', uso: 'Backup da Minha Lista em arquivo' },
  { nome: 'Node.js + Express', uso: 'API REST de jogos (pasta api/)' },
  { nome: 'EAS Build', uso: 'Geração do APK de testes' },
];

export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, atualizarAvatar, logout } = useUser();
  const { jogos, favoritos, origem, recarregar, resetarDados } = useJogos();

  /* ----------------------------- Estatísticas ----------------------------- */
  const notaMedia = useMemo(() => {
    if (jogos.length === 0) return 0;
    return jogos.reduce((soma, jogo) => soma + jogo.nota, 0) / jogos.length;
  }, [jogos]);

  /* ------------------------------ Localização ----------------------------- */
  const [local, setLocal] = useState<Localizacao | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [erroLocal, setErroLocal] = useState<{ mensagem: string; bloqueado: boolean } | null>(null);

  useEffect(() => {
    carregarJSON<Localizacao>(CHAVES.localizacao).then(setLocal);
  }, []);

  const obterLocalizacao = async () => {
    setBuscandoLocal(true);
    setErroLocal(null);
    try {
      // Pede permissão só agora, no momento em que o recurso é usado.
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (permissao.status !== 'granted') {
        setErroLocal({
          mensagem: permissao.canAskAgain
            ? 'Sem a permissão não conseguimos mostrar onde você joga. Você pode tentar de novo.'
            : 'A permissão de localização está bloqueada. Libere nas configurações do aparelho.',
          bloqueado: !permissao.canAskAgain,
        });
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = posicao.coords;

      // Converte coordenadas em nome de cidade; se falhar, ainda mostramos os números.
      let cidade: string | undefined;
      try {
        const [endereco] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const partes = [endereco?.city ?? endereco?.subregion, endereco?.region].filter(Boolean);
        cidade = partes.length > 0 ? partes.join(' - ') : undefined;
      } catch {
        cidade = undefined;
      }

      const novo: Localizacao = { latitude, longitude, cidade, atualizadoEm: new Date().toISOString() };
      setLocal(novo);
      await salvarJSON(CHAVES.localizacao, novo);
    } catch (erro) {
      console.error('Erro ao obter localização:', erro);
      setErroLocal({
        mensagem: 'Não foi possível obter a localização. Verifique se o GPS está ligado e tente de novo.',
        bloqueado: false,
      });
    } finally {
      setBuscandoLocal(false);
    }
  };

  /* -------------------------------- Avatar -------------------------------- */
  const escolherDaGaleria = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (resultado.canceled) return;
      await atualizarAvatar(persistirImagem(resultado.assets[0].uri, 'avatar'));
    } catch {
      mostrarMensagem('Não foi possível abrir a galeria', 'Tente novamente em instantes.');
    }
  };

  /* --------------------------------- API ---------------------------------- */
  const [urlApi, setUrlApi] = useState('');
  const [statusApi, setStatusApi] = useState<StatusApi>('desconhecido');

  useEffect(() => {
    obterUrlBase().then(setUrlApi);
  }, []);

  const testar = async () => {
    setStatusApi('testando');
    const ok = await testarConexao();
    setStatusApi(ok ? 'online' : 'offline');
    if (ok) await recarregar();
  };

  const salvarUrl = async () => {
    const salva = await definirUrlBase(urlApi);
    setUrlApi(salva);
    await testar();
  };

  const usarPadrao = async () => {
    setUrlApi(await restaurarUrlPadrao());
    setStatusApi('desconhecido');
  };

  /* ------------------------------ Dados do app ---------------------------- */
  const handleSair = async () => {
    const ok = await confirmar('Sair da conta', 'Seus dados de perfil serão removidos deste aparelho.', 'Sair');
    if (ok) await logout();
  };

  const handleApagarDados = async () => {
    const ok = await confirmar(
      'Apagar dados do app',
      'A Minha Lista, a cópia local do catálogo e a localização salva serão apagadas.',
      'Apagar',
    );
    if (!ok) return;
    await resetarDados();
    setLocal(null);
    mostrarMensagem('Pronto', 'Os dados locais foram apagados.');
  };

  const versao = Constants.expoConfig?.version ?? '1.0.0';
  const statusTexto: Record<StatusApi, string> = {
    desconhecido: origem === 'api' ? 'Conectada' : 'Não conectada',
    testando: 'Testando...',
    online: 'Conectada',
    offline: 'Sem resposta',
  };
  const apiConectada = statusApi === 'online' || (statusApi === 'desconhecido' && origem === 'api');

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={[styles.conteudo, { paddingTop: insets.top + 16, paddingBottom: Espaco.xxl }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ------------------------------ Cabeçalho ----------------------------- */}
      <View style={styles.cabecalho}>
        <View style={styles.avatar}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImagem} contentFit="cover" />
          ) : user ? (
            <Text style={styles.avatarLetra}>{user.nome.charAt(0).toUpperCase()}</Text>
          ) : (
            <Ionicons name="person" size={44} color={Cores.textoMudo} />
          )}
        </View>

        <Text style={styles.nome}>{user?.nome ?? 'Bem-vindo ao GamerVault'}</Text>
        <Text style={styles.email}>
          {user?.email ?? 'Crie uma conta para personalizar seu perfil.'}
        </Text>

        {user ? (
          <View style={styles.acoesAvatar}>
            <Botao titulo="Tirar foto" icone="camera-outline" variante="secundario" compacto onPress={() => router.push('/camera')} />
            <Botao titulo="Galeria" icone="image-outline" variante="secundario" compacto onPress={escolherDaGaleria} />
          </View>
        ) : (
          <Botao titulo="Criar conta" icone="person-add-outline" onPress={() => router.push('/cadastro')} estilo={styles.botaoCriar} />
        )}
      </View>

      {/* ----------------------------- Estatísticas --------------------------- */}
      <View style={styles.estatisticas}>
        <Estatistica valor={String(jogos.length)} rotulo="Jogos" />
        <View style={styles.divisor} />
        <Estatistica valor={String(favoritos.length)} rotulo="Na lista" />
        <View style={styles.divisor} />
        <Estatistica valor={notaMedia.toFixed(1)} rotulo="Nota média" />
      </View>

      {/* ------------------------- Informações pessoais ------------------------ */}
      {user && (
        <Cartao titulo="Informações pessoais" acao={{ rotulo: 'Editar', onPress: () => router.push('/cadastro') }}>
          <Info rotulo="Nome" valor={user.nome} />
          <Info rotulo="E-mail" valor={user.email} />
          <Info rotulo="Telefone" valor={user.telefone} />
          <Info rotulo="Nascimento" valor={user.dataNascimento} />
          <Info rotulo="CPF" valor={ocultarCpf(user.cpf)} ultimo />
        </Cartao>
      )}

      {/* ------------------------------ Localização --------------------------- */}
      <Cartao titulo="Onde você joga">
        {local ? (
          <View style={styles.localCaixa}>
            <Ionicons name="location" size={22} color={Cores.destaque} />
            <View style={styles.flex}>
              {!!local.cidade && <Text style={styles.localCidade}>{local.cidade}</Text>}
              <Text style={styles.localCoords}>
                Lat {local.latitude.toFixed(4)}   Long {local.longitude.toFixed(4)}
              </Text>
              <Text style={styles.localData}>
                Atualizado em {new Date(local.atualizadoEm).toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.texto}>
            Veja as coordenadas de onde você está. A localização fica só neste aparelho.
          </Text>
        )}

        {erroLocal && (
          <View style={styles.erroCaixa}>
            <Text style={styles.erroTexto}>{erroLocal.mensagem}</Text>
            {erroLocal.bloqueado && (
              <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
                <Text style={styles.link}>Abrir configurações</Text>
              </Pressable>
            )}
          </View>
        )}

        <Botao
          titulo={local ? 'Atualizar localização' : 'Obter localização'}
          icone="locate-outline"
          variante="secundario"
          compacto
          carregando={buscandoLocal}
          onPress={obterLocalizacao}
          estilo={{ marginTop: Espaco.md }}
        />
      </Cartao>

      {/* --------------------------------- API ---------------------------------- */}
      <Cartao titulo="Conexão com a API">
        <View style={styles.statusLinha}>
          <View style={[styles.statusPonto, { backgroundColor: apiConectada ? Cores.sucesso : statusApi === 'offline' ? Cores.perigo : Cores.textoMudo }]} />
          <Text style={styles.statusTexto}>{statusTexto[statusApi]}</Text>
        </View>
        <Text style={styles.texto}>
          Em celular físico, use o IP do computador na mesma rede Wi-Fi, ex.: http://192.168.0.10:3000.
          Sem conexão, o app usa os dados salvos no aparelho.
        </Text>

        <CampoTexto
          rotulo="Endereço do servidor"
          value={urlApi}
          onChangeText={setUrlApi}
          placeholder="http://192.168.0.10:3000"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          estilo={{ marginTop: Espaco.md, marginBottom: Espaco.sm }}
        />
        <View style={styles.linhaBotoes}>
          <Botao titulo="Salvar e testar" icone="flash-outline" compacto onPress={salvarUrl} carregando={statusApi === 'testando'} estilo={styles.flex} />
          <Botao titulo="Restaurar" variante="secundario" compacto onPress={usarPadrao} estilo={styles.flex} />
        </View>
      </Cartao>

      {/* ------------------------------ Tecnologias ---------------------------- */}
      <Cartao titulo="Tecnologias utilizadas">
        {TECNOLOGIAS.map((item, indice) => (
          <View key={item.nome} style={[styles.tecnologia, indice === TECNOLOGIAS.length - 1 && { marginBottom: 0 }]}>
            <Text style={styles.tecnologiaNome}>{item.nome}</Text>
            <Text style={styles.tecnologiaUso}>{item.uso}</Text>
          </View>
        ))}
      </Cartao>

      {/* ------------------------------- Zona de risco ------------------------- */}
      <View style={styles.zonaRisco}>
        <Botao titulo="Apagar dados do app" icone="trash-outline" variante="perigo" compacto onPress={handleApagarDados} />
        {user && <Botao titulo="Sair da conta" icone="log-out-outline" variante="fantasma" compacto onPress={handleSair} />}
      </View>

      <Text style={styles.versao}>GamerVault, versão {versao}</Text>
    </ScrollView>
  );
}

/* ------------------------------ Subcomponentes ----------------------------- */

function Cartao({
  titulo,
  acao,
  children,
}: React.PropsWithChildren<{ titulo: string; acao?: { rotulo: string; onPress: () => void } }>) {
  return (
    <View style={styles.cartao}>
      <View style={styles.cartaoCabecalho}>
        <Text style={styles.cartaoTitulo}>{titulo}</Text>
        {acao && (
          <Pressable onPress={acao.onPress} hitSlop={10} accessibilityRole="button">
            <Text style={styles.link}>{acao.rotulo}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

function Info({ rotulo, valor, ultimo = false }: { rotulo: string; valor: string; ultimo?: boolean }) {
  return (
    <View style={[styles.info, ultimo && { marginBottom: 0 }]}>
      <Text style={styles.infoRotulo}>{rotulo}</Text>
      <Text style={styles.infoValor}>{valor || 'Não informado'}</Text>
    </View>
  );
}

function Estatistica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.estatistica}>
      <Text style={styles.estatisticaValor}>{valor}</Text>
      <Text style={styles.estatisticaRotulo}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  conteudo: {
    paddingHorizontal: Espaco.lg,
  },
  flex: {
    flex: 1,
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: Espaco.xl,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficieAlt,
    borderWidth: 2,
    borderColor: Cores.primaria,
    marginBottom: Espaco.md,
  },
  avatarImagem: {
    width: '100%',
    height: '100%',
  },
  avatarLetra: {
    color: Cores.branco,
    fontSize: 42,
    fontWeight: '800',
  },
  nome: {
    color: Cores.texto,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  email: {
    color: Cores.textoSuave,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  acoesAvatar: {
    flexDirection: 'row',
    gap: Espaco.sm,
    marginTop: Espaco.lg,
  },
  botaoCriar: {
    alignSelf: 'stretch',
    marginTop: Espaco.lg,
  },
  estatisticas: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Cores.superficie,
    borderRadius: Raio.lg,
    borderWidth: 1,
    borderColor: Cores.borda,
    paddingVertical: Espaco.lg,
    marginBottom: Espaco.lg,
  },
  estatistica: {
    flex: 1,
    alignItems: 'center',
  },
  estatisticaValor: {
    color: Cores.texto,
    fontSize: 22,
    fontWeight: '900',
  },
  estatisticaRotulo: {
    color: Cores.textoMudo,
    fontSize: 12,
    marginTop: 2,
  },
  divisor: {
    width: 1,
    height: 32,
    backgroundColor: Cores.borda,
  },
  cartao: {
    backgroundColor: Cores.superficie,
    borderRadius: Raio.lg,
    borderWidth: 1,
    borderColor: Cores.borda,
    padding: Espaco.lg,
    marginBottom: Espaco.lg,
  },
  cartaoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Espaco.md,
  },
  cartaoTitulo: {
    color: Cores.texto,
    fontSize: 16,
    fontWeight: '800',
  },
  link: {
    color: Cores.primariaClara,
    fontSize: 13,
    fontWeight: '700',
  },
  texto: {
    color: Cores.textoSuave,
    fontSize: 13,
    lineHeight: 19,
  },
  info: {
    marginBottom: Espaco.md,
  },
  infoRotulo: {
    color: Cores.textoMudo,
    fontSize: 12,
    fontWeight: '600',
  },
  infoValor: {
    color: Cores.texto,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  localCaixa: {
    flexDirection: 'row',
    gap: Espaco.md,
    alignItems: 'flex-start',
  },
  localCidade: {
    color: Cores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  localCoords: {
    color: Cores.textoSuave,
    fontSize: 14,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  localData: {
    color: Cores.textoMudo,
    fontSize: 12,
    marginTop: 4,
  },
  erroCaixa: {
    marginTop: Espaco.md,
    padding: Espaco.md,
    borderRadius: Raio.md,
    backgroundColor: Cores.perigoSuave,
    gap: 6,
  },
  erroTexto: {
    color: Cores.perigo,
    fontSize: 13,
    lineHeight: 18,
  },
  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Espaco.sm,
  },
  statusPonto: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusTexto: {
    color: Cores.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: Espaco.sm,
  },
  tecnologia: {
    marginBottom: Espaco.md,
  },
  tecnologiaNome: {
    color: Cores.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  tecnologiaUso: {
    color: Cores.textoMudo,
    fontSize: 13,
    marginTop: 1,
  },
  zonaRisco: {
    gap: Espaco.sm,
    marginTop: Espaco.sm,
  },
  versao: {
    color: Cores.textoMudo,
    fontSize: 12,
    textAlign: 'center',
    marginTop: Espaco.xl,
  },
});
