import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { Cores, Raio } from '@/constants/theme';

type Props = Omit<TextInputProps, 'style'> & {
  rotulo: string;
  erro?: string;
  /** Função que formata o texto enquanto a pessoa digita (CPF, telefone, data...). */
  mascara?: (valor: string) => string;
  /** Mostra o botão "olhinho" para revelar/ocultar o texto. */
  senha?: boolean;
  inputRef?: React.Ref<TextInput>;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Campo de formulário único para o app inteiro: rótulo, máscara, erro,
 * destaque de foco e (opcionalmente) revelar senha.
 */
export default function CampoTexto({
  rotulo,
  erro,
  mascara,
  senha = false,
  inputRef,
  estilo,
  onChangeText,
  onFocus,
  onBlur,
  multiline,
  ...resto
}: Props) {
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={[styles.container, estilo]}>
      <Text style={styles.rotulo}>{rotulo}</Text>

      <View style={[styles.caixa, focado && styles.focado, !!erro && styles.comErro]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline && styles.multilinha]}
          placeholderTextColor={Cores.textoMudo}
          selectionColor={Cores.primariaClara}
          multiline={multiline}
          secureTextEntry={senha && !visivel}
          autoCapitalize={senha ? 'none' : resto.autoCapitalize}
          autoCorrect={senha ? false : resto.autoCorrect}
          onChangeText={(texto) => onChangeText?.(mascara ? mascara(texto) : texto)}
          onFocus={(evento) => {
            setFocado(true);
            onFocus?.(evento);
          }}
          onBlur={(evento) => {
            setFocado(false);
            onBlur?.(evento);
          }}
          accessibilityLabel={rotulo}
          {...resto}
        />

        {senha && (
          <Pressable
            onPress={() => setVisivel((atual) => !atual)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={visivel ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Cores.textoMudo}
            />
          </Pressable>
        )}
      </View>

      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  rotulo: {
    color: Cores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Cores.superficieAlt,
    borderWidth: 1,
    borderColor: Cores.borda,
    borderRadius: Raio.md,
    paddingHorizontal: 14,
  },
  focado: {
    borderColor: Cores.primariaClara,
  },
  comErro: {
    borderColor: Cores.perigo,
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: Cores.texto,
    fontSize: 15,
  },
  multilinha: {
    minHeight: 96,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  erro: {
    color: Cores.perigo,
    fontSize: 12,
    marginTop: 5,
  },
});
