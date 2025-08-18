import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "CRM Seguro Dashboard",
    description:
      "CRM dashboard for managing insurance ranges, tracking values, and analyzing performance metrics. Built with shadcn/ui, Tailwind CSS, Next.js.",
    canonical: "/seguro"
  });
}