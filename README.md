# GamerVault

Catálogo de jogos para celular, feito com **Expo (SDK 54) + React Native + Expo Router**.
A Home segue o estilo de catálogo de streaming: destaque grande no topo e fileiras horizontais de pôsteres por categoria.

## O que o app faz

| Recurso | Onde | Aula |
|---|---|---|
| Fileiras estilo Netflix, destaque, pull-to-refresh | Aba **Início** | 1 a 16 |
| Busca, filtro por gênero e ordenação | Aba **Buscar** | 1 a 16 |
| Minha Lista (favoritos) | Aba **Minha Lista** | 19 |
| Detalhes, criar, editar e excluir jogos (CRUD) | `detalhes/[id]`, `jogo/form` | 17, 18 |
| API REST em Node.js + Express | pasta `api/` | 17, 18 |
| Perfil e Minha Lista salvos no aparelho (AsyncStorage) | contextos `context/` | 19 |
| Foto de perfil pela câmera + permissões | `camera.tsx` | 20 |
| Latitude, longitude e cidade do jogador | Aba **Perfil** | 20 |
| Compartilhar jogo (Share API) | tela de detalhes | 21 |
| Escolher capa e avatar na galeria | `jogo/form`, Perfil | 21 |
| Exportar e importar a Minha Lista em arquivo `.json` | Aba **Minha Lista** | 21 |
| Cadastro com máscaras e validação (CPF, e-mail, data...) | `cadastro.tsx` | 1 a 16 |
| Build de APK com EAS | `eas.json` | 22 |

**Funciona sem a API.** Quando o servidor não responde, o app usa a cópia salva no aparelho
(e o catálogo inicial na primeira execução). Alterações feitas nesse modo valem só no aparelho e o app avisa isso.

## Rodando o app

```bash
npm install
npx expo install --fix     # alinha as versões das bibliotecas com o SDK 54
npx expo start
```

Câmera e GPS precisam de **aparelho físico** com o Expo Go (ou do APK gerado).

## Rodando a API

```bash
npm run api:install        # só na primeira vez
npm run api                # http://localhost:3000
```

Ao iniciar, o servidor imprime os endereços da rede local. Qual URL usar:

| Onde o app roda | URL |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` (já é o padrão) |
| iOS Simulator / web | `http://localhost:3000` (já é o padrão) |
| Celular físico | `http://IP-DO-PC:3000`, mesma rede Wi-Fi |

No celular físico, informe o endereço em **Perfil > Conexão com a API > Salvar e testar**
(não precisa mexer no código). Para fixar um padrão, copie `.env.example` para `.env.local`.

Teste as rotas com `api/requests.http` (extensão REST Client ou Thunder Client).
Os dados da API ficam em memória: reiniciar o servidor volta ao catálogo inicial.

## Gerando o APK (Aula 22)

```bash
npm install --global eas-cli
eas login
eas init                    # cria o projeto na sua conta Expo
eas build --platform android --profile preview     # ou: npm run build:apk
```

O perfil `preview` gera um **APK** para instalar direto no celular. O perfil `production` gera AAB para a Play Store.
O APK não enxerga o `localhost` do computador: ele usa os dados salvos ou o endereço configurado no Perfil.
O app permite tráfego `http` (`usesCleartextTraffic`) para facilitar testes com a API local; use HTTPS ao publicar de verdade.

## Estrutura

```
app/            telas (Expo Router): (tabs), detalhes/[id], jogo/form, cadastro, camera
components/     Poster, JogoCard, JogoRow, HeroBanner, Botao, CampoTexto, Chip, EstadoVazio
context/        UserContext (perfil) e JogosContext (catálogo, favoritos)
services/       api (fetch), jogosRepository (API + cache), storage, arquivos
data/           catálogo inicial e temas por gênero
utils/          validações, máscaras, busca e montagem das fileiras
api/            servidor Express (CRUD de jogos)
```

## Capas dos jogos

Jogos sem imagem ganham um pôster gerado com as cores e o ícone do gênero. Para usar capas reais,
escolha uma imagem da galeria ao criar/editar o jogo ou preencha o campo `capa` com uma URL no catálogo.
