"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, FileText, Users, Clock, TrendingUp, Calendar, Download, Filter } from "lucide-react"
import { GeneradorPDFFichajes } from "@/components/generador-pdf-fichajes"
import { useAuth } from "@/components/auth-provider"

const statsCards = [
  {
    title: "Partes Completados",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: FileText,
    description: "Este mes",
  },
  {
    title: "Horas Trabajadas",
    value: "186",
    change: "+8%",
    changeType: "positive" as const,
    icon: Clock,
    description: "Este mes",
  },
  {
    title: "Técnicos Activos",
    value: "8",
    change: "0%",
    changeType: "neutral" as const,
    icon: Users,
    description: "Total",
  },
  {
    title: "Eficiencia",
    value: "94%",
    change: "+3%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Promedio",
  },
]

export default function InformesPage() {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const reportTypes = [
    {
      id: "fichajes",
      title: "Informes de Fichajes",
      description: "Genera reportes detallados de fichajes por usuario y fechas",
      icon: Clock,
      color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    {
      id: "partes",
      title: "Informes de Partes",
      description: "Reportes de partes de trabajo completados y pendientes",
      icon: FileText,
      color: "bg-green-100 text-green-800 border-green-300",
    },
    {
      id: "materiales",
      title: "Informes de Materiales",
      description: "Control de stock y consumo de materiales",
      icon: BarChart3,
      color: "bg-orange-100 text-orange-800 border-orange-300",
    },
    {
      id: "personal",
      title: "Informes de Personal",
      description: "Rendimiento y estadísticas del personal técnico",
      icon: Users,
      color: "bg-purple-100 text-purple-800 border-purple-300",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes y Reportes</h1>
          <p className="text-gray-600 mt-1">Genera y visualiza informes detallados del sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="industrial-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">{stat.description}</span>
                  <Badge
                    className={`${
                      stat.changeType === "positive"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : stat.changeType === "negative"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                    } border`}
                  >
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isSelected = selectedReport === report.id

          return (
            <Card
              key={report.id}
              className={`industrial-card cursor-pointer transition-all duration-200 ${
                isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedReport(isSelected ? null : report.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900">{report.title}</CardTitle>
                    <Badge className={`${report.color} border mt-1`}>Disponible</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={isSelected ? "industrial-button" : "border-gray-400 bg-transparent"}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {isSelected ? "Configurar" : "Seleccionar"}
                  </Button>
                  {isSelected && (
                    <Button size="sm" variant="outline" className="border-gray-400 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Generar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Generador de PDF de Fichajes */}
      {selectedReport === "fichajes" && (
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
              <Clock className="h-5 w-5" />
              Generador de Informes de Fichajes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GeneradorPDFFichajes />
          </CardContent>
        </Card>
      )}

      {/* Placeholder para otros tipos de informes */}
      {selectedReport && selectedReport !== "fichajes" && (
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              {reportTypes.find((r) => r.id === selectedReport)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
              <p className="text-gray-600">Este tipo de informe estará disponible en futuras actualizaciones.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
