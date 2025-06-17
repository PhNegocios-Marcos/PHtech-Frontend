type PageRoutesType = {
  id: string;
  title: string;
  items: PageRoutesItemType;
};

type PageRoutesItemType = {
  id: string;
  title: string;
  href: string;
  icon?: string;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: PageRoutesItemType;
}[];

export const page_routes: PageRoutesType[] = [
  {
    id: "Authentication",
    title: "Authentication",
    items: [{ id: "login", title: "Login", href: "/dashboard/login" }]
  },
  {
    id: "Dashboards",
    title: "Dashboards",
    items: [
      {
        id: "Default",
        title: "Home",
        href: "/dashboard/default",
        icon: "ChartPie"
      },
      {
        id: "Cadastro",
        title: "Cadastro",
        href: "/dashboard/cadastro",
        items: [
          {
            id: "Promotora",
            title: "Promotora",
            href: "/dashboard/cadastro/promotora",
            icon: "ChartPie"
          },
          {
            id: "Usuario",
            title: "Usuario",
            href: "/dashboard/cadastro/usuario",
            icon: "ChartPie"
          }
        ]
      },
      {
        id: "Credito",
        title: "Credito",
        href: "/dashboard/credito",
        items: [
          {
            id: "Credito_Excluidos",
            title: "Excluidos",
            href: "/dashboard/credito/excluidos",
            icon: "ChartPie"
          },
          {
            id: "Credito_Operações",
            title: "Operações",
            href: "/dashboard/credito/operacoes",
            icon: "ChartPie"
          },
          {
            id: "Credito_Simular",
            title: "Simular",
            href: "/dashboard/credito/simular",
            icon: "ChartPie"
          }
        ]
      },
      {
        id: "Gestão",
        title: "Gestão",
        href: "/dashboard/Gestão",
        items: [
          {
            id: "Gestão_Permissões",
            title: "Permissões",
            href: "/dashboard/gestao/permissoes",
            icon: "ChartPie"
          },
          {
            id: "Gestão_Modulos",
            title: "Modulos",
            href: "/dashboard/gestao/modulos",
            icon: "ChartPie"
          },
          {
            id: "Gestão_Alçadas",
            title: "Alçadas",
            href: "/dashboard/gestao/alcadas",
            icon: "ChartPie"
          },
          {
            id: "Gestão_Promotoras",
            title: "Promotoras",
            href: "/dashboard/gestao/promotoras",
            icon: "ChartPie"
          },
          {
            id: "Gestão_Usuarios",
            title: "Usuarios",
            href: "/dashboard/gestao/usuarios",
            icon: "ChartPie"
          },
          {
            id: "Gestão_Equipes",
            title: "Equipes",
            href: "/dashboard/gestao/equipes",
            icon: "ChartPie"
          },
          {
            id: "Gestão_Perfis",
            title: "Perfis",
            href: "/dashboard/gestao/perfis",
            icon: "ChartPie"
          },

          {
            id: "Gestão_Cadastro_Promotora",
            title: "Cadastro Promotora",
            href: "/dashboard/gestao/promotora",
            icon: "ChartPie"
          },
          {
            id: "Gestão_Cadastro_Usuario",
            title: "Cadastro Usuario",
            href: "/dashboard/gestao/usuario",
            icon: "ChartPie"
          }
        ]
      }
    ]
  }
];
