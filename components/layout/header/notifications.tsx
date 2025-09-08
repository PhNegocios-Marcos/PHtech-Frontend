import { useEffect, useState } from "react";
import { BellIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Notifications = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await axios.get(`${API_BASE_URL}/notificacoes`);
        setNotifications(res.data);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const handleNotificationClick = (item: any) => {
    if (item.operacaoId) {
      router.push(`/dashboard/credito/operacoes/${item.operacaoId}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="relative">
          <>
            <BellIcon className="animate-tada" />
            {notifications.some(n => n.unread_message) && (
              <span className="bg-destructive absolute -end-0.5 -top-0.5 block size-2 shrink-0 rounded-full"></span>
            )}
          </>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isMobile ? "center" : "end"} className="ms-4 me-4 w-80 p-0">
        <DropdownMenuLabel className="bg-background dark:bg-muted sticky top-0 z-10 p-0">
          <div className="flex justify-between border-b px-6 py-4">
            <div className="font-medium">Notifications</div>
            <Button variant="link" className="h-auto p-0 text-xs" size="sm" asChild>
              <Link href="#">Ver todos</Link>
            </Button>
          </div>
        </DropdownMenuLabel>
        <ScrollArea className="max-h-[300px] xl:max-h-[350px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Nenhuma notificação</div>
          ) : (
            notifications.map((item, key) => (
              <DropdownMenuItem
                key={key}
                className="group flex cursor-pointer items-start gap-9 px-4 py-2"
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex flex-1 items-start gap-2">
                  <div className="flex-none">
                    <Avatar className="size-8">
                      <AvatarImage src={`${process.env.ASSETS_URL}/avatars/${item.avatar}`} />
                      <AvatarFallback>{item.title?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="dark:group-hover:text-default-800 truncate text-sm font-medium">
                      {item.title}
                    </div>
                    <div className="dark:group-hover:text-default-700 text-muted-foreground line-clamp-1 text-xs">
                      {item.desc}
                    </div>
                    <div className="dark:group-hover:text-default-500 text-muted-foreground flex items-center gap-1 text-xs">
                      <ClockIcon className="size-3!" />
                      {item.date}
                    </div>
                  </div>
                </div>
                {item.unread_message && (
                  <div className="flex-0">
                    <span className="bg-destructive block size-2 rounded-full border" />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
