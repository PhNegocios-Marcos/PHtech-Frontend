"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { UserData } from "@/app/dashboard/(guest)/login/components/auth"

type AuthContextType = {
  token: string | null
  setToken: (token: string | null) => void
  email: string | null
  setMail: (email: string | null) => void
  userData: UserData | null
  setUserData: (data: UserData | null) => void
  clearAuth: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [userDataState, setUserDataState] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = sessionStorage.getItem("auth_token")
    const storedEmail = sessionStorage.getItem("auth_email")
    const storedUserData = sessionStorage.getItem("auth_userData")

    if (storedToken) setTokenState(storedToken)
    if (storedEmail) setEmail(storedEmail)
    if (storedUserData) setUserDataState(JSON.parse(storedUserData))

    setLoading(false)
  }, [])

  const setToken = (newToken: string | null) => {
    setTokenState(newToken)
    if (newToken) {
      sessionStorage.setItem("auth_token", newToken)
    } else {
      sessionStorage.removeItem("auth_token")
    }
  }

  const setMail = (newEmail: string | null) => {
    setEmail(newEmail)
    if (newEmail) {
      sessionStorage.setItem("auth_email", newEmail)
    } else {
      sessionStorage.removeItem("auth_email")
    }
  }

  const setUserData = (data: UserData | null) => {
    setUserDataState(data)
    if (data) {
      sessionStorage.setItem("auth_userData", JSON.stringify(data))
    } else {
      sessionStorage.removeItem("auth_userData")
    }
  }

  const clearAuth = () => {
    setToken(null)
    setMail(null)
    setUserData(null)
    sessionStorage.removeItem("auth_token")
    sessionStorage.removeItem("auth_email")
    sessionStorage.removeItem("auth_userData")
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        email,
        setMail,
        userData: userDataState,
        setUserData,
        clearAuth,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
