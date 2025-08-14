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
        title: "Config do Banco",
        href: "/dashboard/cadastro",
        icon: "Package",
        items: [
          {
            id: "TipoOperacao_ver",
            title: "Tipo de Operação",
            href: "/dashboard/cadastro/tipo_operacao"
            // icon: "ChartPie"
          },
          {
            id: "Averbador_ver",
            title: "Averbador",
            href: "/dashboard/cadastro/averbador"
            // icon: "ChartPie"
          },
          {
            id: "Orgao_ver",
            title: "Orgão",
            href: "/dashboard/cadastro/orgao"
            // icon: "ChartPie"
          },
          {
            id: "Convenio_ver",
            title: "Convenio",
            href: "/dashboard/cadastro/convenio"
            // icon: "ChartPie"
          },
          {
            id: "Produto_ver",
            title: "Modalidade",
            href: "/dashboard/cadastro/modalidade"
            // icon: "ChartPie"
          },
           {
            id: "Produto_Roteiro_Operacional",
            title: "Roteiro Operacional (RO)",
            href: "/dashboard/cadastro/roteiro_operacional"
            // icon: "ChartPie"
          },
          // {
          //   id: "Taxa_Ver",
          //   title: "Tabela Taxa",
          //   href: "/dashboard/cadastro/table_taxa"
          //   // icon: "ChartPie"
          // },
          {
            id: "Produto_ver",
            title: "Produto",
            href: "/dashboard/cadastro/produto"
            // icon: "ChartPie"
          },
          {
            id: "Esteria_ver",
            title: "Esteira",
            href: "/dashboard/cadastro/esteira"
            // icon: "ChartPie"
          },
          {
            id: "Seguradora_ver",
            title: "Seguradora",
            href: "/dashboard/cadastro/seguradora"
            // icon: "ChartPie"
          },
          {
            id: "Seguro_ver",
            title: "Seguro",
            href: "/dashboard/cadastro/seguro"
            // icon: "ChartPie"
          },
          {
            id: "TaxaCadastro_ver",
            title: "Taxa Cadastro",
            href: "/dashboard/cadastro/taxaCadastro"
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
          // {
          //   id: "Credito_Excluidos",
          //   title: "Excluidos",
          //   href: "/dashboard/credito/excluidos",
          //   // icon: "Trash"
          // },
          {
            id: "Operacoes_ver",
            title: "Operações",
            href: "/dashboard/credito/operacoes"
            // icon: "Handshake"
          },
          {
            id: "Simular_ver",
            title: "Simular",
            href: "/dashboard/credito/simular"
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
          {
            id: "Gestão_Permissões",
            title: "Permissões",
            href: "/dashboard/gestao/permissoes"
            // icon: "FileKey2"
          },
          {
            id: "Gestão_Modulos",
            title: "Modulos",
            href: "/dashboard/gestao/modulos"
            // icon: "Package"
          },
          {
            id: "Alcadas_ver",
            title: "Alçadas",
            href: "/dashboard/gestao/alcadas"
            // icon: "DoorClosedLocked"
          },
          {
            id: "Promotoras_ver",
            title: "Promotoras",
            href: "/dashboard/gestao/promotoras"
            // icon: "Building"
          },
          {
            id: "Usuarios_ver",
            title: "Usuarios",
            href: "/dashboard/gestao/usuarios"
            // icon: "User"
          },
          {
            id: "Equipes_ver",
            title: "Equipes",
            href: "/dashboard/gestao/equipes"
            // icon: "Users"
          },
          {
            id: "Perfis_ver",
            title: "Perfis",
            href: "/dashboard/gestao/perfis"
            // icon: "IdCard"
          },
          {
            id: "Gestão_Cadastro_Promotora",
            title: "Cadastro Promotora",
            href: "/dashboard/gestao/promotora"
            // icon: "ChartPie"
          },
          {
            id: "Gestão_Cadastro_Usuario",
            title: "Cadastro Usuario",
            href: "/dashboard/gestao/usuario"
            // icon: "ChartPie"
          }
        ]
      }
    ]
  }
];
