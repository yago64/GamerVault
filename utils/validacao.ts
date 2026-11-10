/** Máscaras e validações usadas no cadastro. Funções puras, fáceis de testar. */

export const somenteDigitos = (valor: string) => valor.replace(/\D/g, '');

export function mascararCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function mascararTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascararData(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function validarEmail(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

export function validarTelefone(valor: string): boolean {
  const tamanho = somenteDigitos(valor).length;
  return tamanho === 10 || tamanho === 11;
}

/** Data no formato DD/MM/AAAA, existente no calendário e que não seja futura. */
export function validarData(valor: string): boolean {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!partes) return false;

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);

  const existe =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;

  return existe && ano >= 1900 && data.getTime() <= Date.now();
}

/** Confere os dois dígitos verificadores do CPF. */
export function validarCpf(valor: string): boolean {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const digito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digito(d.slice(0, 9), 10) === Number(d[9]) && digito(d.slice(0, 10), 11) === Number(d[10]);
}

/** Esconde parte do CPF na tela: •••.456.789-•• */
export function ocultarCpf(valor: string): string {
  const d = somenteDigitos(valor);
  if (d.length !== 11) return valor;
  return `•••.${d.slice(3, 6)}.${d.slice(6, 9)}-••`;
}
