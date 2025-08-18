import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "CRM Taxa Cadastro Dashboard",
    description:
      "CRM dashboard for managing charged value ranges, tracking values, and analyzing performance metrics. Built with shadcn/ui, Tailwind CSS, Next.js.",
    canonical: "/taxa-cadastro"
  });
}