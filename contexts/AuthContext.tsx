"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserData } from "@/app/dashboard/(guest)/login/components/auth";

// ✅ Defina o tipo de userPermissoes corretamente
export type userPermissoes = "acesso_total" | string[];

type PromotoraTheme = {
  preset: string;
  contentLayout: string;
  radius: string;
  scale: string;
};

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  tokenExpiraEm: string | null; // novo estado para expiração
  setTokenExpiraEm: (expira: string | null) => void; // setter para expiração
  email: string | null;
  setMail: (email: string | null) => void;
  senha: string | null;
  setSenha: (senha: string | null) => void;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  userPermissoes: userPermissoes | null;
  setUserPermissoes: (data: userPermissoes | null) => void;
  promotoras: any[] | null;
  setPromotoras: (data: any[] | null) => void;
  clearAuth: () => void;
  loading: boolean;
  selectedPromotoraId: string | null;
  setSelectedPromotoraId: (id: string | null) => void;
  selectedPromotoraTemas: PromotoraTheme | null | string;
  setSelectedPromotoraTemas: (temas: string | null) => void;
  selectedPromotoraLogo: PromotoraTheme | null | string;
  setSelectedPromotoraLogo: (temas: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [tokenExpiraEm, setTokenExpiraEmState] = useState<string | null>(null); // estado de expiração do token
  const [email, setEmail] = useState<string | null>(null);
  const [senha, setSenhaState] = useState<string | null>(null);
  const [userDataState, setUserDataState] = useState<UserData | null>(null);
  const [userPermissoesState, setUserPermissoesState] = useState<userPermissoes | null>(null);
  const [promotorasState, setPromotorasState] = useState<any[] | null>(null);
  const [selectedPromotoraId, setSelectedPromotoraId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPromotoraTemas, setSelectedPromotoraTemas] = useState<string | null>(null);
  const [selectedPromotoraLogo, setSelectedPromotoraLogo] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("auth_token");
    const storedTokenExpira = sessionStorage.getItem("auth_tokenExpiraEm"); // ler expiração
    const storedEmail = sessionStorage.getItem("auth_email");
    const storedSenha = sessionStorage.getItem("auth_senha");
    const storedUserData = sessionStorage.getItem("auth_userData");
    const storedUserPermissoes = sessionStorage.getItem("auth_userPermissoes");
    const storedPromotoras = sessionStorage.getItem("auth_promotoras");
    const storedSelectedPromotoraId = sessionStorage.getItem("auth_selectedPromotoraId");
    const storedSelectedPromotoraTemas = sessionStorage.getItem("auth_selectedPromotoraTemas");
    const storedSelectedPromotoraImg = sessionStorage.getItem("auth_selectedPromotoraImg");

    if (storedToken) setTokenState(storedToken);
    if (storedTokenExpira) setTokenExpiraEmState(storedTokenExpira); // setar expiração
    if (storedEmail) setEmail(storedEmail);
    if (storedSenha) setSenhaState(storedSenha);
    if (storedUserData) setUserDataState(JSON.parse(storedUserData));
    if (storedUserPermissoes) setUserPermissoesState(JSON.parse(storedUserPermissoes));
    if (storedPromotoras) setPromotorasState(JSON.parse(storedPromotoras));
    if (storedSelectedPromotoraId) setSelectedPromotoraId(storedSelectedPromotoraId);
    if (storedSelectedPromotoraTemas) setSelectedPromotoraTemas(storedSelectedPromotoraTemas);
    if (storedSelectedPromotoraTemas) setSelectedPromotoraTemas(storedSelectedPromotoraImg);

    setLoading(false);
  }, []);

  

  const setTokenExpiraEm = (expira: string | null) => {
    setTokenExpiraEmState(expira);
    expira
      ? sessionStorage.setItem("auth_tokenExpiraEm", expira)
      : sessionStorage.removeItem("auth_tokenExpiraEm");
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    newToken
      ? sessionStorage.setItem("auth_token", newToken)
      : sessionStorage.removeItem("auth_token");
  };

  const setMail = (newEmail: string | null) => {
    setEmail(newEmail);
    newEmail
      ? sessionStorage.setItem("auth_email", newEmail)
      : sessionStorage.removeItem("auth_email");
  };

  const setSenha = (newSenha: string | null) => {
    setSenhaState(newSenha);
    newSenha
      ? sessionStorage.setItem("auth_senha", newSenha)
      : sessionStorage.removeItem("auth_senha");
  };

  const setUserData = (data: UserData | null) => {
    setUserDataState(data);
    data
      ? sessionStorage.setItem("auth_userData", JSON.stringify(data))
      : sessionStorage.removeItem("auth_userData");
  };

  const setUserPermissoes = (data: userPermissoes | null) => {
    setUserPermissoesState(data);
    data
      ? sessionStorage.setItem("auth_userPermissoes", JSON.stringify(data))
      : sessionStorage.removeItem("auth_userPermissoes");
  };

  const setPromotoras = (data: any[] | null) => {
    setPromotorasState(data);
    data
      ? sessionStorage.setItem("auth_promotoras", JSON.stringify(data))
      : sessionStorage.removeItem("auth_promotoras");
  };

  const setSelectedPromotoraIdState = (id: string | null) => {
    setSelectedPromotoraId(id);
    id
      ? sessionStorage.setItem("auth_selectedPromotoraId", id)
      : sessionStorage.removeItem("auth_selectedPromotoraId");
  };

  const setSelectedPromotoraTemasState = (temas: string | null) => {
    setSelectedPromotoraTemas(temas);
    temas
      ? sessionStorage.setItem("auth_selectedPromotoraTemas", temas)
      : sessionStorage.removeItem("auth_selectedPromotoraTemas");
  };

  const setSelectedPromotoraTemasStateLogo = (temas: string | null) => {
    setSelectedPromotoraLogo(temas);
    temas
      ? sessionStorage.setItem("auth_selectedPromotoraTemas", temas)
      : sessionStorage.removeItem("auth_selectedPromotoraTemas");
  };

  const clearAuth = () => {
    setToken(null);
    setTokenExpiraEm(null); // limpar expiração também
    setMail(null);
    setSenha(null);
    setUserData(null);
    setUserPermissoes(null);
    setPromotoras(null);
    setSelectedPromotoraId(null);

    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_tokenExpiraEm"); // remover expiração
    sessionStorage.removeItem("auth_email");
    sessionStorage.removeItem("auth_senha");
    sessionStorage.removeItem("auth_userData");
    sessionStorage.removeItem("auth_userPermissoes");
    sessionStorage.removeItem("auth_promotoras");
    sessionStorage.removeItem("auth_selectedPromotoraId");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        tokenExpiraEm,
        setTokenExpiraEm,
        email,
        setMail,
        senha,
        setSenha,
        userData: userDataState,
        setUserData,
        userPermissoes: userPermissoesState,
        setUserPermissoes,
        promotoras: promotorasState,
        setPromotoras,
        clearAuth,
        loading,
        selectedPromotoraId,
        setSelectedPromotoraId: setSelectedPromotoraIdState,
        selectedPromotoraTemas,
        setSelectedPromotoraTemas,
        selectedPromotoraLogo,
        setSelectedPromotoraLogo: setSelectedPromotoraTemasStateLogo
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
