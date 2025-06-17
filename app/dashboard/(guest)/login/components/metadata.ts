import { generateMeta } from "@/lib/utils";

export function generateMetadata() {
  return generateMeta({
    title: "Login Page v2",
    description:
      "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account.",
    canonical: "/login/v2",
  });
}
