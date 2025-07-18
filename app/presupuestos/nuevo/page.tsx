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
import { ArrowLeft, Save, Calculator, Plus, Minus } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ConceptoPresupuesto {
  id: string
  descripcion: string
  cantidad: number
  precio_unitario: number
  total: number
}

export default function NuevoPresupuestoPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    cliente_id: "",
    vehiculo_id: "",
    descripcion: "",
    observaciones: "",
    validez_dias: "30",
  })

  const [conceptos, setConceptos] = useState<ConceptoPresupuesto[]>([
    {
      id: "1",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      total: 0,
    },
  ])

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
    router.push("/presupuestos")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creando presupuesto:", { formData, conceptos })
    router.push("/presupuestos")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const agregarConcepto = () => {
    const nuevoConcepto: ConceptoPresupuesto = {
      id: Date.now().toString(),
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      total: 0,
    }
    setConceptos([...conceptos, nuevoConcepto])
  }

  const eliminarConcepto = (id: string) => {
    if (conceptos.length > 1) {
      setConceptos(conceptos.filter((c) => c.id !== id))
    }
  }

  const actualizarConcepto = (id: string, campo: keyof ConceptoPresupuesto, valor: any) => {
    setConceptos(
      conceptos.map((concepto) => {
        if (concepto.id === id) {
          const conceptoActualizado = { ...concepto, [campo]: valor }
          if (campo === "cantidad" || campo === "precio_unitario") {
            conceptoActualizado.total = conceptoActualizado.cantidad * conceptoActualizado.precio_unitario
          }
          return conceptoActualizado
        }
        return concepto
      }),
    )
  }

  const calcularTotal = () => {
    return conceptos.reduce((sum, concepto) => sum + concepto.total, 0)
  }

  const calcularIVA = () => {
    return calcularTotal() * 0.21
  }

  const calcularTotalConIVA = () => {
    return calcularTotal() + calcularIVA()
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/presupuestos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nuevo Presupuesto</h1>
            <p className="text-gray-600">Crear un nuevo presupuesto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Información del Presupuesto
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
                  <Label htmlFor="validez">Validez (días)</Label>
                  <Input
                    id="validez"
                    type="number"
                    value={formData.validez_dias}
                    onChange={(e) => handleInputChange("validez_dias", e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción General</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Descripción general del presupuesto..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conceptos del Presupuesto</span>
                <Button type="button" variant="outline" size="sm" onClick={agregarConcepto}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Concepto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conceptos.map((concepto, index) => (
                <div key={concepto.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Concepto {index + 1}</h4>
                    {conceptos.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => eliminarConcepto(concepto.id)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label>Descripción *</Label>
                      <Input
                        value={concepto.descripcion}
                        onChange={(e) => actualizarConcepto(concepto.id, "descripcion", e.target.value)}
                        placeholder="Descripción del concepto"
                        required
                      />
                    </div>
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={concepto.cantidad}
                        onChange={(e) =>
                          actualizarConcepto(concepto.id, "cantidad", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label>Precio Unitario (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={concepto.precio_unitario}
                        onChange={(e) =>
                          actualizarConcepto(concepto.id, "precio_unitario", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-right">
                    <span className="font-medium">Total: €{concepto.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{calcularTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span>€{calcularIVA().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>€{calcularTotalConIVA().toFixed(2)}</span>
                  </div>
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
                placeholder="Observaciones adicionales, condiciones, etc."
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="industrial-button text-white">
              <Save className="h-4 w-4 mr-2" />
              Crear Presupuesto
            </Button>
            <Link href="/presupuestos">
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
