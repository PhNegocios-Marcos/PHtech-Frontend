import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { useAuth } from "@/contexts/AuthContext";

export default function UserMenu() {
  const { token, userData } = useAuth();

  // const usuario = userData ?? null;
  const nomeCompleto = (userData as any)?.nome ?? "Usuário";

  // 🟢 Pega só o primeiro nome
  const primeiroNome = nomeCompleto.split(" ")[0];

  const email = (userData as any)?.email ?? "E-mail";

  const ultimoNome = nomeCompleto.split(" ")[nomeCompleto.split(" ").length - 1];

  const palavras = nomeCompleto.trim().split(" ");

  const primeiraInicial = palavras[0].charAt(0);
  const ultimaInicial = palavras[palavras.length - 1].charAt(0);

  const iniciais = (primeiraInicial + ultimaInicial).toUpperCase();

  const logOut = async () => {
    // try {
    //   const resposta = await axios.post(`${API_BASE_URL}/auth/logout`, {
    //     headers: {
    //       Authorization: `Bearer ${token}`
    //     }
    //   });
    // } catch (erro) {
    //   console.log("Erro ao log out: ", erro);
    // }

    sessionStorage.clear(); // ou removeItem("token"), etc.

    window.location.href = "/dashboard/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          {/* <AvatarImage src={`${process.env.ASSETS_URL}/avatars/01.png`} alt="shadcn ui kit" /> */}
          <AvatarImage alt="shadcn ui kit bg:[var(--primary)]" />

          <AvatarFallback className="bg:[var(--primary)] rounded-lg">{iniciais}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarImage src={`${process.env.ASSETS_URL}/avatars/01.png`} alt="shadcn ui kit" />
              <AvatarFallback className="rounded-lg">{iniciais}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {primeiroNome} {ultimoNome}
              </span>
              <span className="text-muted-foreground truncate text-xs">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> */}
        <DropdownMenuItem onClick={logOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
