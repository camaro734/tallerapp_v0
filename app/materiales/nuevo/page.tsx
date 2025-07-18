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
import { ArrowLeft, Save, Package } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NuevoMaterialPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    codigo_interno: "",
    precio_compra: "",
    precio_venta: "",
    stock_minimo: "",
    stock_actual: "",
    proveedor: "",
    ubicacion_almacen: "",
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
    router.push("/materiales")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creando material:", formData)
    router.push("/materiales")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/materiales">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nuevo Material</h1>
            <p className="text-gray-600">Añadir un nuevo material al inventario</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Material *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Ej: Filtro hidráulico HF-35"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="codigo_interno">Código Interno</Label>
                  <Input
                    id="codigo_interno"
                    value={formData.codigo_interno}
                    onChange={(e) => handleInputChange("codigo_interno", e.target.value)}
                    placeholder="Ej: MAT-001"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filtros">Filtros</SelectItem>
                      <SelectItem value="aceites">Aceites y Lubricantes</SelectItem>
                      <SelectItem value="juntas">Juntas y Retenes</SelectItem>
                      <SelectItem value="mangueras">Mangueras</SelectItem>
                      <SelectItem value="valvulas">Válvulas</SelectItem>
                      <SelectItem value="bombas">Bombas</SelectItem>
                      <SelectItem value="cilindros">Cilindros</SelectItem>
                      <SelectItem value="herramientas">Herramientas</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Select value={formData.proveedor} onValueChange={(value) => handleInputChange("proveedor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hidraulica_norte">Hidráulica Norte S.L.</SelectItem>
                      <SelectItem value="suministros_garcia">Suministros García</SelectItem>
                      <SelectItem value="repuestos_madrid">Repuestos Madrid</SelectItem>
                      <SelectItem value="industrial_lopez">Industrial López</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Descripción detallada del material, especificaciones técnicas..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>Precios y Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precio_compra">Precio de Compra (€)</Label>
                  <Input
                    id="precio_compra"
                    type="number"
                    step="0.01"
                    value={formData.precio_compra}
                    onChange={(e) => handleInputChange("precio_compra", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="precio_venta">Precio de Venta (€)</Label>
                  <Input
                    id="precio_venta"
                    type="number"
                    step="0.01"
                    value={formData.precio_venta}
                    onChange={(e) => handleInputChange("precio_venta", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="stock_actual">Stock Actual</Label>
                  <Input
                    id="stock_actual"
                    type="number"
                    value={formData.stock_actual}
                    onChange={(e) => handleInputChange("stock_actual", e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                  <Input
                    id="stock_minimo"
                    type="number"
                    value={formData.stock_minimo}
                    onChange={(e) => handleInputChange("stock_minimo", e.target.value)}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="ubicacion_almacen">Ubicación en Almacén</Label>
                  <Input
                    id="ubicacion_almacen"
                    value={formData.ubicacion_almacen}
                    onChange={(e) => handleInputChange("ubicacion_almacen", e.target.value)}
                    placeholder="Ej: Estantería A-3, Nivel 2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.observaciones}
                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                placeholder="Observaciones adicionales, notas especiales..."
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="industrial-button text-white">
              <Save className="h-4 w-4 mr-2" />
              Crear Material
            </Button>
            <Link href="/materiales">
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
