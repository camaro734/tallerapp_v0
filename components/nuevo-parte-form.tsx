"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, X } from "lucide-react"
import { partesDB, usuariosDB } from "@/lib/database"
import { useAuth } from "./auth-provider"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Usuario } from "@/lib/supabase"

interface Material {
  nombre: string
  cantidad: number
  precio: number
}

export function NuevoParteForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tecnicos, setTecnicos] = useState<Usuario[]>([])
  const [loadingTecnicos, setLoadingTecnicos] = useState(false)
  const [materiales, setMateriales] = useState<Material[]>([])

  const [formData, setFormData] = useState({
    // Datos del cliente
    cliente_nombre: "",
    cliente_telefono: "",
    cliente_email: "",
    cliente_direccion: "",
    // Datos del vehículo
    matricula: "",
    marca: "",
    modelo: "",
    serie: "",
    año: "",
    // Datos del trabajo
    tecnico_id: "",
    tipo_trabajo: "",
    descripcion: "",
    prioridad: "media",
    horas_estimadas: 1,
    ubicacion: "",
    observaciones: "",
  })

  useEffect(() => {
    cargarTecnicos()
  }, [])

  const cargarTecnicos = async () => {
    setLoadingTecnicos(true)
    try {
      const usuarios = await usuariosDB.getAll()
      const tecnicosDisponibles = usuarios.filter(
        (u) => u.rol === "tecnico" || u.rol === "admin" || u.rol === "jefe_taller",
      )
      setTecnicos(tecnicosDisponibles)
    } catch (error) {
      console.error("Error cargando técnicos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los técnicos",
        variant: "destructive",
      })
    } finally {
      setLoadingTecnicos(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const agregarMaterial = () => {
    setMateriales((prev) => [
      ...prev,
      {
        nombre: "",
        cantidad: 1,
        precio: 0,
      },
    ])
  }

  const actualizarMaterial = (index: number, field: keyof Material, value: string | number) => {
    setMateriales((prev) =>
      prev.map((material, i) =>
        i === index
          ? {
              ...material,
              [field]: field === "nombre" ? value : Number(value),
            }
          : material,
      ),
    )
  }

  const eliminarMaterial = (index: number) => {
    setMateriales((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      })
      return
    }

    if (!formData.cliente_nombre || !formData.cliente_telefono || !formData.matricula || !formData.descripcion) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const parteData = {
        ...formData,
        tecnico_id: formData.tecnico_id || user.id,
        materiales: materiales.filter((m) => m.nombre.trim() !== ""),
      }

      await partesDB.create(parteData)

      toast({
        title: "Parte creado",
        description: "El parte de trabajo se ha creado correctamente",
      })

      router.push("/partes")
    } catch (error) {
      console.error("Error creando parte:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el parte de trabajo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_nombre">Nombre del Cliente *</Label>
              <Input
                id="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={(e) => handleInputChange("cliente_nombre", e.target.value)}
                placeholder="Nombre completo del cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente_telefono">Teléfono *</Label>
              <Input
                id="cliente_telefono"
                value={formData.cliente_telefono}
                onChange={(e) => handleInputChange("cliente_telefono", e.target.value)}
                placeholder="Número de teléfono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente_email">Email</Label>
              <Input
                id="cliente_email"
                type="email"
                value={formData.cliente_email}
                onChange={(e) => handleInputChange("cliente_email", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente_direccion">Dirección</Label>
              <Input
                id="cliente_direccion"
                value={formData.cliente_direccion}
                onChange={(e) => handleInputChange("cliente_direccion", e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Vehículo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula *</Label>
              <Input
                id="matricula"
                value={formData.matricula}
                onChange={(e) => handleInputChange("matricula", e.target.value.toUpperCase())}
                placeholder="1234ABC"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange("marca", e.target.value)}
                placeholder="Toyota, Ford, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange("modelo", e.target.value)}
                placeholder="Corolla, Focus, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serie">Número de Serie</Label>
              <Input
                id="serie"
                value={formData.serie}
                onChange={(e) => handleInputChange("serie", e.target.value)}
                placeholder="Número de bastidor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="año">Año</Label>
              <Input
                id="año"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.año}
                onChange={(e) => handleInputChange("año", e.target.value)}
                placeholder="2020"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Trabajo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Trabajo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tecnico_id">Técnico Asignado</Label>
              <Select value={formData.tecnico_id} onValueChange={(value) => handleInputChange("tecnico_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {loadingTecnicos ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    tecnicos.map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_trabajo">Tipo de Trabajo</Label>
              <Select value={formData.tipo_trabajo} onValueChange={(value) => handleInputChange("tipo_trabajo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="reparacion">Reparación</SelectItem>
                  <SelectItem value="revision">Revisión</SelectItem>
                  <SelectItem value="instalacion">Instalación</SelectItem>
                  <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select value={formData.prioridad} onValueChange={(value) => handleInputChange("prioridad", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="horas_estimadas">Horas Estimadas</Label>
              <Input
                id="horas_estimadas"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.horas_estimadas}
                onChange={(e) => handleInputChange("horas_estimadas", Number.parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Describe detalladamente el trabajo a realizar..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                placeholder="Taller, domicilio del cliente, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange("observaciones", e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Materiales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Materiales</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={agregarMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {materiales.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay materiales agregados</p>
          ) : (
            <div className="space-y-4">
              {materiales.map((material, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Nombre del Material</Label>
                    <Input
                      value={material.nombre}
                      onChange={(e) => actualizarMaterial(index, "nombre", e.target.value)}
                      placeholder="Nombre del material"
                    />
                  </div>
                  <div className="w-24">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={material.cantidad}
                      onChange={(e) => actualizarMaterial(index, "cantidad", e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label>Precio (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={material.precio}
                      onChange={(e) => actualizarMaterial(index, "precio", e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => eliminarMaterial(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Parte"
          )}
        </Button>
      </div>
    </form>
  )
}
