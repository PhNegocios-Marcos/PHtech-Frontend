import { ArrowRight, Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background grid h-screen items-center pb-8 lg:pb-0">
      <div className="text-center">
        <h1 className="col-span-12 text-primary text-9xl lg:text-8xl font-bold flex justify-center gap-3 items-center">404!</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-2xl md:text-5xl">
          Oops! Página não encontrada.
        </h2>
        <p className="text-muted-foreground mt-3 md:mt-6 text-sm md:text-base leading-7">
          Desculpe, não encontramos a página que você está procurando.
        </p>
        <div className="mt-10 flex flex-col gap-3 items-center justify-center gap-x-2">
          <Button size="lg" asChild>
            <Link href="/dashboard">Voltar para o início</Link>
          </Button>

          {/* avaliar necessidade deste botão */}
          {/* <Button size="lg" variant="ghost">
            Contate o suporte <ArrowRight className="ms-2 h-4 w-4" />
          </Button> */}
        </div>
      </div>
      {/* <div className="hidden lg:block">
        <Image
          src={`${process.env.DASHBOARD_BASE_URL}/images/404.svg`}
          width={300}
          height={400}
          className="w-full object-contain lg:max-w-2xl"
          alt="not found image"
          unoptimized
        />
      </div> */}
    </div>
  );
}
