import { useAuth } from "@/contexts/AuthContext";
import { page_routes } from "@/lib/routes-config";

type PageRoutesItem = {
  id: string;
  title: string;
  href: string;
  icon?: string;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: PageRoutesItem[];
};

type PageRoutesItemType = PageRoutesItem[];

type PageRoutesType = {
  id: string;
  title: string;
  items: PageRoutesItemType;
}[];

type PermissaoLinha = {
  id: string;
  nome: string;
  categoria: string;
  status: number;
};

// Função para filtrar recursivamente apenas os itens permitidos
function filterItems(items: PageRoutesItemType, allowedRoutes: string[]): PageRoutesItemType {
  return items
    .map((item) => {
      const subItems = item.items ? filterItems(item.items, allowedRoutes) : [];

      const isItemPermitido = allowedRoutes.includes(item.id);

      if (!isItemPermitido && subItems.length === 0) return null;

      return {
        ...item,
        items: subItems.length > 0 ? subItems : undefined
      };
    })
    .filter(Boolean) as PageRoutesItemType;
}

export function useFilteredPageRoutes(): PageRoutesType {
  const { userPermissoes } = useAuth();

  let allowedRoutes: string[] = [];

  if (userPermissoes === "acesso_total" ) {
    allowedRoutes = ["Equipes_ver", "Promotoras_ver", "Usuarios_ver", "Perfis_ver", "Gestão_Permissões", "Gestão_Modulos", "Credito_Excluidos", "Credito_Operações", "Credito_Simular" ];
  } else if (Array.isArray(userPermissoes)) {
    allowedRoutes = userPermissoes;
  }

  allowedRoutes.push("Default"); // ✅ sempre adiciona Default

  const filteredRoutes = page_routes
    .map((route) => {
      const filteredItems = filterItems(route.items, allowedRoutes);
      return {
        ...route,
        items: filteredItems
      };
    })
    .filter((route) => route.items.length > 0);

  return filteredRoutes;
}
