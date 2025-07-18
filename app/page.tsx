"use client"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  Users,
  TrendingUp,
  Wrench,
  CheckCircle,
  Timer,
  MapPin,
  User,
  Plus,
} from "lucide-react"
import { DatabaseStatus } from "@/components/database-status"
import Link from "next/link"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const getRoleBasedGreeting = () => {
    switch (user.rol) {
      case "admin":
        return "Panel de Administración"
      case "jefe_taller":
        return "Panel de Jefe de Taller"
      case "tecnico":
        return "Panel de Técnico"
      default:
        return "Panel de Control"
    }
  }

  const getRelevantStats = () => {
    const baseStats = [
      {
        title: "Partes Abiertos",
        value: "12",
        change: "+2 desde ayer",
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Trabajos Hoy",
        value: "8",
        change: "3 completados",
        icon: Calendar,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
    ]

    if (user.rol === "admin" || user.rol === "jefe_taller") {
      return [
        ...baseStats,
        {
          title: "Incidencias",
          value: "3",
          change: "Requieren atención",
          icon: AlertTriangle,
          color: "text-amber-600",
          bgColor: "bg-amber-100",
        },
        {
          title: "Técnicos Activos",
          value: "6",
          change: "de 8 disponibles",
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ]
    }

    return [
      ...baseStats,
      {
        title: "Mis Partes",
        value: "4",
        change: "2 en curso",
        icon: User,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        title: "Horas Hoy",
        value: "6.5h",
        change: "de 8h programadas",
        icon: Timer,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ]
  }

  return (
    <MainLayout>
      <DatabaseStatus />
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{getRoleBasedGreeting()}</h1>
          <p className="text-gray-600">
            Bienvenido, {user.nombre} -{" "}
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Resumen de actividad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {getRelevantStats().map((stat, index) => (
            <Card key={index} className="industrial-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Partes de trabajo recientes */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {user.rol === "tecnico" ? "Mis Partes de Trabajo" : "Partes Recientes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "PT-2024-001",
                    cliente: "Transportes García",
                    tipo: "Grúa móvil",
                    estado: "En curso",
                    tecnico: user.rol === "tecnico" ? "Asignado a ti" : "Juan Pérez",
                    progreso: 75,
                    ubicacion: "Polígono Industrial Norte",
                  },
                  {
                    id: "PT-2024-002",
                    cliente: "Construcciones López",
                    tipo: "Plataforma elevadora",
                    estado: "Pendiente",
                    tecnico: user.rol === "tecnico" ? "Asignado a ti" : "María González",
                    progreso: 0,
                    ubicacion: "Calle Mayor 45",
                  },
                  {
                    id: "PT-2024-003",
                    cliente: "Logística Madrid",
                    tipo: "Sistema hidráulico",
                    estado: "Completado",
                    tecnico: user.rol === "tecnico" ? "Completado por ti" : "Carlos Ruiz",
                    progreso: 100,
                    ubicacion: "Nave 12, Sector B",
                  },
                ].map((parte) => (
                  <div key={parte.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-cmg-primary">{parte.id}</p>
                        <p className="text-sm text-gray-600">
                          {parte.cliente} - {parte.tipo}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {parte.ubicacion}
                        </p>
                      </div>
                      <Badge
                        variant={
                          parte.estado === "Completado"
                            ? "default"
                            : parte.estado === "En curso"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {parte.estado}
                      </Badge>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{parte.progreso}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${
                            parte.progreso > 100 ? "danger" : parte.progreso > 80 ? "warning" : ""
                          }`}
                          style={{ width: `${Math.min(parte.progreso, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">{parte.tecnico}</p>
                  </div>
                ))}
              </div>
              <Link href="/partes">
                <Button className="w-full mt-4 industrial-button text-white" variant="outline">
                  Ver todos los partes
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Próximos trabajos o acciones rápidas */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {user.rol === "tecnico" ? "Mis Próximos Trabajos" : "Próximos Trabajos"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    hora: "09:00",
                    cliente: "Excavaciones Norte",
                    trabajo: "Revisión grúa móvil",
                    ubicacion: "Polígono Industrial",
                    asignado: user.rol === "tecnico",
                  },
                  {
                    hora: "11:30",
                    cliente: "Alquiler Maquinaria",
                    trabajo: "Reparación plataforma",
                    ubicacion: "Calle Mayor 45",
                    asignado: user.rol === "tecnico",
                  },
                  {
                    hora: "14:00",
                    cliente: "Transportes Rápidos",
                    trabajo: "Mantenimiento sistema",
                    ubicacion: "Nave 12, Sector B",
                    asignado: false,
                  },
                ].map((trabajo, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-600">{trabajo.hora}</span>
                        <Badge variant="outline" className="text-xs">
                          {trabajo.cliente}
                        </Badge>
                        {trabajo.asignado && <Badge className="text-xs bg-green-100 text-green-800">Asignado</Badge>}
                      </div>
                      <p className="text-sm font-medium">{trabajo.trabajo}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {trabajo.ubicacion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/agenda">
                <Button className="w-full mt-4 industrial-button text-white" variant="outline">
                  Ver agenda completa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Accesos rápidos */}
        <Card className="mt-6 industrial-card">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/partes/nuevo">
                <Button className="h-20 flex-col gap-2 industrial-button text-white w-full">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs">Nuevo Parte</span>
                </Button>
              </Link>

              {(user.rol === "admin" || user.rol === "jefe_taller") && (
                <Link href="/agenda/nuevo">
                  <Button className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white w-full">
                    <Calendar className="h-6 w-6" />
                    <span className="text-xs">Nueva Cita</span>
                  </Button>
                </Link>
              )}

              {user.rol === "tecnico" && (
                <Link href="/partes">
                  <Button className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white w-full">
                    <Timer className="h-6 w-6" />
                    <span className="text-xs">Fichar</span>
                  </Button>
                </Link>
              )}

              <Link href="/materiales">
                <Button className="h-20 flex-col gap-2 bg-amber-600 hover:bg-amber-700 text-white w-full">
                  <Wrench className="h-6 w-6" />
                  <span className="text-xs">Materiales</span>
                </Button>
              </Link>

              {(user.rol === "admin" || user.rol === "jefe_taller") && (
                <Link href="/informes">
                  <Button className="h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-xs">Informes</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas y notificaciones */}
        {(user.rol === "admin" || user.rol === "jefe_taller") && (
          <Card className="mt-6 industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Alertas y Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Parte PT-2024-005 superó tiempo estimado</p>
                    <p className="text-sm text-red-600">Lleva 2 horas de retraso - Técnico: Carlos Ruiz</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">3 solicitudes de vacaciones pendientes</p>
                    <p className="text-sm text-amber-600">Requieren aprobación del administrador</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Stock de filtros hidráulicos bajo</p>
                    <p className="text-sm text-blue-600">Quedan 3 unidades - Mínimo recomendado: 10</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
