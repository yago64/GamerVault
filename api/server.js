/**
 * API REST do GamerVault (Aula 18).
 *
 * Recurso: /jogos
 *   GET    /jogos        lista (aceita ?genero=RPG e ?busca=zelda)   200
 *   GET    /jogos/:id    busca um jogo                               200 | 404
 *   POST   /jogos        cria                                        201 | 400
 *   PUT    /jogos/:id    substitui                                   200 | 400 | 404
 *   DELETE /jogos/:id    remove                                      204 | 404
 *   GET    /saude        verifica se o servidor está de pé           200
 *
 * Os dados ficam em memória (array): reiniciar o servidor restaura o catálogo inicial.
 */
const os = require('os');
const express = require('express');
const cors = require('cors');
const { jogosIniciais } = require('./dados');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // permite chamadas vindas do app web (Expo Web)
app.use(express.json()); // traduz o corpo JSON das requisições para req.body

// "Banco de dados" de hoje: memória volátil.
let jogos = jogosIniciais.map((jogo) => ({ ...jogo }));
let proximoId = Math.max(0, ...jogos.map((jogo) => jogo.id)) + 1;

/* -------------------------------------------------------------------------- */
/* Validação                                                                   */
/* -------------------------------------------------------------------------- */

function validarJogo(corpo) {
  if (typeof corpo !== 'object' || corpo === null) return { erro: 'Envie um objeto JSON.' };

  const titulo = typeof corpo.titulo === 'string' ? corpo.titulo.trim() : '';
  const genero = typeof corpo.genero === 'string' ? corpo.genero.trim() : '';
  const ano = Number(corpo.ano);
  const nota = Number(corpo.nota);
  const anoMaximo = new Date().getFullYear() + 2;

  if (titulo.length < 2) return { erro: 'Dados inválidos: informe o título.' };
  if (!genero) return { erro: 'Dados inválidos: informe o gênero.' };
  if (!Number.isInteger(ano) || ano < 1950 || ano > anoMaximo) {
    return { erro: `Dados inválidos: o ano deve estar entre 1950 e ${anoMaximo}.` };
  }
  if (Number.isNaN(nota) || nota < 0 || nota > 10) {
    return { erro: 'Dados inválidos: a nota deve estar entre 0 e 10.' };
  }

  return {
    dados: {
      titulo,
      genero,
      categoria: typeof corpo.categoria === 'string' ? corpo.categoria.trim() : '',
      descricao: typeof corpo.descricao === 'string' ? corpo.descricao.trim() : '',
      nota: Math.round(nota * 10) / 10,
      ano,
      plataformas: Array.isArray(corpo.plataformas)
        ? corpo.plataformas.filter((item) => typeof item === 'string')
        : [],
      capa: typeof corpo.capa === 'string' && corpo.capa ? corpo.capa : undefined,
      destaque: Boolean(corpo.destaque),
    },
  };
}

const semAcento = (texto) =>
  String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/* -------------------------------------------------------------------------- */
/* Rotas                                                                       */
/* -------------------------------------------------------------------------- */

app.get('/saude', (req, res) => {
  res.json({ status: 'ok', total: jogos.length });
});

// READ: listar (com filtros opcionais na query string)
app.get('/jogos', (req, res) => {
  let resultado = jogos;

  if (req.query.genero) {
    resultado = resultado.filter((jogo) => jogo.genero === req.query.genero);
  }
  if (req.query.busca) {
    const termo = semAcento(req.query.busca);
    resultado = resultado.filter((jogo) =>
      semAcento(`${jogo.titulo} ${jogo.categoria} ${jogo.genero}`).includes(termo),
    );
  }

  res.json(resultado);
});

// READ: buscar um jogo pelo id (req.params.id vem da URL)
app.get('/jogos/:id', (req, res) => {
  const id = Number(req.params.id);
  const jogo = jogos.find((item) => item.id === id);

  if (!jogo) return res.status(404).json({ erro: 'Jogo não encontrado' });
  res.json(jogo);
});

// CREATE: cadastrar (req.body vem no pacote da requisição)
app.post('/jogos', (req, res) => {
  const { erro, dados } = validarJogo(req.body);
  if (erro) return res.status(400).json({ erro });

  const novoJogo = { id: proximoId++, ...dados };
  jogos.push(novoJogo);
  res.status(201).json(novoJogo);
});

// UPDATE: substituir os dados de um jogo existente
app.put('/jogos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = jogos.findIndex((item) => item.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Jogo não encontrado' });

  const { erro, dados } = validarJogo(req.body);
  if (erro) return res.status(400).json({ erro });

  jogos[indice] = { id, ...dados };
  res.json(jogos[indice]);
});

// DELETE: excluir
app.delete('/jogos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = jogos.findIndex((item) => item.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Jogo não encontrado' });

  jogos.splice(indice, 1);
  res.sendStatus(204);
});

/* -------------------------------------------------------------------------- */
/* Erros                                                                       */
/* -------------------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O corpo da requisição não é um JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

/* -------------------------------------------------------------------------- */
/* Inicialização                                                               */
/* -------------------------------------------------------------------------- */

if (require.main === module) {
  // 0.0.0.0 permite que o celular na mesma rede Wi-Fi acesse o servidor.
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API do GamerVault rodando em http://localhost:${PORT}`);

    const enderecos = Object.values(os.networkInterfaces())
      .flat()
      .filter((rede) => rede && rede.family === 'IPv4' && !rede.internal)
      .map((rede) => `http://${rede.address}:${PORT}`);

    if (enderecos.length > 0) {
      console.log('No celular (mesma rede Wi-Fi), use no Perfil do app:');
      enderecos.forEach((endereco) => console.log(`  ${endereco}`));
    }
  });
}

module.exports = app;
