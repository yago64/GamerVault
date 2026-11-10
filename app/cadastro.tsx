import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Botao from '@/components/Botao';
import CampoTexto from '@/components/CampoTexto';
import { Cores, Espaco, Raio } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { mostrarMensagem } from '@/utils/mensagem';
import {
  mascararCpf,
  mascararData,
  mascararTelefone,
  validarCpf,
  validarData,
  validarEmail,
  validarTelefone,
} from '@/utils/validacao';

type Form = {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
};

type Erros = Partial<Record<keyof Form | 'termos', string>>;

const FORM_VAZIO: Form = {
  nome: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  cpf: '',
  senha: '',
  confirmarSenha: '',
};

export default function CadastroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, saveUser } = useUser();

  // Com perfil já salvo, a tela vira "Editar dados" (sem pedir senha de novo).
  const modoEdicao = Boolean(user);

  const [form, setForm] = useState<Form>(
    user
      ? {
          ...FORM_VAZIO,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone,
          dataNascimento: user.dataNascimento,
          cpf: user.cpf,
        }
      : FORM_VAZIO,
  );
  const [aceitaTermos, setAceitaTermos] = useState(modoEdicao);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const refEmail = useRef<TextInput>(null);
  const refTelefone = useRef<TextInput>(null);
  const refNascimento = useRef<TextInput>(null);
  const refCpf = useRef<TextInput>(null);
  const refSenha = useRef<TextInput>(null);
  const refConfirmar = useRef<TextInput>(null);

  // Atualiza um campo mantendo o state imutável e limpa o erro dele.
  const atualizar = (campo: keyof Form) => (valor: string) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const validar = (): boolean => {
    const novos: Erros = {};

    if (form.nome.trim().length < 3) novos.nome = 'Informe seu nome completo.';
    if (!validarEmail(form.email)) novos.email = 'Digite um e-mail válido, como nome@email.com.';
    if (!validarTelefone(form.telefone)) novos.telefone = 'Digite DDD e número, ex.: (61) 99999-9999.';
    if (!validarData(form.dataNascimento)) novos.dataNascimento = 'Use uma data válida no formato DD/MM/AAAA.';
    if (!validarCpf(form.cpf)) novos.cpf = 'CPF inválido. Confira os números.';

    if (!modoEdicao) {
      if (form.senha.length < 6) novos.senha = 'A senha precisa ter pelo menos 6 caracteres.';
      if (form.confirmarSenha !== form.senha) novos.confirmarSenha = 'As senhas não são iguais.';
      if (!aceitaTermos) novos.termos = 'Aceite os termos de uso para continuar.';
    }

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  // onPress do botão: valida, salva no contexto (e no AsyncStorage) e segue para o perfil.
  const handleCadastro = async () => {
    if (!validar()) return;

    setSalvando(true);
    try {
      // A senha só é validada aqui; nunca vai para o armazenamento do aparelho.
      await saveUser({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone,
        dataNascimento: form.dataNascimento,
        cpf: form.cpf,
        avatar: user?.avatar,
      });
      mostrarMensagem(
        modoEdicao ? 'Dados atualizados' : 'Conta criada',
        modoEdicao ? 'Suas informações foram salvas.' : 'Bem-vindo ao GamerVault!',
      );
      router.replace('/perfil');
    } finally {
      setSalvando(false);
    }
  };

  // onLongPress do botão: preenche com dados de teste (CPF de exemplo válido).
  const handleLongPress = () => {
    if (modoEdicao) return;
    setForm({
      nome: 'Jogador Exemplo',
      email: 'gamer@teste.com',
      telefone: '(61) 99999-9999',
      dataNascimento: '01/01/2000',
      cpf: '529.982.247-25',
      senha: '123456',
      confirmarSenha: '123456',
    });
    setErros({});
    setAceitaTermos(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.conteudo,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={22} color={Cores.texto} />
        </Pressable>

        <Text style={styles.titulo} accessibilityRole="header">
          {modoEdicao ? 'Editar dados' : 'Criar conta'}
        </Text>
        <Text style={styles.subtitulo}>
          {modoEdicao
            ? 'Atualize as informações do seu perfil de jogador.'
            : 'Monte seu perfil e comece a guardar seus jogos favoritos.'}
        </Text>

        <View style={styles.cartao}>
          <Text style={styles.secao}>Dados pessoais</Text>

          <CampoTexto
            rotulo="Nome completo"
            value={form.nome}
            onChangeText={atualizar('nome')}
            erro={erros.nome}
            placeholder="Como você se chama?"
            autoCapitalize="words"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => refEmail.current?.focus()}
            submitBehavior="submit"
          />
          <CampoTexto
            rotulo="E-mail"
            inputRef={refEmail}
            value={form.email}
            onChangeText={atualizar('email')}
            erro={erros.email}
            placeholder="nome@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => refTelefone.current?.focus()}
            submitBehavior="submit"
          />
          <CampoTexto
            rotulo="Telefone"
            inputRef={refTelefone}
            value={form.telefone}
            onChangeText={atualizar('telefone')}
            mascara={mascararTelefone}
            erro={erros.telefone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
          <CampoTexto
            rotulo="Data de nascimento"
            inputRef={refNascimento}
            value={form.dataNascimento}
            onChangeText={atualizar('dataNascimento')}
            mascara={mascararData}
            erro={erros.dataNascimento}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
          />
          <CampoTexto
            rotulo="CPF"
            inputRef={refCpf}
            value={form.cpf}
            onChangeText={atualizar('cpf')}
            mascara={mascararCpf}
            erro={erros.cpf}
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            maxLength={14}
          />
        </View>

        {!modoEdicao && (
          <View style={styles.cartao}>
            <Text style={styles.secao}>Acesso</Text>

            <CampoTexto
              rotulo="Senha"
              inputRef={refSenha}
              value={form.senha}
              onChangeText={atualizar('senha')}
              erro={erros.senha}
              placeholder="Mínimo de 6 caracteres"
              senha
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => refConfirmar.current?.focus()}
              submitBehavior="submit"
            />
            <CampoTexto
              rotulo="Confirmar senha"
              inputRef={refConfirmar}
              value={form.confirmarSenha}
              onChangeText={atualizar('confirmarSenha')}
              erro={erros.confirmarSenha}
              placeholder="Repita a senha"
              senha
              textContentType="newPassword"
              returnKeyType="done"
              // onSubmitEditing: o botão "concluir" do teclado também envia o formulário.
              onSubmitEditing={handleCadastro}
            />
          </View>
        )}

        {!modoEdicao && (
          <View style={styles.termos}>
            <Switch
              value={aceitaTermos}
              onValueChange={(valor) => {
                setAceitaTermos(valor);
                setErros((atuais) => ({ ...atuais, termos: undefined }));
              }}
              trackColor={{ false: Cores.borda, true: Cores.primaria }}
              thumbColor={Cores.branco}
              accessibilityLabel="Aceitar os termos de uso"
            />
            <Text style={styles.termosTexto}>
              {aceitaTermos ? 'Termos de uso aceitos' : 'Aceito os termos de uso'}
            </Text>
          </View>
        )}
        {!!erros.termos && <Text style={styles.erroTermos}>{erros.termos}</Text>}

        <Botao
          titulo={modoEdicao ? 'Salvar alterações' : 'Criar conta'}
          onPress={handleCadastro}
          onLongPress={handleLongPress}
          carregando={salvando}
          estilo={{ marginTop: Espaco.lg }}
        />
        {!modoEdicao && (
          <Text style={styles.dica}>Dica: segure o botão para preencher com dados de teste.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  voltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficie,
    marginBottom: Espaco.lg,
  },
  titulo: {
    color: Cores.texto,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitulo: {
    color: Cores.textoSuave,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: Espaco.xl,
  },
  cartao: {
    backgroundColor: Cores.superficie,
    borderRadius: Raio.lg,
    borderWidth: 1,
    borderColor: Cores.borda,
    padding: Espaco.lg,
    marginBottom: Espaco.lg,
  },
  secao: {
    color: Cores.texto,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Espaco.lg,
  },
  termos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaco.md,
    paddingHorizontal: 4,
  },
  termosTexto: {
    color: Cores.textoSuave,
    fontSize: 14,
    fontWeight: '500',
  },
  erroTermos: {
    color: Cores.perigo,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  dica: {
    color: Cores.textoMudo,
    fontSize: 12,
    textAlign: 'center',
    marginTop: Espaco.md,
  },
});
