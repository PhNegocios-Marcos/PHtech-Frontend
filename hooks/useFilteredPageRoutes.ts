// src/hooks/useFilteredPageRoutes.ts
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

function filterItems(items: PageRoutesItemType, rotasNegadas: string[]): PageRoutesItemType {
  return items
    .map((item) => {
      const subItems = item.items ? filterItems(item.items, rotasNegadas) : [];

      const isItemPermitido = !rotasNegadas.includes(item.id) && (subItems.length > 0 || !item.items);

      if (!isItemPermitido) return null;

      return {
        ...item,
        items: subItems.length > 0 ? subItems : undefined,
      };
    })
    .filter(Boolean) as PageRoutesItemType;
}

export function useFilteredPageRoutes() {
  const { userData } = useAuth();

  const tipoAcesso =
    userData?.usuarios && Object.values(userData.usuarios)[0]?.tipo_acesso;

  const acesso = tipoAcesso || "interno";

  const hiddenRoutesByAccessType: Record<string, string[]> = {
    externo: ["Gestão_Permissões", "Gestão_Modulos", "Gestão_Alçadas", "Gestão_Promotoras"],
    interno: ["Authentication", "login", "Cadastro", "Gestão_Cadastro_Promotora", "Gestão_Cadastro_Usuario"]
  };

  const rotasNegadas = hiddenRoutesByAccessType[acesso] || [];

  const filteredRoutes = page_routes
    .map((route) => {
      const filteredItems = filterItems(route.items, rotasNegadas);
      return {
        ...route,
        items: filteredItems
      };
    })
    .filter((route) => route.items.length > 0);

  return filteredRoutes;
}
