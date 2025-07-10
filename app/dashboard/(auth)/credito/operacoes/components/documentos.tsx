"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

// Validação com Zod
const perfilSchema = z.object({
  id: z.string(),
  nome: z.string().min(2),
  descricao: z.string().optional(),
  status: z.number()
});

type Perfil = z.infer<typeof perfilSchema>;

type PerfilDrawerProps = {
  onClose: () => void;
  perfil: Perfil | null;
};

export function Documentos() {
  const methods = useForm<Perfil>({
    resolver: zodResolver(perfilSchema),
  });


  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          className="grid grid-cols-2 gap-4 overflow-y-auto p-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Documentos da operação</CardTitle>
            </CardHeader>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}
