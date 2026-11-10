// Dados iniciais da API (em memória, como na Aula 18). Reiniciar o servidor volta a este estado.
const jogosIniciais = [
  {
    "id": 1,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg",
    "titulo": "Elden Ring",
    "genero": "RPG",
    "categoria": "RPG / Soulslike",
    "descricao": "Um RPG de ação num mundo aberto épico criado por Hidetaka Miyazaki e George R. R. Martin.",
    "nota": 9.6,
    "ano": 2022,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox"
    ],
    "destaque": true
  },
  {
    "id": 2,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_600x900.jpg",
    "titulo": "God of War Ragnarök",
    "genero": "Ação",
    "categoria": "Ação / Aventura",
    "descricao": "Junte-se a Kratos e Atreus numa jornada mítica em busca de respostas antes do Ragnarök.",
    "nota": 9.4,
    "ano": 2022,
    "plataformas": [
      "PS5",
      "PC"
    ]
  },
  {
    "id": 3,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg",
    "titulo": "The Witcher 3: Wild Hunt",
    "genero": "RPG",
    "categoria": "RPG de Ação",
    "descricao": "Embarque na caçada à Ciri num mundo devastado pela guerra e cheio de monstros.",
    "nota": 9.7,
    "ano": 2015,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox",
      "Switch"
    ]
  },
  {
    "id": 4,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/library_600x900.jpg",
    "titulo": "Hollow Knight",
    "genero": "Metroidvania",
    "categoria": "Metroidvania",
    "descricao": "Explore o reino em ruínas de Hallownest nesta aventura 2D aclamada.",
    "nota": 9.2,
    "ano": 2017,
    "plataformas": [
      "PC",
      "Switch",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 5,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg",
    "titulo": "Cyberpunk 2077",
    "genero": "RPG",
    "categoria": "RPG Ficção Científica",
    "descricao": "Seja um mercenário fora da lei em Night City, uma megalópole obcecada por poder e modificações corporais.",
    "nota": 8.6,
    "ano": 2020,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 6,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/library_600x900.jpg",
    "titulo": "Hades",
    "genero": "Roguelike",
    "categoria": "Roguelike de ação",
    "descricao": "Fuja do Mundo Inferior em combates rápidos que ficam mais fortes a cada tentativa.",
    "nota": 9.4,
    "ano": 2020,
    "plataformas": [
      "PC",
      "Switch",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 7,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/library_600x900.jpg",
    "titulo": "Dead Cells",
    "genero": "Roguelike",
    "categoria": "Roguelike / Metroidvania",
    "descricao": "Atravesse um castelo que muda a cada morte, com combate ágil e muitas armas para testar.",
    "nota": 9.0,
    "ano": 2018,
    "plataformas": [
      "PC",
      "Switch",
      "PS5",
      "Xbox",
      "Mobile"
    ]
  },
  {
    "id": 8,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/library_600x900.jpg",
    "titulo": "Celeste",
    "genero": "Indie",
    "categoria": "Plataforma / Indie",
    "descricao": "Escale a montanha Celeste em desafios precisos e uma história sensível sobre superação.",
    "nota": 9.1,
    "ano": 2018,
    "plataformas": [
      "PC",
      "Switch",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 9,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/library_600x900.jpg",
    "titulo": "Undertale",
    "genero": "Indie",
    "categoria": "RPG / Indie",
    "descricao": "Um RPG em que você pode vencer sem lutar, com personagens marcantes e trilha inesquecível.",
    "nota": 9.1,
    "ano": 2015,
    "plataformas": [
      "PC",
      "Switch",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 10,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_600x900.jpg",
    "titulo": "Stardew Valley",
    "genero": "Simulação",
    "categoria": "Fazenda / Simulação",
    "descricao": "Herde uma fazenda, cultive, pesque, explore minas e faça amizades na vila.",
    "nota": 9.3,
    "ano": 2016,
    "plataformas": [
      "PC",
      "Switch",
      "PS5",
      "Xbox",
      "Mobile"
    ]
  },
  {
    "id": 11,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/227300/library_600x900.jpg",
    "titulo": "Euro Truck Simulator 2",
    "genero": "Simulação",
    "categoria": "Simulação de caminhão",
    "descricao": "Cruze a Europa entregando cargas e construa sua própria transportadora.",
    "nota": 8.8,
    "ano": 2012,
    "plataformas": [
      "PC"
    ]
  },
  {
    "id": 12,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/library_600x900.jpg",
    "titulo": "Resident Evil 4",
    "genero": "Terror",
    "categoria": "Survival horror",
    "descricao": "Leon precisa resgatar a filha do presidente numa vila dominada por um culto sinistro.",
    "nota": 9.0,
    "ano": 2023,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 13,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1693980/library_600x900.jpg",
    "titulo": "Dead Space",
    "genero": "Terror",
    "categoria": "Terror / Ficção Científica",
    "descricao": "Isaac Clarke luta pela sobrevivência a bordo de uma nave tomada por criaturas.",
    "nota": 8.8,
    "ano": 2023,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 14,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg",
    "titulo": "Forza Horizon 5",
    "genero": "Corrida",
    "categoria": "Corrida de mundo aberto",
    "descricao": "Corra livremente pelo México em centenas de carros e eventos de todos os tipos.",
    "nota": 9.0,
    "ano": 2021,
    "plataformas": [
      "PC",
      "Xbox",
      "PS5"
    ]
  },
  {
    "id": 15,
    "capa": "https://www.mariowiki.com/images/thumb/9/9b/MK8_Deluxe_-_Box_NA.png/370px-MK8_Deluxe_-_Box_NA.png",
    "titulo": "Mario Kart 8 Deluxe",
    "genero": "Corrida",
    "categoria": "Corrida / Kart",
    "descricao": "Kart, itens e pistas malucas para jogar sozinho ou com a família inteira.",
    "nota": 9.2,
    "ano": 2017,
    "plataformas": [
      "Switch"
    ]
  },
  {
    "id": 16,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg",
    "titulo": "Red Dead Redemption 2",
    "genero": "Aventura",
    "categoria": "Faroeste / Mundo aberto",
    "descricao": "A história de Arthur Morgan e da gangue Van der Linde no fim do Velho Oeste.",
    "nota": 9.5,
    "ano": 2018,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 17,
    "capa": "https://www.zelda-temple.net/images/igallery/resized/1501-1600/599665_front-1503-800-600-100.jpg",
    "titulo": "Zelda: Breath of the Wild",
    "genero": "Aventura",
    "categoria": "Aventura / Mundo aberto",
    "descricao": "Explore Hyrule com total liberdade e descubra como cada desafio pode ser resolvido.",
    "nota": 9.6,
    "ano": 2017,
    "plataformas": [
      "Switch"
    ]
  },
  {
    "id": 18,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg",
    "titulo": "Baldur's Gate 3",
    "genero": "RPG",
    "categoria": "RPG tático por turnos",
    "descricao": "Forme seu grupo, faça escolhas que importam e viva uma campanha de D&D cheia de reviravoltas.",
    "nota": 9.8,
    "ano": 2023,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 19,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/814380/library_600x900.jpg",
    "titulo": "Sekiro: Shadows Die Twice",
    "genero": "Ação",
    "categoria": "Ação / Soulslike",
    "descricao": "Um shinobi em busca de vingança no Japão feudal, com combate baseado em ritmo e postura.",
    "nota": 9.1,
    "ano": 2019,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox"
    ]
  },
  {
    "id": 20,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/library_600x900.jpg",
    "titulo": "Disco Elysium",
    "genero": "RPG",
    "categoria": "RPG narrativo",
    "descricao": "Um detetive sem memória investiga um crime em uma cidade marcada por conflitos políticos.",
    "nota": 9.0,
    "ano": 2019,
    "plataformas": [
      "PC",
      "PS5",
      "Xbox",
      "Switch"
    ]
  },
  {
    "id": 21,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/1057090/library_600x900.jpg",
    "titulo": "Ori and the Will of the Wisps",
    "genero": "Metroidvania",
    "categoria": "Metroidvania / Plataforma",
    "descricao": "Uma aventura delicada e veloz, com visual deslumbrante e trilha emocionante.",
    "nota": 9.3,
    "ano": 2020,
    "plataformas": [
      "PC",
      "Xbox",
      "Switch"
    ]
  },
  {
    "id": 22,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/289070/library_600x900.jpg",
    "titulo": "Civilization VI",
    "genero": "Estratégia",
    "categoria": "4X por turnos",
    "descricao": "Comande uma civilização e conduza seu povo do início da história ao futuro.",
    "nota": 8.8,
    "ano": 2016,
    "plataformas": [
      "PC",
      "Switch",
      "PS5",
      "Xbox",
      "Mobile"
    ]
  },
  {
    "id": 23,
    "capa": "https://cdn.cloudflare.steamstatic.com/steam/apps/813780/library_600x900.jpg",
    "titulo": "Age of Empires II: Definitive Edition",
    "genero": "Estratégia",
    "categoria": "Estratégia em tempo real",
    "descricao": "Construa sua economia, treine exércitos e domine o campo de batalha medieval.",
    "nota": 8.9,
    "ano": 2019,
    "plataformas": [
      "PC",
      "Xbox",
      "PS5"
    ]
  }
];

module.exports = { jogosIniciais };
