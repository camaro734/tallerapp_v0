"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Calendar } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NuevaCitaPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    cliente_id: "",
    vehiculo_id: "",
    tecnico_id: "",
    fecha: "",
    hora: "",
    tipo_cita: "",
    descripcion: "",
    ubicacion: "",
    observaciones: "",
  })

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

  if (user.rol === "tecnico") {
    router.push("/agenda")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creando cita:", formData)
    router.push("/agenda")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/agenda">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nueva Cita</h1>
            <p className="text-gray-600">Programar una nueva cita en la agenda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => handleInputChange("cliente_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Transportes García S.L.</SelectItem>
                      <SelectItem value="2">Construcciones López</SelectItem>
                      <SelectItem value="3">Logística Madrid</SelectItem>
                      <SelectItem value="4">Excavaciones Norte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehiculo">Vehículo/Matrícula</Label>
                  <Select
                    value={formData.vehiculo_id}
                    onValueChange={(value) => handleInputChange("vehiculo_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1234-ABC - Mercedes Actros</SelectItem>
                      <SelectItem value="2">5678-DEF - Iveco Daily</SelectItem>
                      <SelectItem value="3">9012-GHI - Volvo FH16</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleInputChange("fecha", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleInputChange("hora", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tecnico">Técnico Asignado *</Label>
                  <Select value={formData.tecnico_id} onValueChange={(value) => handleInputChange("tecnico_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Asignar técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Juan Pérez</SelectItem>
                      <SelectItem value="4">María González</SelectItem>
                      <SelectItem value="5">Carlos Ruiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo_cita">Tipo de Cita *</Label>
                  <Select value={formData.tipo_cita} onValueChange={(value) => handleInputChange("tipo_cita", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revision">Revisión</SelectItem>
                      <SelectItem value="reparacion">Reparación</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                    placeholder="Dirección o ubicación de la cita"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Describe el motivo de la cita..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="industrial-button text-white">
              <Save className="h-4 w-4 mr-2" />
              Crear Cita
            </Button>
            <Link href="/agenda">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
