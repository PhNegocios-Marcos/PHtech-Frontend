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

// 🔁 Função para filtrar itens recursivamente
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

// ✅ Hook principal que filtra rotas com base nas permissões
export function useFilteredPageRoutes(): PageRoutesType {
  const { userPermissoes } = useAuth();

  let allowedRoutes: string[] = [];

  if (userPermissoes === "acesso_total") {
    allowedRoutes = [
      "Equipes_ver",
      "Promotoras_ver",
      "Usuarios_ver",
      "Perfis_ver",
      "Gestão_Permissões",
      "Gestão_Modulos",
      "Credito_Excluidos",
      "Credito_Operações",
      "Credito_Simular",
      "Simular_ver",
      "Cadastro_ver",
      "Categoria_Ver",
      "Produto_Ver",
      "Convenio_Ver"
    ];
  } else if (Array.isArray(userPermissoes)) {
    allowedRoutes = userPermissoes;
  }

  allowedRoutes.push("Default");

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

// ✅ Novo hook: verifica se o usuário tem uma permissão específica
export function useHasPermission(permissionId: string): boolean {
  const { userPermissoes } = useAuth();

  if (userPermissoes === "acesso_total") return true;

  if (Array.isArray(userPermissoes)) {
    return userPermissoes.includes(permissionId);
  }

  return false;
}
