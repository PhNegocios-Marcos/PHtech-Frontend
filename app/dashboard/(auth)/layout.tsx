'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, loading, userData } = useAuth()

  const [defaultOpen, setDefaultOpen] = useState(true)

  // console.log("token: ", token)

  useEffect(() => {
    const sidebarCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('sidebar_state='))
      ?.split('=')[1]

    setDefaultOpen(sidebarCookie !== 'false')
  }, [])

  // useEffect(() => {
  //   if (!token) {
  //     router.push('/dashboard/login')
  //   }
  // }, [token, loading, router, userData])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar />
      <SidebarInset>
        <Header />
        <div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto xl:group-data-[theme-content-layout=centered]/layout:mt-8">
          {children}
        </div>
        <Toaster position="top-center" />
      </SidebarInset>
    </SidebarProvider>
  )
}
