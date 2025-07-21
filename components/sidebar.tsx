"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Users, Wrench, Calendar, BarChart2, Settings, LogOut, Building, Clock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import type { Rol } from "@/lib/db"

const navItems = [
  { href: "/", label: "Inicio", icon: Home, requiredRoles: ["admin", "jefe_taller", "tecnico", "recepcion"] },
  {
    href: "/partes",
    label: "Partes de Trabajo",
    icon: FileText,
    requiredRoles: ["admin", "jefe_taller", "tecnico", "recepcion"],
  },
  { href: "/fichajes", label: "Fichajes", icon: Clock, requiredRoles: ["admin", "jefe_taller", "tecnico"] },
  { href: "/agenda", label: "Agenda", icon: Calendar, requiredRoles: ["admin", "jefe_taller", "recepcion"] },
  { href: "/clientes", label: "Clientes", icon: Building, requiredRoles: ["admin", "jefe_taller", "recepcion"] },
  { href: "/personal", label: "Personal", icon: Users, requiredRoles: ["admin", "jefe_taller"] },
  {
    href: "/materiales",
    label: "Materiales",
    icon: Wrench,
    requiredRoles: ["admin", "jefe_taller", "tecnico", "recepcion"],
  },
  { href: "/informes", label: "Informes", icon: BarChart2, requiredRoles: ["admin", "jefe_taller"] },
  { href: "/ajustes", label: "Ajustes", icon: Settings, requiredRoles: ["admin"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const hasPermission = (requiredRoles: Rol[]) => {
    if (!user) return false
    return requiredRoles.includes(user.rol)
  }

  return (
    <div className="flex h-full flex-col bg-gray-800 text-white">
      <div className="flex items-center justify-center border-b border-gray-700 p-4">
        <Wrench className="h-8 w-8 text-blue-400" />
        <h1 className="ml-3 text-xl font-bold">CMG Hidráulica</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(
          (item) =>
            hasPermission(item.requiredRoles as Rol[]) && (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ),
        )}
      </nav>
      <div className="border-t border-gray-700 p-4">
        {user && (
          <div className="mb-4">
            <p className="text-sm font-semibold">{user.nombre}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-red-600 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
