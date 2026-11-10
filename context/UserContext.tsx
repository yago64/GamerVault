import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { removerImagem } from '@/services/arquivos';
import { CHAVES, carregarJSON, removerChave, salvarJSON } from '@/services/storage';

/**
 * Perfil do jogador. A senha NÃO entra aqui de propósito: o AsyncStorage não é
 * criptografado, então nunca guardamos dados sensíveis nele.
 */
export type UserProfile = {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cpf: string;
  avatar?: string;
};

type UserContextValue = {
  user: UserProfile | null;
  /** true enquanto o perfil salvo ainda está sendo lido do aparelho. */
  carregando: boolean;
  saveUser: (perfil: UserProfile) => Promise<void>;
  atualizarAvatar: (uri?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app, recupera o perfil gravado na última sessão.
  useEffect(() => {
    let ativo = true;
    (async () => {
      const salvo = await carregarJSON<UserProfile>(CHAVES.usuario);
      if (ativo) {
        setUser(salvo);
        setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const saveUser = useCallback(async (perfil: UserProfile) => {
    setUser(perfil);
    await salvarJSON(CHAVES.usuario, perfil);
  }, []);

  const atualizarAvatar = useCallback(
    async (uri?: string) => {
      if (!user) return;
      if (user.avatar && user.avatar !== uri) removerImagem(user.avatar);
      const novo: UserProfile = { ...user, avatar: uri };
      setUser(novo);
      await salvarJSON(CHAVES.usuario, novo);
    },
    [user],
  );

  const logout = useCallback(async () => {
    removerImagem(user?.avatar);
    setUser(null);
    await removerChave(CHAVES.usuario);
  }, [user]);

  const valor = useMemo(
    () => ({ user, carregando, saveUser, atualizarAvatar, logout }),
    [user, carregando, saveUser, atualizarAvatar, logout],
  );

  return <UserContext.Provider value={valor}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }

  return context;
}
