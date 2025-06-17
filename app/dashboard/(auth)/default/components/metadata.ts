import { generateMeta } from "@/lib/utils";


export async function generateMetadata() {
  return generateMeta({
    title: "Project Admin Dashboard",
    description:
      "The project management admin dashboard template provides a powerful and intuitive interface for tracking tasks, deadlines, and team progress to ensure project success.",
    canonical: "/project-management"
  });
}