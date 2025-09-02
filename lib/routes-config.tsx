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
    title: "Autenticação",
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
        id: "Credito",
        title: "Crédito",
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
            title: "Módulos",
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
            title: "Usuários",
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
          },
          {
            id: "Clientes_ver",
            title: "Clientes",
            href: "/dashboard/gestao/clientes"
            // icon: "ChartPie"
          }
        ]
      },
      {
        id: "Chat_ai",
        title: "Chat ai",
        href: "/dashboard/ai-chat",
        icon: "Brain"
      }
    ]
  },
  {
    id: "Config_Banco_ver",
    title: "Config do Banco",
    items: [
      {
        id: "Esteria_ver",
        title: "Esteira",
        href: "/dashboard/cadastro/esteira",
        icon: "Network"
      },

      {
        id: "Operacoes_ver",
        title: "Operações",
        href: "/dashboard/operacoes",
        icon: "Handshake",
        items: [
          {
            id: "TipoOperacao_ver",
            title: "Tipo de Operação",
            href: "/dashboard/operacoes/tipo_operacao"
            // icon: "ChartPie"
          },
          {
            id: "Modalidade_ver",
            title: "Modalidade",
            href: "/dashboard/operacoes/modalidade"
            // icon: "ChartPie"
          },
          {
            id: "Produto_ver",
            title: "Produto",
            href: "/dashboard/operacoes/produto"
            // icon: "ChartPie"
          },
          {
            id: "RO_ver",
            title: "Roteiro Operacional (RO)",
            href: "/dashboard/operacoes/roteiro_operacional"
            // icon: "ChartPie"
          },
          {
            id: "TaxaCadastro_ver",
            title: "Taxa Cadastro",
            href: "/dashboard/operacoes/taxaCadastro"
          },
          {
            id: "Bancalizador_ver",
            title: "Bancarizador",
            href: "/dashboard/operacoes/bancalizador"
          }
        ]
      },
      {
        id: "Seguradora_ver",
        title: "Seguradora",
        href: "/dashboard/seguradora",
        icon: "ShieldUser",
        items: [
          {
            id: "Seguradora_ver",
            title: "Cadastro",
            href: "/dashboard/seguradora/seguradora"
            // icon: "ChartPie"
          },
          {
            id: "Seguro_ver",
            title: "Seguro",
            href: "/dashboard/seguradora/seguro"
            // icon: "ChartPie"
          }
        ]
      },
      {
        id: "Convenio_ver",
        title: "Convênio",
        href: "/dashboard/convenio",
        icon: "ChartPie",
        items: [
          {
            id: "Averbador_ver",
            title: "Averbador",
            href: "/dashboard/convenio/averbador"
            // icon: "ChartPie"
          },
          {
            id: "Convenio_ver",
            title: "Cadastro",
            href: "/dashboard/convenio/convenio"
            // icon: "ChartPie"
          },
          {
            id: "Orgao_ver",
            title: "Orgão",
            href: "/dashboard/convenio/orgao"
            // icon: "ChartPie"
          }
        ]
      }
    ]
  }
];
