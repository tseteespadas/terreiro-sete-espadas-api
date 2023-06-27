module.exports = {
  admin: [
    {
      name: "Calendário",
      path: "/calendario",
      description:
        "Permite visualizar, adicionar, atualizar e remover eventos para grupos de usuários.",
      icon: ["fas", "calendar-alt"],
    },
    {
      name: "Grupos",
      path: "/grupos",
      description:
        "Permite gerenciar os grupos e pessoas pertencentes a um determinado grupo.",
      icon: ["fas", "users"],
    },
    {
      name: "Usuários",
      path: "/usuarios",
      description:
        "Permite visualizar, adicionar e remover os usuários da plataforma.",
      icon: ["fas", "user-plus"],
    },
    {
      name: "Biblioteca",
      path: "/biblioteca",
      description: "Base de conhecimento da Comunidade Ògún Onirê",
      icon: ["fas", "book-reader"],
      subitems: [
        {
          path: "/biblioteca/playlists",
          icon: ["fas", "music"],
          name: "Playlists",
          description: "Playlists de cantigas e pontos cantados nas giras.",
        },
        // {
        //   path: "/biblioteca/textos",
        //   icon: ["fas", "quote-left"],
        //   name: "Textos",
        //   description: "Documentos, artigos e mais.",
        // },
        // {
        //   path: "/biblioteca/podcasts",
        //   icon: ["fas", "podcast"],
        //   name: "Podcasts e mais",
        //   description: "Podcasts, filmes e outras mídias.",
        // },
      ],
    },
  ],
  user: [
    {
      name: "Calendário",
      path: "/calendario",
      description:
        "Visualize os próximos eventos do terreiro como giras, rituais, manifestações, e mais!",
      icon: ["fas", "calendar-alt"],
    },
    {
      name: "Biblioteca",
      path: "/biblioteca",
      description: "Base de conhecimento da Comunidade Ògún Onirê",
      icon: ["fas", "book-reader"],
      subitems: [
        {
          path: "/biblioteca/playlists",
          icon: ["fas", "music"],
          name: "Playlists",
          description: "Playlists de pontos cantados nas giras.",
        },
        // {
        //   "path": "/biblioteca/textos",
        //   "icon": [
        //     "fas",
        //     "quote-left"
        //   ],
        //   "name": "Textos",
        //   "description": "Documentos, artigos e mais."
        // },
        // {
        //   "path": "/biblioteca/podcasts",
        //   "icon": [
        //     "fas",
        //     "podcast"
        //   ],
        //   "name": "Podcasts e mais",
        //   "description": "Podcasts, filmes e outras mídias."
        // }
      ],
    },
  ],
};
