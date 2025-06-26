import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Logo() {
  const { selectedPromotoraLogo } = useAuth();

  if (!selectedPromotoraLogo) return null;

  const logoSource = typeof selectedPromotoraLogo === 'string' 
    ? selectedPromotoraLogo 
    : "logo.png";

  return (
    <Image
      src={logoSource}
      width={60}
      height={60}
      className="me-1 rounded-sm transition-all group-data-collapsible:size-7 group-data-[collapsible=icon]:size-8"
      alt="Logo da promotora"
      unoptimized
    />
  );
}