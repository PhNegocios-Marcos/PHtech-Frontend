import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "CRM Seguradoras Dashboard",
    description:
      "CRM dashboard for managing insurance companies, tracking details, and analyzing performance metrics. Built with shadcn/ui, Tailwind CSS, Next.js.",
    canonical: "/seguradoras"
  });
}