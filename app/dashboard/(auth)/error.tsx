"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("-->", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center text-left justify-center flex-col gap-4 px-2 py-8">
      <div className="space-y-2 lg:space-y-4">
        <h2 className="text-5xl font-bold lg:text-7xl">Oops!</h2>
        <p className="text-muted-foreground">Parece que tivemos um problema, por favor tente novamente.</p>
      </div>
      <Button className="mt-5 py-8 px-6" onClick={() => reset()}>Tentar novamente</Button>
    </div>
  );
}
