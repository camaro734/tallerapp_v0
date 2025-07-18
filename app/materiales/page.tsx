import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, AlertTriangle, CheckCircle, Minus, FileSpreadsheet } from "lucide-react"
import Link from "next/link"

export default function MaterialesPage() {
  const materiales = [
    {
      id: "MAT-001",
      nombre: "Filtro hidráulico HF-35",
      categoria: "Filtros",
      stock: 15,
      stockMinimo: 5,
      precio: 45.5,
      proveedor: "Hidráulica Industrial",
      ubicacion: "Estante A-12",
    },
    {
      id: "MAT-002",
      nombre: "Aceite hidráulico ISO 46",
      categoria: "Aceites",
      stock: 3,
      stockMinimo: 10,
      precio: 85.0,
      proveedor: "Lubricantes Pro",
      ubicacion: "Almacén B-05",
    },
    {
      id: "MAT-003",
      nombre: "Junta tórica 50x3mm",
      categoria: "Juntas",
      stock: 50,
      stockMinimo: 20,
      precio: 2.3,
      proveedor: "Juntas y Retenes",
      ubicacion: "Cajón C-08",
    },
    {
      id: "MAT-004",
      nombre: "Cilindro hidráulico 80/40",
      categoria: "Cilindros",
      stock: 2,
      stockMinimo: 3,
      precio: 320.0,
      proveedor: "Hidráulica Industrial",
      ubicacion: "Estante D-15",
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
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importar Excel
            </Button>
            <Link href="/materiales/nuevo">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Material
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumen de stock */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Stock Bajo</p>
                  <p className="text-xl font-bold text-red-600">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Stock OK</p>
                  <p className="text-xl font-bold">148</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold">€25.480</p>
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
                      {material.stock <= material.stockMinimo && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Stock Bajo
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Código:</span> {material.id}
                      </div>
                      <div>
                        <span className="font-medium">Stock:</span> {material.stock} uds
                      </div>
                      <div>
                        <span className="font-medium">Precio:</span> €{material.precio}
                      </div>
                      <div>
                        <span className="font-medium">Proveedor:</span> {material.proveedor}
                      </div>
                      <div>
                        <span className="font-medium">Ubicación:</span> {material.ubicacion}
                      </div>
                      <div>
                        <span className="font-medium">Stock mínimo:</span> {material.stockMinimo} uds
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="flex items-center justify-center min-w-[3rem] text-sm font-medium">
                        {material.stock}
                      </span>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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

        {/* Materiales con stock bajo */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Materiales con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materiales
                .filter((m) => m.stock <= m.stockMinimo)
                .map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div>
                      <p className="font-medium text-red-800">{material.nombre}</p>
                      <p className="text-sm text-red-600">
                        Stock: {material.stock} / Mínimo: {material.stockMinimo}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                      Reabastecer
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
