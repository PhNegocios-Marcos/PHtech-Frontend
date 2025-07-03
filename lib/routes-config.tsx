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
        icon: "House"
      },
      {
        id: "Cadastro_ver",
        title: "Cadastro",
        href: "/dashboard/cadastro",
        icon: "House",
        items: [
          {
            id: "Promotora",
            title: "Promotora",
            href: "/dashboard/cadastro/promotora",
            // icon: "ChartPie"
          },
          {
            id: "Usuario",
            title: "Usuario",
            href: "/dashboard/cadastro/usuario",
            // icon: "ChartPie"
          }
        ]
      },
      {
        id: "Credito",
        title: "Credito",
        href: "/dashboard/credito",
        icon: "BanknoteArrowUp",
        items: [
          {
            id: "Credito_Excluidos",
            title: "Excluidos",
            href: "/dashboard/credito/excluidos",
            // icon: "Trash"
          },
          {
            id: "Credito_Operações",
            title: "Operações",
            href: "/dashboard/credito/operacoes",
            // icon: "Handshake"
          },
          {
            id: "Credito_Simular",
            title: "Simular",
            href: "/dashboard/credito/simular",
            // icon: "BetweenHorizontalStart"
          }
        ]
      },
      {
        id: "Gestão",
        title: "Gestão",
        href: "/dashboard/Gestão",
        icon: "MonitorCog",
        items: [
          // {
          //   id: "Gestão_Permissões",
          //   title: "Permissões",
          //   href: "/dashboard/gestao/permissoes",
          //   // icon: "FileKey2"
          // },
          // {
          //   id: "Gestão_Modulos",
          //   title: "Modulos",
          //   href: "/dashboard/gestao/modulos",
          //   // icon: "Package"
          // },
          {
            id: "Alcadas_ver",
            title: "Alçadas",
            href: "/dashboard/gestao/alcadas",
            // icon: "DoorClosedLocked"
          },
          {
            id: "Promotoras_ver",
            title: "Promotoras",
            href: "/dashboard/gestao/promotoras",
            // icon: "Building"
          },
          {
            id: "Usuarios_ver",
            title: "Usuarios",
            href: "/dashboard/gestao/usuarios",
            // icon: "User"
          },
          {
            id: "Equipes_ver",
            title: "Equipes",
            href: "/dashboard/gestao/equipes",
            // icon: "Users"
          },
          {
            id: "Perfis_ver",
            title: "Perfis",
            href: "/dashboard/gestao/perfis",
            // icon: "IdCard"
          },
          {
            id: "Gestão_Cadastro_Promotora",
            title: "Cadastro Promotora",
            href: "/dashboard/gestao/promotora",
            // icon: "ChartPie"
          },
          {
            id: "Gestão_Cadastro_Usuario",
            title: "Cadastro Usuario",
            href: "/dashboard/gestao/usuario",
            // icon: "ChartPie"
          }
        ]
      }
    ]
  }
];
