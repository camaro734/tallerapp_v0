"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Download, Upload } from "lucide-react"

const downloadSampleFile = () => {
  const csvContent = `Codigo,Descripcion
MAT-001,Filtro hidráulico HF-35
MAT-002,Aceite hidráulico ISO 46
MAT-003,Junta tórica 50x3mm
MAT-004,Cilindro hidráulico 80/40
MAT-005,Manguera hidráulica 1/2"
MAT-006,Válvula de alivio 210 bar
MAT-007,Racor recto M16x1.5
MAT-008,Bomba hidráulica 25cc
MAT-009,Manómetro 0-250 bar
MAT-010,Aceite hidráulico ISO 68`

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", "ejemplo_materiales.csv")
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function MaterialesPage() {
  const materiales = [
    {
      id: "MAT-001",
      nombre: "Filtro hidráulico HF-35",
      categoria: "Filtros",
    },
    {
      id: "MAT-002",
      nombre: "Aceite hidráulico ISO 46",
      categoria: "Aceites",
    },
    {
      id: "MAT-003",
      nombre: "Junta tórica 50x3mm",
      categoria: "Juntas",
    },
    {
      id: "MAT-004",
      nombre: "Cilindro hidráulico 80/40",
      categoria: "Cilindros",
    },
    {
      id: "MAT-005",
      nombre: 'Manguera hidráulica 1/2"',
      categoria: "Mangueras",
    },
    {
      id: "MAT-006",
      nombre: "Válvula de alivio 210 bar",
      categoria: "Válvulas",
    },
  ]

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materiales</h1>
            <p className="text-gray-600">Gestión de inventario y materiales</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Importar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={downloadSampleFile}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar archivo de ejemplo
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar desde Excel/CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/materiales/nuevo">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Material
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumen de materiales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Materiales</p>
                  <p className="text-xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Categorías</p>
                  <p className="text-xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar materiales por nombre, código o categoría..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Lista de materiales */}
        <div className="space-y-4">
          {materiales.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{material.nombre}</h3>
                      <Badge variant="outline">{material.categoria}</Badge>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Código:</span> {material.id}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Añadir a Parte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
