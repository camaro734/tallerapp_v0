"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Briefcase,
  BarChart3,
} from "lucide-react"
import { useAuth } from "./auth-provider"
import { FichajePresencia } from "./fichaje-presencia"

const menuItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/partes", icon: FileText, label: "Partes de Trabajo" },
  { href: "/agenda", icon: Calendar, label: "Agenda" },
  { href: "/presupuestos", icon: DollarSign, label: "Presupuestos" },
  { href: "/materiales", icon: Package, label: "Materiales" },
  { href: "/personal", icon: Users, label: "Personal" },
  { href: "/vacaciones", icon: Briefcase, label: "Vacaciones" },
  { href: "/informes", icon: BarChart3, label: "Informes" },
  { href: "/ajustes", icon: Settings, label: "Ajustes" },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-300"
      case "jefe_taller":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "tecnico":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "jefe_taller":
        return "Jefe de Taller"
      case "tecnico":
        return "Técnico"
      default:
        return "Usuario"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-blue-700">
            <h1 className="text-xl font-bold text-center">CMG Hidráulica</h1>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-blue-700">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">{getInitials(user.nombre)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.nombre}</p>
                <p className="text-xs text-blue-200 truncate">{user.email}</p>
              </div>
            </div>
            <Badge className={`${getRoleColor(user.rol)} border text-xs`}>{getRoleLabel(user.rol)}</Badge>
          </div>

          {/* Fichaje de Presencia */}
          <div className="p-4 border-b border-blue-700">
            <FichajePresencia />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 text-left ${
                      isActive
                        ? "bg-blue-700 text-white hover:bg-blue-600"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-700">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-blue-100 hover:bg-blue-700 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
