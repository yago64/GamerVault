import { Platform } from 'react-native';

import { CHAVES, carregarTexto, removerChave, salvarTexto } from './storage';

const TIMEOUT_MS = 4000;

/** A API respondeu, mas com erro (400, 404, 500...). A mensagem vem do servidor. */
export class ApiError extends Error {
  status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Não foi possível falar com o servidor (offline, IP errado, timeout). */
export class RedeError extends Error {
  constructor(mensagem = 'Sem conexão com a API.') {
    super(mensagem);
    this.name = 'RedeError';
  }
}

/**
 * Endereço padrão da API:
 * - EXPO_PUBLIC_API_URL, se definido no .env;
 * - emulador Android: 10.0.2.2 é o "localhost" do computador;
 * - iOS Simulator e web: localhost.
 * Em celular físico use o IP do computador (Perfil > Conexão com a API).
 */
export function urlPadrao(): string {
  const doEnv = process.env.EXPO_PUBLIC_API_URL;
  if (doEnv) return doEnv;
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}

export function normalizarUrl(entrada: string): string {
  let url = entrada.trim().replace(/\/+$/, '');
  if (url && !/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url;
}

let urlEmMemoria: string | null = null;

export async function obterUrlBase(): Promise<string> {
  if (urlEmMemoria) return urlEmMemoria;
  const salva = await carregarTexto(CHAVES.apiUrl);
  urlEmMemoria = salva || urlPadrao();
  return urlEmMemoria;
}

export async function definirUrlBase(entrada: string): Promise<string> {
  const url = normalizarUrl(entrada);
  if (!url) {
    await removerChave(CHAVES.apiUrl);
    urlEmMemoria = urlPadrao();
    return urlEmMemoria;
  }
  await salvarTexto(CHAVES.apiUrl, url);
  urlEmMemoria = url;
  return url;
}

export async function restaurarUrlPadrao(): Promise<string> {
  await removerChave(CHAVES.apiUrl);
  urlEmMemoria = urlPadrao();
  return urlEmMemoria;
}

type CorpoErro = { erro?: string; mensagem?: string } | null;

/** fetch com timeout, JSON automático e erros tipados. */
export async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const base = await obterUrlBase();
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${base}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
      signal: controlador.signal,
    });
  } catch {
    throw new RedeError();
  } finally {
    clearTimeout(temporizador);
  }

  // 204 No Content (resposta do DELETE) não tem corpo.
  if (resposta.status === 204) return undefined as T;

  let corpo: unknown = null;
  try {
    corpo = await resposta.json();
  } catch {
    corpo = null;
  }

  if (!resposta.ok) {
    const erro = corpo as CorpoErro;
    throw new ApiError(erro?.erro ?? erro?.mensagem ?? `Erro ${resposta.status}`, resposta.status);
  }

  return corpo as T;
}

/** Usado pelo botão "Testar conexão" do Perfil. */
export async function testarConexao(): Promise<boolean> {
  try {
    await requisitar<{ status: string }>('/saude');
    return true;
  } catch {
    return false;
  }
}
